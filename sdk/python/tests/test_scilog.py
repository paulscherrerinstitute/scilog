import json
import os
from unittest import mock

import pytest

from scilog import LogbookMessage, SciLog
from scilog.authmixin import HEADER_JSON
from scilog.models import Filesnippet, Logbook, Paragraph


@pytest.fixture()
def scilog():
    log = SciLog("fake_url")
    log.logbook = Logbook(id="logbook_id_test")
    return log


def test_send_logbook_message(scilog):
    log = scilog
    msg = LogbookMessage()
    msg.add_text("some text")

    with mock.patch.object(log.core, "post_snippet") as mock_post_snippet:
        log.send_logbook_message(msg)
        mock_post_snippet.assert_called_with(
            linkType="paragraph", textcontent="<p>some text</p>", snippetType="paragraph"
        )


def test_send_logbook_message_with_file(scilog, tmpdir):
    log = scilog
    test_file = tmpdir.join("test_file.png")
    test_file.write("test content")
    msg = LogbookMessage()
    msg.add_file(str(test_file))
    msg.add_text("some text")

    with mock.patch.object(log.http_client, "post_request") as post_request:
        post_request.side_effect = [
            {"snippetType": "image", "id": "file1", "accessHash": "hash1"},
            {"snippetType": "paragraph", "id": "para1"},
        ]
        log.send_logbook_message(msg)

    assert post_request.call_count == 2

    file_call = post_request.call_args_list[0]
    snippet_call = post_request.call_args_list[1]

    assert file_call.args[0] == log.http_client.address + "/filesnippet/files"
    assert file_call.kwargs["headers"] == {"Accept": "application/json"}

    assert snippet_call.args[0] == log.http_client.address + "/basesnippets"
    payload = snippet_call.kwargs["payload"]
    assert snippet_call.kwargs["headers"] == HEADER_JSON
    assert payload["linkType"] == "paragraph"
    assert payload["snippetType"] == "paragraph"
    assert "figure" in payload["textcontent"]
    assert "img src" in payload["textcontent"]
    assert payload["files"][0]["fileId"] == "file1"
    assert payload["files"][0]["accessHash"] == "hash1"
    assert "filepath" not in payload["files"][0]


def test_post_snippet(scilog):
    log = scilog
    with mock.patch.object(log.http_client, "post_request") as post_request:
        log.core.post_snippet(textcontent="test")
        post_request.assert_called_with(
            log.http_client.address + "/basesnippets",
            payload={"parentId": "logbook_id_test", "textcontent": "test"},
            headers={"Content-type": "application/json", "Accept": "application/json"},
        )


def test_post_location(scilog):
    log = scilog
    with mock.patch.object(log.http_client, "post_request") as post_request:
        log.core.post_location(name="loc")
        post_request.assert_called_with(
            log.http_client.address + "/basesnippets",
            payload={"parentId": "logbook_id_test", "name": "loc"},
            headers={"Content-type": "application/json", "Accept": "application/json"},
        )


def test_send_logbook_message_data(scilog):
    log = scilog

    msg = LogbookMessage()
    msg.add_text("some text")

    with mock.patch.object(log.http_client, "post_request") as post_request:
        log.send_logbook_message(msg)
        post_request.assert_called_with(
            log.core.http_client.address + "/basesnippets",
            payload={
                "snippetType": "paragraph",
                "parentId": "logbook_id_test",
                "textcontent": "<p>some text</p>",
                "linkType": "paragraph",
            },
            headers={"Content-type": "application/json", "Accept": "application/json"},
        )


def test_send_message_data(scilog):
    log = scilog
    with mock.patch.object(log.http_client, "post_request") as post_request:
        log.send_message("some text")
        post_request.assert_called_with(
            log.core.http_client.address + "/basesnippets",
            payload={
                "snippetType": "paragraph",
                "parentId": "logbook_id_test",
                "textcontent": "<p>some text</p>",
                "linkType": "paragraph",
            },
            headers={"Content-type": "application/json", "Accept": "application/json"},
        )


@pytest.mark.parametrize("filepath,fsnippet", [("./test_file.png", None)])
def test_prepare_file_content_image(scilog, filepath, fsnippet):
    log = scilog
    info, textcontent = log.core.prepare_file_content(filepath, fsnippet)
    assert isinstance(info["fileHash"], str)
    assert len(info["fileHash"]) > 5
    assert info["filepath"] == filepath
    assert info["fileExtension"] == "image/png"
    assert info["fileId"] is None
    assert info["style"] == {"width": "82.25%", "height": ""}

    assert (
        textcontent
        == f'<figure class="image image_resized"><img src="" title="{info["fileHash"]}"></figure>'
    )


@pytest.mark.parametrize("filepath,fsnippet", [("./test_file.pdf", None)])
def test_prepare_file_content_file(scilog, filepath, fsnippet):
    log = scilog
    info, textcontent = log.core.prepare_file_content(filepath, fsnippet)
    assert isinstance(info["fileHash"], str)
    assert len(info["fileHash"]) > 5
    assert info["filepath"] == filepath
    assert info["fileExtension"] == "file/pdf"
    assert info["fileId"] is None

    assert (
        textcontent
        == f'<p><a class="fileLink" target="_blank" href="file:{info["fileHash"]}">{os.path.basename(filepath)}</a></p>'
    )


def test_patch_snippet_updates_and_calls_http(scilog):
    log = scilog
    snippet = Paragraph(
        id="snippet_id",
        parentId="logbook_id_test",
        textcontent="updated",
        createdAt="2024-01-01",
        createdBy="user",
        updatedAt="2024-01-02",
        updatedBy="user",
    )
    response = {"snippetType": "paragraph", "id": "updated_id", "textcontent": "updated"}

    with mock.patch.object(
        log.http_client, "patch_request", return_value=response
    ) as patch_request:
        result = log.core.patch_snippet(snippet)

    assert isinstance(result, Paragraph)
    patch_request.assert_called_once()
    (url,) = patch_request.call_args.args
    payload = patch_request.call_args.kwargs["payload"]
    headers = patch_request.call_args.kwargs["headers"]

    assert url == log.http_client.address + "/basesnippets/snippet_id"
    assert headers == HEADER_JSON
    assert payload["snippetType"] == "paragraph"
    assert payload["parentId"] == "logbook_id_test"
    assert payload["textcontent"] == "updated"
    assert "id" not in payload
    assert "createdAt" not in payload
    assert "createdBy" not in payload
    assert "updatedAt" not in payload
    assert "updatedBy" not in payload


def test_append_files_to_snippet_calls_patch(scilog):
    log = scilog
    snippet = Paragraph(textcontent="start")
    fsnippet = Filesnippet(id="file1", accessHash="hash1")

    with mock.patch.object(log.core, "post_file", return_value=fsnippet) as post_file:
        with mock.patch.object(log.core, "patch_snippet", return_value=snippet) as patch_snippet:
            result = log.core.append_files_to_snippet(snippet, ["/tmp/test.png"])

    assert result is snippet
    post_file.assert_called_once_with("/tmp/test.png")
    patch_snippet.assert_called_once_with(snippet)
    assert isinstance(snippet.files, list)
    assert snippet.files[0]["fileId"] == "file1"
    assert snippet.files[0]["accessHash"] == "hash1"
    assert "figure" in snippet.textcontent


def test_get_logbooks_with_kwargs_builds_filter_and_calls_http(scilog):
    log = scilog
    response = [
        {"snippetType": "logbook", "id": "log1", "name": "Log 1"},
        {"snippetType": "logbook", "id": "log2", "name": "Log 2"},
    ]

    with mock.patch.object(log.http_client, "get_request", return_value=response) as get_request:
        result = log.get_logbooks(name="test")

    assert isinstance(result, list)
    assert all(isinstance(item, Logbook) for item in result)

    get_request.assert_called_once()
    (url,) = get_request.call_args.args
    params = get_request.call_args.kwargs["params"]
    headers = get_request.call_args.kwargs["headers"]

    assert url == log.http_client.address + "/logbooks"
    assert headers == HEADER_JSON
    filt = json.loads(params["filter"])
    assert filt == {"where": {"and": [{"name": "test"}]}}


def test_get_logbooks_with_where_calls_http(scilog):
    log = scilog
    response = {"snippetType": "logbook", "id": "log1", "name": "Log 1"}
    where = {"name": "test"}

    with mock.patch.object(log.http_client, "get_request", return_value=response) as get_request:
        result = log.get_logbooks(where=where, limit=2)

    assert isinstance(result, Logbook)

    get_request.assert_called_once()
    (url,) = get_request.call_args.args
    params = get_request.call_args.kwargs["params"]
    headers = get_request.call_args.kwargs["headers"]

    assert url == log.http_client.address + "/logbooks"
    assert headers == HEADER_JSON
    filt = json.loads(params["filter"])
    assert filt == {"where": where, "limit": 2}


def test_get_snippets_with_kwargs_calls_http(scilog):
    log = scilog
    response = {"snippetType": "paragraph", "id": "p1", "textcontent": "text"}

    with mock.patch.object(log.http_client, "get_request", return_value=response) as get_request:
        result = log.get_snippets(textcontent="text")

    assert isinstance(result, Paragraph)

    get_request.assert_called_once()
    (url,) = get_request.call_args.args
    params = get_request.call_args.kwargs["params"]
    headers = get_request.call_args.kwargs["headers"]

    assert url == log.http_client.address + "/basesnippets"
    assert headers == HEADER_JSON
    filt = json.loads(params["filter"])
    assert filt == {"where": {"and": [{"textcontent": "text", "parentId": "logbook_id_test"}]}}
