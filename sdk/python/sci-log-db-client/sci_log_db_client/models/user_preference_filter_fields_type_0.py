from typing import Any, Dict, List, Type, TypeVar, Union

import attr

from ..types import UNSET, Unset

T = TypeVar("T", bound="UserPreferenceFilterFieldsType0")

@attr.s(auto_attribs=True)
class UserPreferenceFilterFieldsType0:
    """
    Attributes:
        id (Union[Unset, bool]):
        user_id (Union[Unset, bool]):
        collections (Union[Unset, bool]):
    """

    id: Union[Unset, bool] = UNSET
    user_id: Union[Unset, bool] = UNSET
    collections: Union[Unset, bool] = UNSET
    additional_properties: Dict[str, Any] = attr.ib(init=False, factory=dict)


    def to_dict(self) -> Dict[str, Any]:
        id = self.id
        user_id = self.user_id
        collections = self.collections

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if id is not UNSET:
            field_dict["id"] = id
        if user_id is not UNSET:
            field_dict["userId"] = user_id
        if collections is not UNSET:
            field_dict["collections"] = collections

        return field_dict



    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        id = d.pop("id", UNSET)

        user_id = d.pop("userId", UNSET)

        collections = d.pop("collections", UNSET)

        user_preference_filter_fields_type_0 = cls(
            id=id,
            user_id=user_id,
            collections=collections,
        )

        user_preference_filter_fields_type_0.additional_properties = d
        return user_preference_filter_fields_type_0

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
