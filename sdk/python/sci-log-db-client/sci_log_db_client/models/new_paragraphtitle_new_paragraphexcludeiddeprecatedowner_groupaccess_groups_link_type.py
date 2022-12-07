from enum import Enum


class NewParagraphtitleNewParagraphexcludeiddeprecatedownerGroupaccessGroupsLinkType(str, Enum):
    PARAGRAPH = "paragraph"
    COMMENT = "comment"
    QUOTE = "quote"

    def __str__(self) -> str:
        return str(self.value)
