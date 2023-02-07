from unittest.mock import patch

from scilog import LogbookMessage, SciLog


@patch.object(SciLog, "post_snippet")
def test_send_logbook_message(mock_post_snippet):
    msg = LogbookMessage()
    msg.add_text("some text")
    log = SciLog("fake_url")
    log.send_logbook_message(msg)
    mock_post_snippet.assert_called_with(
        linkType="paragraph", textcontent="<p>some text</p>", snippetType="paragraph"
    )
