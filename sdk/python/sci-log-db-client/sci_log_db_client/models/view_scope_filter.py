from typing import TYPE_CHECKING, Any, Dict, List, Type, TypeVar, Union, cast

import attr

from ..types import UNSET, Unset

if TYPE_CHECKING:
  from ..models.view_scope_filter_fields_type_0 import ViewScopeFilterFieldsType0
  from ..models.view_scope_filter_include_item import ViewScopeFilterIncludeItem
  from ..models.view_scope_filter_where import ViewScopeFilterWhere




T = TypeVar("T", bound="ViewScopeFilter")

@attr.s(auto_attribs=True)
class ViewScopeFilter:
    """
    Attributes:
        offset (Union[Unset, int]):
        limit (Union[Unset, int]):  Example: 100.
        skip (Union[Unset, int]):
        order (Union[List[str], Unset, str]):
        where (Union[Unset, ViewScopeFilterWhere]):
        fields (Union['ViewScopeFilterFieldsType0', List[str], Unset]):
        include (Union[Unset, List['ViewScopeFilterIncludeItem']]):
    """

    offset: Union[Unset, int] = UNSET
    limit: Union[Unset, int] = UNSET
    skip: Union[Unset, int] = UNSET
    order: Union[List[str], Unset, str] = UNSET
    where: Union[Unset, 'ViewScopeFilterWhere'] = UNSET
    fields: Union['ViewScopeFilterFieldsType0', List[str], Unset] = UNSET
    include: Union[Unset, List['ViewScopeFilterIncludeItem']] = UNSET


    def to_dict(self) -> Dict[str, Any]:
        from ..models.view_scope_filter_fields_type_0 import ViewScopeFilterFieldsType0
        offset = self.offset
        limit = self.limit
        skip = self.skip
        order: Union[List[str], Unset, str]
        if isinstance(self.order, Unset):
            order = UNSET

        elif isinstance(self.order, list):
            order = UNSET
            if not isinstance(self.order, Unset):
                order = self.order




        else:
            order = self.order


        where: Union[Unset, Dict[str, Any]] = UNSET
        if not isinstance(self.where, Unset):
            where = self.where.to_dict()

        fields: Union[Dict[str, Any], List[str], Unset]
        if isinstance(self.fields, Unset):
            fields = UNSET

        elif isinstance(self.fields, ViewScopeFilterFieldsType0):
            fields = UNSET
            if not isinstance(self.fields, Unset):
                fields = self.fields.to_dict()

        else:
            fields = UNSET
            if not isinstance(self.fields, Unset):
                fields = self.fields






        include: Union[Unset, List[Dict[str, Any]]] = UNSET
        if not isinstance(self.include, Unset):
            include = []
            for include_item_data in self.include:
                include_item = include_item_data.to_dict()

                include.append(include_item)





        field_dict: Dict[str, Any] = {}
        field_dict.update({
        })
        if offset is not UNSET:
            field_dict["offset"] = offset
        if limit is not UNSET:
            field_dict["limit"] = limit
        if skip is not UNSET:
            field_dict["skip"] = skip
        if order is not UNSET:
            field_dict["order"] = order
        if where is not UNSET:
            field_dict["where"] = where
        if fields is not UNSET:
            field_dict["fields"] = fields
        if include is not UNSET:
            field_dict["include"] = include

        return field_dict



    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        from ..models.view_scope_filter_fields_type_0 import ViewScopeFilterFieldsType0
        from ..models.view_scope_filter_include_item import ViewScopeFilterIncludeItem
        from ..models.view_scope_filter_where import ViewScopeFilterWhere
        d = src_dict.copy()
        offset = d.pop("offset", UNSET)

        limit = d.pop("limit", UNSET)

        skip = d.pop("skip", UNSET)

        def _parse_order(data: object) -> Union[List[str], Unset, str]:
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, list):
                    raise TypeError()
                order_type_1 = cast(List[str], data)

                return order_type_1
            except: # noqa: E722
                pass
            return cast(Union[List[str], Unset, str], data)

        order = _parse_order(d.pop("order", UNSET))


        _where = d.pop("where", UNSET)
        where: Union[Unset, ViewScopeFilterWhere]
        if isinstance(_where,  Unset):
            where = UNSET
        else:
            where = ViewScopeFilterWhere.from_dict(_where)




        def _parse_fields(data: object) -> Union['ViewScopeFilterFieldsType0', List[str], Unset]:
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                _fields_type_0 = data
                fields_type_0: Union[Unset, ViewScopeFilterFieldsType0]
                if isinstance(_fields_type_0,  Unset):
                    fields_type_0 = UNSET
                else:
                    fields_type_0 = ViewScopeFilterFieldsType0.from_dict(_fields_type_0)



                return fields_type_0
            except: # noqa: E722
                pass
            if not isinstance(data, list):
                raise TypeError()
            fields_type_1 = cast(List[str], data)

            return fields_type_1

        fields = _parse_fields(d.pop("fields", UNSET))


        include = []
        _include = d.pop("include", UNSET)
        for include_item_data in (_include or []):
            include_item = ViewScopeFilterIncludeItem.from_dict(include_item_data)



            include.append(include_item)


        view_scope_filter = cls(
            offset=offset,
            limit=limit,
            skip=skip,
            order=order,
            where=where,
            fields=fields,
            include=include,
        )

        return view_scope_filter

