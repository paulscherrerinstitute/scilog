from typing import Any, Dict, List, Type, TypeVar

import attr

T = TypeVar("T", bound="ViewGroupsCompatibledeprecatedownerGroupaccessGroupsConfiguration")

@attr.s(auto_attribs=True)
class ViewGroupsCompatibledeprecatedownerGroupaccessGroupsConfiguration:
    """JSON object defining the details of the view, e.g. which filter parameters to be used in navigation and which
presentation types, like table, grid etc should be used.

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
        view_groups_compatibledeprecatedowner_groupaccess_groups_configuration = cls(
        )

        view_groups_compatibledeprecatedowner_groupaccess_groups_configuration.additional_properties = d
        return view_groups_compatibledeprecatedowner_groupaccess_groups_configuration

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
