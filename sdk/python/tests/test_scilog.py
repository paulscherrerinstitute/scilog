import os
from unittest import mock

import pytest

from scilog import Basesnippet, LogbookMessage, SciLog


@pytest.fixture()
def scilog():
    log = SciLog("fake_url")
    log.logbook = Basesnippet.from_dict({"id": "logbook_id_test"})
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


def test_post_snippet(scilog):
    log = scilog
    with mock.patch.object(log.http_client, "post_request") as post_request:
        log.core.post_snippet(textcontent="test")
        post_request.assert_called_with(
            log.http_client.address + "/basesnippets",
            payload={"parentId": "logbook_id_test", "textcontent": "test"},
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
