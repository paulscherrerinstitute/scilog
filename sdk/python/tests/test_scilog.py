import os
from unittest import mock

import pytest

from scilog import Basesnippet, LogbookMessage, SciLog
from scilog.scilog import SciLogCore


def test_send_logbook_message():
    msg = LogbookMessage()
    msg.add_text("some text")
    log = SciLog("fake_url")
    with mock.patch.object(log.core, "post_snippet") as mock_post_snippet:
        log.send_logbook_message(msg)
        mock_post_snippet.assert_called_with(
            linkType="paragraph", textcontent="<p>some text</p>", snippetType="paragraph"
        )


class SciLogMock:
    http_client = mock.MagicMock()
    logbook = Basesnippet.from_dict({"id": "logbook_id"})


def test_post_snippet():
    core = SciLogCore(SciLogMock())
    core.post_snippet(textcontent="test")
    core.http_client.post_request.assert_called_with(
        core.http_client.address + "/basesnippets",
        payload={"parentId": "logbook_id", "textcontent": "test"},
        headers={"Content-type": "application/json", "Accept": "application/json"},
    )


def test_send_logbook_message_data():
    msg = LogbookMessage()
    msg.add_text("some text")
    log = SciLog("fake_url")
    log.core = SciLogCore(SciLogMock())
    log.send_logbook_message(msg)
    log.core.http_client.post_request.assert_called_with(
        log.core.http_client.address + "/basesnippets",
        payload={
            "snippetType": "paragraph",
            "parentId": "logbook_id",
            "textcontent": "<p>some text</p>",
            "linkType": "paragraph",
        },
        headers={"Content-type": "application/json", "Accept": "application/json"},
    )


def test_send_message_data():
    log = SciLog("fake_url")
    log.core = SciLogCore(SciLogMock())
    log.send_message("some text")
    log.core.http_client.post_request.assert_called_with(
        log.core.http_client.address + "/basesnippets",
        payload={
            "snippetType": "paragraph",
            "parentId": "logbook_id",
            "textcontent": "<p>some text</p>",
            "linkType": "paragraph",
        },
        headers={"Content-type": "application/json", "Accept": "application/json"},
    )


@pytest.mark.parametrize("filepath,fsnippet", [("./test_file.png", None)])
def test_prepare_file_content_image(filepath, fsnippet):
    core = SciLogCore(SciLogMock())
    info, textcontent = core.prepare_file_content(filepath, fsnippet)
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
def test_prepare_file_content_file(filepath, fsnippet):
    core = SciLogCore(SciLogMock())
    info, textcontent = core.prepare_file_content(filepath, fsnippet)
    assert isinstance(info["fileHash"], str)
    assert len(info["fileHash"]) > 5
    assert info["filepath"] == filepath
    assert info["fileExtension"] == "file/pdf"
    assert info["fileId"] is None

    assert (
        textcontent
        == f'<p><a class="fileLink" target="_blank" href="file:{info["fileHash"]}">{os.path.basename(filepath)}</a></p>'
    )
