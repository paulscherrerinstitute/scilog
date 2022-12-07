from typing import TYPE_CHECKING, Any, Dict, List, Type, TypeVar, Union

import attr

from ..types import UNSET, Unset

if TYPE_CHECKING:
  from ..models.collection_excluding_id import CollectionExcludingId




T = TypeVar("T", bound="NewUserPreference")

@attr.s(auto_attribs=True)
class NewUserPreference:
    """(tsType: Omit<UserPreference, 'id'>, schemaOptions: { title: 'NewUserPreference', exclude: [ 'id' ] })

    Attributes:
        user_id (Union[Unset, str]):
        collections (Union[Unset, List['CollectionExcludingId']]):
    """

    user_id: Union[Unset, str] = UNSET
    collections: Union[Unset, List['CollectionExcludingId']] = UNSET
    additional_properties: Dict[str, Any] = attr.ib(init=False, factory=dict)


    def to_dict(self) -> Dict[str, Any]:
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
        if user_id is not UNSET:
            field_dict["userId"] = user_id
        if collections is not UNSET:
            field_dict["collections"] = collections

        return field_dict



    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        from ..models.collection_excluding_id import CollectionExcludingId
        d = src_dict.copy()
        user_id = d.pop("userId", UNSET)

        collections = []
        _collections = d.pop("collections", UNSET)
        for collections_item_data in (_collections or []):
            collections_item = CollectionExcludingId.from_dict(collections_item_data)



            collections.append(collections_item)


        new_user_preference = cls(
            user_id=user_id,
            collections=collections,
        )

        new_user_preference.additional_properties = d
        return new_user_preference

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
