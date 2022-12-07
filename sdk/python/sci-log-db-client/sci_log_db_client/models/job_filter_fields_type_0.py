from typing import Any, Dict, List, Type, TypeVar, Union

import attr

from ..types import UNSET, Unset

T = TypeVar("T", bound="JobFilterFieldsType0")

@attr.s(auto_attribs=True)
class JobFilterFieldsType0:
    """
    Attributes:
        id (Union[Unset, bool]):
        snippet_type (Union[Unset, bool]):
        is_private (Union[Unset, bool]):
        default_order (Union[Unset, bool]):
        created_at (Union[Unset, bool]):
        created_by (Union[Unset, bool]):
        updated_at (Union[Unset, bool]):
        expires_at (Union[Unset, bool]):
        updated_by (Union[Unset, bool]):
        create_acl (Union[Unset, bool]):
        read_acl (Union[Unset, bool]):
        update_acl (Union[Unset, bool]):
        delete_acl (Union[Unset, bool]):
        share_acl (Union[Unset, bool]):
        admin_acl (Union[Unset, bool]):
        calculated_ac_ls (Union[Unset, bool]):
        parent_id (Union[Unset, bool]):
        tags (Union[Unset, bool]):
        dashboard_name (Union[Unset, bool]):
        versionable (Union[Unset, bool]):
        deleted (Union[Unset, bool]):
        description (Union[Unset, bool]):
        params (Union[Unset, bool]):
    """

    id: Union[Unset, bool] = UNSET
    snippet_type: Union[Unset, bool] = UNSET
    is_private: Union[Unset, bool] = UNSET
    default_order: Union[Unset, bool] = UNSET
    created_at: Union[Unset, bool] = UNSET
    created_by: Union[Unset, bool] = UNSET
    updated_at: Union[Unset, bool] = UNSET
    expires_at: Union[Unset, bool] = UNSET
    updated_by: Union[Unset, bool] = UNSET
    create_acl: Union[Unset, bool] = UNSET
    read_acl: Union[Unset, bool] = UNSET
    update_acl: Union[Unset, bool] = UNSET
    delete_acl: Union[Unset, bool] = UNSET
    share_acl: Union[Unset, bool] = UNSET
    admin_acl: Union[Unset, bool] = UNSET
    calculated_ac_ls: Union[Unset, bool] = UNSET
    parent_id: Union[Unset, bool] = UNSET
    tags: Union[Unset, bool] = UNSET
    dashboard_name: Union[Unset, bool] = UNSET
    versionable: Union[Unset, bool] = UNSET
    deleted: Union[Unset, bool] = UNSET
    description: Union[Unset, bool] = UNSET
    params: Union[Unset, bool] = UNSET
    additional_properties: Dict[str, Any] = attr.ib(init=False, factory=dict)


    def to_dict(self) -> Dict[str, Any]:
        id = self.id
        snippet_type = self.snippet_type
        is_private = self.is_private
        default_order = self.default_order
        created_at = self.created_at
        created_by = self.created_by
        updated_at = self.updated_at
        expires_at = self.expires_at
        updated_by = self.updated_by
        create_acl = self.create_acl
        read_acl = self.read_acl
        update_acl = self.update_acl
        delete_acl = self.delete_acl
        share_acl = self.share_acl
        admin_acl = self.admin_acl
        calculated_ac_ls = self.calculated_ac_ls
        parent_id = self.parent_id
        tags = self.tags
        dashboard_name = self.dashboard_name
        versionable = self.versionable
        deleted = self.deleted
        description = self.description
        params = self.params

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
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
        d = src_dict.copy()
        id = d.pop("id", UNSET)

        snippet_type = d.pop("snippetType", UNSET)

        is_private = d.pop("isPrivate", UNSET)

        default_order = d.pop("defaultOrder", UNSET)

        created_at = d.pop("createdAt", UNSET)

        created_by = d.pop("createdBy", UNSET)

        updated_at = d.pop("updatedAt", UNSET)

        expires_at = d.pop("expiresAt", UNSET)

        updated_by = d.pop("updatedBy", UNSET)

        create_acl = d.pop("createACL", UNSET)

        read_acl = d.pop("readACL", UNSET)

        update_acl = d.pop("updateACL", UNSET)

        delete_acl = d.pop("deleteACL", UNSET)

        share_acl = d.pop("shareACL", UNSET)

        admin_acl = d.pop("adminACL", UNSET)

        calculated_ac_ls = d.pop("calculatedACLs", UNSET)

        parent_id = d.pop("parentId", UNSET)

        tags = d.pop("tags", UNSET)

        dashboard_name = d.pop("dashboardName", UNSET)

        versionable = d.pop("versionable", UNSET)

        deleted = d.pop("deleted", UNSET)

        description = d.pop("description", UNSET)

        params = d.pop("params", UNSET)

        job_filter_fields_type_0 = cls(
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

        job_filter_fields_type_0.additional_properties = d
        return job_filter_fields_type_0

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
