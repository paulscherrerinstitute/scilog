from typing import TYPE_CHECKING, Any, Dict, List, Type, TypeVar, Union

import attr

from ..types import UNSET, Unset

if TYPE_CHECKING:
  from ..models.collection_with_relations import CollectionWithRelations
  from ..models.user_with_relations import UserWithRelations




T = TypeVar("T", bound="UserPreferenceWithRelations")

@attr.s(auto_attribs=True)
class UserPreferenceWithRelations:
    """(tsType: UserPreferenceWithRelations, schemaOptions: { includeRelations: true })

    Attributes:
        id (Union[Unset, str]):
        user_id (Union[Unset, str]):
        collections (Union[Unset, List['CollectionWithRelations']]):
        user (Union[Unset, UserWithRelations]): (tsType: UserWithRelations, schemaOptions: { includeRelations: true })
    """

    id: Union[Unset, str] = UNSET
    user_id: Union[Unset, str] = UNSET
    collections: Union[Unset, List['CollectionWithRelations']] = UNSET
    user: Union[Unset, 'UserWithRelations'] = UNSET
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




        user: Union[Unset, Dict[str, Any]] = UNSET
        if not isinstance(self.user, Unset):
            user = self.user.to_dict()


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
        if user is not UNSET:
            field_dict["user"] = user

        return field_dict



    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        from ..models.collection_with_relations import CollectionWithRelations
        from ..models.user_with_relations import UserWithRelations
        d = src_dict.copy()
        id = d.pop("id", UNSET)

        user_id = d.pop("userId", UNSET)

        collections = []
        _collections = d.pop("collections", UNSET)
        for collections_item_data in (_collections or []):
            collections_item = CollectionWithRelations.from_dict(collections_item_data)



            collections.append(collections_item)


        _user = d.pop("user", UNSET)
        user: Union[Unset, UserWithRelations]
        if isinstance(_user,  Unset):
            user = UNSET
        else:
            user = UserWithRelations.from_dict(_user)




        user_preference_with_relations = cls(
            id=id,
            user_id=user_id,
            collections=collections,
            user=user,
        )

        user_preference_with_relations.additional_properties = d
        return user_preference_with_relations

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
