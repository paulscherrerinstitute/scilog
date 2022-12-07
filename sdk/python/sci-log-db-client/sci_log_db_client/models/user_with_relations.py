from typing import TYPE_CHECKING, Any, Dict, List, Type, TypeVar, Union, cast

import attr

from ..types import UNSET, Unset

if TYPE_CHECKING:
  from ..models.user_credentials_with_relations import UserCredentialsWithRelations




T = TypeVar("T", bound="UserWithRelations")

@attr.s(auto_attribs=True)
class UserWithRelations:
    """(tsType: UserWithRelations, schemaOptions: { includeRelations: true })

    Attributes:
        email (str):
        id (Union[Unset, str]):
        first_name (Union[Unset, str]):
        last_name (Union[Unset, str]):
        username (Union[Unset, str]):
        roles (Union[Unset, List[str]]):
        location (Union[Unset, str]):
        unx_group (Union[Unset, str]):
        user_credentials (Union[Unset, UserCredentialsWithRelations]): (tsType: UserCredentialsWithRelations,
            schemaOptions: { includeRelations: true })
    """

    email: str
    id: Union[Unset, str] = UNSET
    first_name: Union[Unset, str] = UNSET
    last_name: Union[Unset, str] = UNSET
    username: Union[Unset, str] = UNSET
    roles: Union[Unset, List[str]] = UNSET
    location: Union[Unset, str] = UNSET
    unx_group: Union[Unset, str] = UNSET
    user_credentials: Union[Unset, 'UserCredentialsWithRelations'] = UNSET


    def to_dict(self) -> Dict[str, Any]:
        email = self.email
        id = self.id
        first_name = self.first_name
        last_name = self.last_name
        username = self.username
        roles: Union[Unset, List[str]] = UNSET
        if not isinstance(self.roles, Unset):
            roles = self.roles




        location = self.location
        unx_group = self.unx_group
        user_credentials: Union[Unset, Dict[str, Any]] = UNSET
        if not isinstance(self.user_credentials, Unset):
            user_credentials = self.user_credentials.to_dict()


        field_dict: Dict[str, Any] = {}
        field_dict.update({
            "email": email,
        })
        if id is not UNSET:
            field_dict["id"] = id
        if first_name is not UNSET:
            field_dict["firstName"] = first_name
        if last_name is not UNSET:
            field_dict["lastName"] = last_name
        if username is not UNSET:
            field_dict["username"] = username
        if roles is not UNSET:
            field_dict["roles"] = roles
        if location is not UNSET:
            field_dict["location"] = location
        if unx_group is not UNSET:
            field_dict["unxGroup"] = unx_group
        if user_credentials is not UNSET:
            field_dict["userCredentials"] = user_credentials

        return field_dict



    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        from ..models.user_credentials_with_relations import UserCredentialsWithRelations
        d = src_dict.copy()
        email = d.pop("email")

        id = d.pop("id", UNSET)

        first_name = d.pop("firstName", UNSET)

        last_name = d.pop("lastName", UNSET)

        username = d.pop("username", UNSET)

        roles = cast(List[str], d.pop("roles", UNSET))


        location = d.pop("location", UNSET)

        unx_group = d.pop("unxGroup", UNSET)

        _user_credentials = d.pop("userCredentials", UNSET)
        user_credentials: Union[Unset, UserCredentialsWithRelations]
        if isinstance(_user_credentials,  Unset):
            user_credentials = UNSET
        else:
            user_credentials = UserCredentialsWithRelations.from_dict(_user_credentials)




        user_with_relations = cls(
            email=email,
            id=id,
            first_name=first_name,
            last_name=last_name,
            username=username,
            roles=roles,
            location=location,
            unx_group=unx_group,
            user_credentials=user_credentials,
        )

        return user_with_relations

