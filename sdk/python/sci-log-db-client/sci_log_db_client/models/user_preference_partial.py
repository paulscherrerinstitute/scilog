from typing import TYPE_CHECKING, Any, Dict, List, Type, TypeVar, Union

import attr

from ..types import UNSET, Unset

if TYPE_CHECKING:
  from ..models.collection import Collection




T = TypeVar("T", bound="UserPreferencePartial")

@attr.s(auto_attribs=True)
class UserPreferencePartial:
    """(tsType: Partial<UserPreference>, schemaOptions: { partial: true })

    Attributes:
        id (Union[Unset, str]):
        user_id (Union[Unset, str]):
        collections (Union[Unset, List['Collection']]):
    """

    id: Union[Unset, str] = UNSET
    user_id: Union[Unset, str] = UNSET
    collections: Union[Unset, List['Collection']] = UNSET
    additional_properties: Dict[str, Any] = attr.ib(init=False, factory=dict)


    def to_dict(self) -> Dict[str, Any]:
        id = self.id
        user_id = self.user_id
        collections: Union[Unset, List[Dict[str, Any]]] = UNSET
        if not isinstance(self.collections, Unset):
            collections = []
            for collections_item_data in self.collections:
                collections_item = collections_item_data.to_dict()

                collections.append(collections_item)





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
        from ..models.collection import Collection
        d = src_dict.copy()
        id = d.pop("id", UNSET)

        user_id = d.pop("userId", UNSET)

        collections = []
        _collections = d.pop("collections", UNSET)
        for collections_item_data in (_collections or []):
            collections_item = Collection.from_dict(collections_item_data)



            collections.append(collections_item)


        user_preference_partial = cls(
            id=id,
            user_id=user_id,
            collections=collections,
        )

        user_preference_partial.additional_properties = d
        return user_preference_partial

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
