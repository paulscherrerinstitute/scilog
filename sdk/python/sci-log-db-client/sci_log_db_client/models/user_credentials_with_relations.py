from typing import TYPE_CHECKING, Any, Dict, Type, TypeVar, Union

import attr

from ..types import UNSET, Unset

if TYPE_CHECKING:
  from ..models.user_with_relations import UserWithRelations




T = TypeVar("T", bound="UserCredentialsWithRelations")

@attr.s(auto_attribs=True)
class UserCredentialsWithRelations:
    """(tsType: UserCredentialsWithRelations, schemaOptions: { includeRelations: true })

    Attributes:
        password (str):
        id (Union[Unset, str]):
        user_id (Union[Unset, str]):
        user (Union[Unset, UserWithRelations]): (tsType: UserWithRelations, schemaOptions: { includeRelations: true })
    """

    password: str
    id: Union[Unset, str] = UNSET
    user_id: Union[Unset, str] = UNSET
    user: Union[Unset, 'UserWithRelations'] = UNSET


    def to_dict(self) -> Dict[str, Any]:
        password = self.password
        id = self.id
        user_id = self.user_id
        user: Union[Unset, Dict[str, Any]] = UNSET
        if not isinstance(self.user, Unset):
            user = self.user.to_dict()


        field_dict: Dict[str, Any] = {}
        field_dict.update({
            "password": password,
        })
        if id is not UNSET:
            field_dict["id"] = id
        if user_id is not UNSET:
            field_dict["userId"] = user_id
        if user is not UNSET:
            field_dict["user"] = user

        return field_dict



    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        from ..models.user_with_relations import UserWithRelations
        d = src_dict.copy()
        password = d.pop("password")

        id = d.pop("id", UNSET)

        user_id = d.pop("userId", UNSET)

        _user = d.pop("user", UNSET)
        user: Union[Unset, UserWithRelations]
        if isinstance(_user,  Unset):
            user = UNSET
        else:
            user = UserWithRelations.from_dict(_user)




        user_credentials_with_relations = cls(
            password=password,
            id=id,
            user_id=user_id,
            user=user,
        )

        return user_credentials_with_relations

