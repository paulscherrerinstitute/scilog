from typing import TYPE_CHECKING, Any, Dict, List, Type, TypeVar, Union, cast

import attr

from ..types import UNSET, Unset

if TYPE_CHECKING:
  from ..models.user_preference_filter_fields_type_0 import UserPreferenceFilterFieldsType0
  from ..models.user_preference_include_filter_items import UserPreferenceIncludeFilterItems




T = TypeVar("T", bound="UserPreferenceFilter")

@attr.s(auto_attribs=True)
class UserPreferenceFilter:
    """
    Attributes:
        offset (Union[Unset, int]):
        limit (Union[Unset, int]):  Example: 100.
        skip (Union[Unset, int]):
        order (Union[List[str], Unset, str]):
        fields (Union['UserPreferenceFilterFieldsType0', List[str], Unset]):
        include (Union[Unset, List[Union['UserPreferenceIncludeFilterItems', str]]]):
    """

    offset: Union[Unset, int] = UNSET
    limit: Union[Unset, int] = UNSET
    skip: Union[Unset, int] = UNSET
    order: Union[List[str], Unset, str] = UNSET
    fields: Union['UserPreferenceFilterFieldsType0', List[str], Unset] = UNSET
    include: Union[Unset, List[Union['UserPreferenceIncludeFilterItems', str]]] = UNSET


    def to_dict(self) -> Dict[str, Any]:
        from ..models.user_preference_filter_fields_type_0 import UserPreferenceFilterFieldsType0
        from ..models.user_preference_include_filter_items import UserPreferenceIncludeFilterItems
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


        fields: Union[Dict[str, Any], List[str], Unset]
        if isinstance(self.fields, Unset):
            fields = UNSET

        elif isinstance(self.fields, UserPreferenceFilterFieldsType0):
            fields = UNSET
            if not isinstance(self.fields, Unset):
                fields = self.fields.to_dict()

        else:
            fields = UNSET
            if not isinstance(self.fields, Unset):
                fields = self.fields






        include: Union[Unset, List[Union[Dict[str, Any], str]]] = UNSET
        if not isinstance(self.include, Unset):
            include = []
            for include_item_data in self.include:
                include_item: Union[Dict[str, Any], str]

                if isinstance(include_item_data, UserPreferenceIncludeFilterItems):
                    include_item = include_item_data.to_dict()

                else:
                    include_item = include_item_data


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
        if fields is not UNSET:
            field_dict["fields"] = fields
        if include is not UNSET:
            field_dict["include"] = include

        return field_dict



    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        from ..models.user_preference_filter_fields_type_0 import UserPreferenceFilterFieldsType0
        from ..models.user_preference_include_filter_items import UserPreferenceIncludeFilterItems
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


        def _parse_fields(data: object) -> Union['UserPreferenceFilterFieldsType0', List[str], Unset]:
            if isinstance(data, Unset):
                return data
            try:
                if not isinstance(data, dict):
                    raise TypeError()
                _fields_type_0 = data
                fields_type_0: Union[Unset, UserPreferenceFilterFieldsType0]
                if isinstance(_fields_type_0,  Unset):
                    fields_type_0 = UNSET
                else:
                    fields_type_0 = UserPreferenceFilterFieldsType0.from_dict(_fields_type_0)



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
            def _parse_include_item(data: object) -> Union['UserPreferenceIncludeFilterItems', str]:
                try:
                    if not isinstance(data, dict):
                        raise TypeError()
                    include_item_type_0 = UserPreferenceIncludeFilterItems.from_dict(data)



                    return include_item_type_0
                except: # noqa: E722
                    pass
                return cast(Union['UserPreferenceIncludeFilterItems', str], data)

            include_item = _parse_include_item(include_item_data)

            include.append(include_item)


        user_preference_filter = cls(
            offset=offset,
            limit=limit,
            skip=skip,
            order=order,
            fields=fields,
            include=include,
        )

        return user_preference_filter

