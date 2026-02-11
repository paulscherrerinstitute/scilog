from __future__ import annotations

import os
from typing import TYPE_CHECKING, List, Union

from typeguard import typechecked

from .models import Paragraph
from .scilog import SciLogCore

if TYPE_CHECKING:
    from .scilog import SciLog


class LogbookMessage:
    """Class to assist users in composing logbook messages.

    Examples:
        >>> msg = LogbookMessage()
        >>> msg.add_text("First paragraph").add_file("<path_to_the_file>").add_text("Second paragraph below the file")

    """

    def __init__(self, logbook: SciLog | None = None, **kwargs):
        self._content = Paragraph(**kwargs)
        self._logbook = logbook

    @typechecked
    def add_text(self, msg: str):
        """Add text to the paragraph. If the text does not start with
        an html tag '<', it will be automatically embedded in a paragraph <p></p>.

        Args:
            msg (str): Text that ought to be added to the paragraph.

        Returns:
            LogbookMessage: The current logbook message.
        """
        if not msg.startswith("<"):
            msg = f"<p>{msg}</p>"

        if self._content.textcontent:
            self._content.textcontent += msg
        else:
            self._content.textcontent = msg
        return self

    @typechecked
    def add_file(self, file_path: str):
        """Insert a file into the logbook message.

        Args:
            file_path (str): Full path to the file that ought to be added.

        Returns:
            LogbookMessage: The current logbook message.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File {file_path} could not be found.")
        file_info, textcontent = SciLogCore.prepare_file_content(file_path)
        if self._content.files:
            self._content.files.append(file_info)
        else:
            self._content.files = [file_info]
        self.add_text(textcontent)
        return self

    @typechecked
    def add_tag(self, tag: Union[List[str], str]):
        """Add tags to the logbook message.

        Args:
            tag (List[str]): List of tags.

        Returns:
            LogbookMessage: The current logbook message.
        """
        if not isinstance(tag, list):
            tag = [tag]
        if self._content.tags:
            self._content.tags.extend(tag)
        else:
            self._content.tags = tag
        return self

    def send(self):
        """Send the logbook message to the SciLog server. The logbook message must be associated with a logbook instance.

        Raises:
            ValueError: If the logbook message is not associated with a logbook instance.
        """
        if not self._logbook:
            raise ValueError(
                "LogbookMessage must be associated with a logbook instance to be sent."
            )
        self._logbook.send_logbook_message(self)
