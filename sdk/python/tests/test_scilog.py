from unittest import mock

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
    log.send_message("msg")
    log.core.http_client.post_request.assert_called_with(
        log.core.http_client.address + "/basesnippets",
        payload={"parentId": "logbook_id", "textcontent": "msg", "snippetType": "paragraph"},
        headers={"Content-type": "application/json", "Accept": "application/json"},
    )
