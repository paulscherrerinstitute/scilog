from typing import Any, Dict, List, Type, TypeVar

import attr

T = TypeVar("T", bound="NewParagraphtitleNewParagraphexcludeiddeprecatedownerGroupaccessGroupsFiles")

@attr.s(auto_attribs=True)
class NewParagraphtitleNewParagraphexcludeiddeprecatedownerGroupaccessGroupsFiles:
    """Information about the embedded files.

    """

    additional_properties: Dict[str, Any] = attr.ib(init=False, factory=dict)


    def to_dict(self) -> Dict[str, Any]:
        
        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })

        return field_dict



    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        new_paragraphtitle_new_paragraphexcludeiddeprecatedowner_groupaccess_groups_files = cls(
        )

        new_paragraphtitle_new_paragraphexcludeiddeprecatedowner_groupaccess_groups_files.additional_properties = d
        return new_paragraphtitle_new_paragraphexcludeiddeprecatedowner_groupaccess_groups_files

    @property
    def additional_keys(self) -> List[str]:
        return list(self.additional_properties.keys())

    def __getitem__(self, key: str) -> Any:
        return self.additional_properties[key]

    def __setitem__(self, key: str, value: Any) -> None:
        self.additional_properties[key] = value

    def __delitem__(self, key: str) -> None:
        del self.additional_properties[key]

    def __contains__(self, key: str) -> bool:
        return key in self.additional_properties
