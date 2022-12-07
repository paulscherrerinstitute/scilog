from enum import Enum


class ParagraphGroupsCompatiblepartialtruedeprecatedownerGroupaccessGroupsLinkType(str, Enum):
    PARAGRAPH = "paragraph"
    COMMENT = "comment"
    QUOTE = "quote"

    def __str__(self) -> str:
        return str(self.value)
