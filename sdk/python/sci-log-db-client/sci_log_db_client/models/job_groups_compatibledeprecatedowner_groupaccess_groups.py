import datetime
from typing import TYPE_CHECKING, Any, Dict, List, Type, TypeVar, Union, cast

import attr
from dateutil.parser import isoparse

from ..types import UNSET, Unset

if TYPE_CHECKING:
  from ..models.job_groups_compatibledeprecatedowner_groupaccess_groups_params import (
      JobGroupsCompatibledeprecatedownerGroupaccessGroupsParams,
  )




T = TypeVar("T", bound="JobGroupsCompatibledeprecatedownerGroupaccessGroups")

@attr.s(auto_attribs=True)
class JobGroupsCompatibledeprecatedownerGroupaccessGroups:
    """(tsType: JobGroupsCompatible, schemaOptions: { title:
'JobGroupsCompatible{"deprecated":["ownerGroup","accessGroups"]}' })

    Attributes:
        owner_group (Union[Unset, str]): ownerGroup field is deprecated. Please create an ACL upfront and reference it
            through the aclId at snippet creation
        access_groups (Union[Unset, List[str]]):
        id (Union[Unset, str]):
        snippet_type (Union[Unset, str]): Defines what type of information snippet is added, such as paragraph, image
            etc.
        is_private (Union[Unset, bool]): Private snippets are meant not to be exported, e.g. as metadata to the data
            catalog. Often used for chat like communication
        default_order (Union[Unset, float]): Default display order is given by createdAt Time in ms*1000. Override to
            allow to place snippet between existing other snippets created in the past
        created_at (Union[Unset, datetime.datetime]):
        created_by (Union[Unset, str]): email of the user adding this view
        updated_at (Union[Unset, datetime.datetime]):
        expires_at (Union[Unset, datetime.datetime]): Date after which the snippet becomes read only.
        updated_by (Union[Unset, str]): email of the user updating this view
        create_acl (Union[Unset, List[str]]):
        read_acl (Union[Unset, List[str]]):
        update_acl (Union[Unset, List[str]]):
        delete_acl (Union[Unset, List[str]]):
        share_acl (Union[Unset, List[str]]):
        admin_acl (Union[Unset, List[str]]):
        calculated_ac_ls (Union[Unset, str]): ACL flags (UDSA) calculated for current user, taking her role into account
        parent_id (Union[Unset, str]):
        tags (Union[Unset, List[str]]):
        dashboard_name (Union[Unset, str]): Human readable name of single snippet
        versionable (Union[Unset, bool]): Versionable snippets will create a new history entry upon update.
        deleted (Union[Unset, bool]): Defines whether the snippet has been deleted.
        description (Union[Unset, str]): Job description
        params (Union[Unset, JobGroupsCompatibledeprecatedownerGroupaccessGroupsParams]): Job parameters
    """

    owner_group: Union[Unset, str] = UNSET
    access_groups: Union[Unset, List[str]] = UNSET
    id: Union[Unset, str] = UNSET
    snippet_type: Union[Unset, str] = UNSET
    is_private: Union[Unset, bool] = UNSET
    default_order: Union[Unset, float] = UNSET
    created_at: Union[Unset, datetime.datetime] = UNSET
    created_by: Union[Unset, str] = UNSET
    updated_at: Union[Unset, datetime.datetime] = UNSET
    expires_at: Union[Unset, datetime.datetime] = UNSET
    updated_by: Union[Unset, str] = UNSET
    create_acl: Union[Unset, List[str]] = UNSET
    read_acl: Union[Unset, List[str]] = UNSET
    update_acl: Union[Unset, List[str]] = UNSET
    delete_acl: Union[Unset, List[str]] = UNSET
    share_acl: Union[Unset, List[str]] = UNSET
    admin_acl: Union[Unset, List[str]] = UNSET
    calculated_ac_ls: Union[Unset, str] = UNSET
    parent_id: Union[Unset, str] = UNSET
    tags: Union[Unset, List[str]] = UNSET
    dashboard_name: Union[Unset, str] = UNSET
    versionable: Union[Unset, bool] = UNSET
    deleted: Union[Unset, bool] = UNSET
    description: Union[Unset, str] = UNSET
    params: Union[Unset, 'JobGroupsCompatibledeprecatedownerGroupaccessGroupsParams'] = UNSET
    additional_properties: Dict[str, Any] = attr.ib(init=False, factory=dict)


    def to_dict(self) -> Dict[str, Any]:
        owner_group = self.owner_group
        access_groups: Union[Unset, List[str]] = UNSET
        if not isinstance(self.access_groups, Unset):
            access_groups = self.access_groups




        id = self.id
        snippet_type = self.snippet_type
        is_private = self.is_private
        default_order = self.default_order
        created_at: Union[Unset, str] = UNSET
        if not isinstance(self.created_at, Unset):
            created_at = self.created_at.isoformat()

        created_by = self.created_by
        updated_at: Union[Unset, str] = UNSET
        if not isinstance(self.updated_at, Unset):
            updated_at = self.updated_at.isoformat()

        expires_at: Union[Unset, str] = UNSET
        if not isinstance(self.expires_at, Unset):
            expires_at = self.expires_at.isoformat()

        updated_by = self.updated_by
        create_acl: Union[Unset, List[str]] = UNSET
        if not isinstance(self.create_acl, Unset):
            create_acl = self.create_acl




        read_acl: Union[Unset, List[str]] = UNSET
        if not isinstance(self.read_acl, Unset):
            read_acl = self.read_acl




        update_acl: Union[Unset, List[str]] = UNSET
        if not isinstance(self.update_acl, Unset):
            update_acl = self.update_acl




        delete_acl: Union[Unset, List[str]] = UNSET
        if not isinstance(self.delete_acl, Unset):
            delete_acl = self.delete_acl




        share_acl: Union[Unset, List[str]] = UNSET
        if not isinstance(self.share_acl, Unset):
            share_acl = self.share_acl




        admin_acl: Union[Unset, List[str]] = UNSET
        if not isinstance(self.admin_acl, Unset):
            admin_acl = self.admin_acl




        calculated_ac_ls = self.calculated_ac_ls
        parent_id = self.parent_id
        tags: Union[Unset, List[str]] = UNSET
        if not isinstance(self.tags, Unset):
            tags = self.tags




        dashboard_name = self.dashboard_name
        versionable = self.versionable
        deleted = self.deleted
        description = self.description
        params: Union[Unset, Dict[str, Any]] = UNSET
        if not isinstance(self.params, Unset):
            params = self.params.to_dict()


        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if owner_group is not UNSET:
            field_dict["ownerGroup"] = owner_group
        if access_groups is not UNSET:
            field_dict["accessGroups"] = access_groups
        if id is not UNSET:
            field_dict["id"] = id
        if snippet_type is not UNSET:
            field_dict["snippetType"] = snippet_type
        if is_private is not UNSET:
            field_dict["isPrivate"] = is_private
        if default_order is not UNSET:
            field_dict["defaultOrder"] = default_order
        if created_at is not UNSET:
            field_dict["createdAt"] = created_at
        if created_by is not UNSET:
            field_dict["createdBy"] = created_by
        if updated_at is not UNSET:
            field_dict["updatedAt"] = updated_at
        if expires_at is not UNSET:
            field_dict["expiresAt"] = expires_at
        if updated_by is not UNSET:
            field_dict["updatedBy"] = updated_by
        if create_acl is not UNSET:
            field_dict["createACL"] = create_acl
        if read_acl is not UNSET:
            field_dict["readACL"] = read_acl
        if update_acl is not UNSET:
            field_dict["updateACL"] = update_acl
        if delete_acl is not UNSET:
            field_dict["deleteACL"] = delete_acl
        if share_acl is not UNSET:
            field_dict["shareACL"] = share_acl
        if admin_acl is not UNSET:
            field_dict["adminACL"] = admin_acl
        if calculated_ac_ls is not UNSET:
            field_dict["calculatedACLs"] = calculated_ac_ls
        if parent_id is not UNSET:
            field_dict["parentId"] = parent_id
        if tags is not UNSET:
            field_dict["tags"] = tags
        if dashboard_name is not UNSET:
            field_dict["dashboardName"] = dashboard_name
        if versionable is not UNSET:
            field_dict["versionable"] = versionable
        if deleted is not UNSET:
            field_dict["deleted"] = deleted
        if description is not UNSET:
            field_dict["description"] = description
        if params is not UNSET:
            field_dict["params"] = params

        return field_dict



    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        from ..models.job_groups_compatibledeprecatedowner_groupaccess_groups_params import (
            JobGroupsCompatibledeprecatedownerGroupaccessGroupsParams,
        )
        d = src_dict.copy()
        owner_group = d.pop("ownerGroup", UNSET)

        access_groups = cast(List[str], d.pop("accessGroups", UNSET))


        id = d.pop("id", UNSET)

        snippet_type = d.pop("snippetType", UNSET)

        is_private = d.pop("isPrivate", UNSET)

        default_order = d.pop("defaultOrder", UNSET)

        _created_at = d.pop("createdAt", UNSET)
        created_at: Union[Unset, datetime.datetime]
        if isinstance(_created_at,  Unset):
            created_at = UNSET
        else:
            created_at = isoparse(_created_at)




        created_by = d.pop("createdBy", UNSET)

        _updated_at = d.pop("updatedAt", UNSET)
        updated_at: Union[Unset, datetime.datetime]
        if isinstance(_updated_at,  Unset):
            updated_at = UNSET
        else:
            updated_at = isoparse(_updated_at)




        _expires_at = d.pop("expiresAt", UNSET)
        expires_at: Union[Unset, datetime.datetime]
        if isinstance(_expires_at,  Unset):
            expires_at = UNSET
        else:
            expires_at = isoparse(_expires_at)




        updated_by = d.pop("updatedBy", UNSET)

        create_acl = cast(List[str], d.pop("createACL", UNSET))


        read_acl = cast(List[str], d.pop("readACL", UNSET))


        update_acl = cast(List[str], d.pop("updateACL", UNSET))


        delete_acl = cast(List[str], d.pop("deleteACL", UNSET))


        share_acl = cast(List[str], d.pop("shareACL", UNSET))


        admin_acl = cast(List[str], d.pop("adminACL", UNSET))


        calculated_ac_ls = d.pop("calculatedACLs", UNSET)

        parent_id = d.pop("parentId", UNSET)

        tags = cast(List[str], d.pop("tags", UNSET))


        dashboard_name = d.pop("dashboardName", UNSET)

        versionable = d.pop("versionable", UNSET)

        deleted = d.pop("deleted", UNSET)

        description = d.pop("description", UNSET)

        _params = d.pop("params", UNSET)
        params: Union[Unset, JobGroupsCompatibledeprecatedownerGroupaccessGroupsParams]
        if isinstance(_params,  Unset):
            params = UNSET
        else:
            params = JobGroupsCompatibledeprecatedownerGroupaccessGroupsParams.from_dict(_params)




        job_groups_compatibledeprecatedowner_groupaccess_groups = cls(
            owner_group=owner_group,
            access_groups=access_groups,
            id=id,
            snippet_type=snippet_type,
            is_private=is_private,
            default_order=default_order,
            created_at=created_at,
            created_by=created_by,
            updated_at=updated_at,
            expires_at=expires_at,
            updated_by=updated_by,
            create_acl=create_acl,
            read_acl=read_acl,
            update_acl=update_acl,
            delete_acl=delete_acl,
            share_acl=share_acl,
            admin_acl=admin_acl,
            calculated_ac_ls=calculated_ac_ls,
            parent_id=parent_id,
            tags=tags,
            dashboard_name=dashboard_name,
            versionable=versionable,
            deleted=deleted,
            description=description,
            params=params,
        )

        job_groups_compatibledeprecatedowner_groupaccess_groups.additional_properties = d
        return job_groups_compatibledeprecatedowner_groupaccess_groups

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
