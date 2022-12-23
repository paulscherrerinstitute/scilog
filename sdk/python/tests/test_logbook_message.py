from unittest import mock

import pytest

from scilog import LogbookMessage


@pytest.mark.parametrize(
    "input_text,out_textcontent",
    [([""], "<p></p>"), (["text 1", "text 2"], "<p>text 1</p><p>text 2</p>")],
)
def test_add_text(input_text, out_textcontent):
    msg = LogbookMessage()
    for text in input_text:
        msg.add_text(text)
    assert msg._content.textcontent == out_textcontent


def test_add_file():
    msg = LogbookMessage()
    with pytest.raises(FileNotFoundError):
        msg.add_file("test_file.png")

    with mock.patch("os.path.exists", return_value=True):
        msg.add_file("test_file.png")
        assert msg._content.files[0]["filepath"] == "test_file.png"
        msg.add_file("test_file2.png")
        assert msg._content.files[1]["filepath"] == "test_file2.png"


@pytest.mark.parametrize("tags", ["tag1", ["tag1", "tag2"]])
def test_add_tag(tags):
    msg = LogbookMessage()
    msg.add_tag(tags)
    if not isinstance(tags, list):
        tags = [tags]
    assert set(msg._content.tags) & set(tags)
    msg.add_tag("tag3")
    assert msg._content.tags[-1] == "tag3"
