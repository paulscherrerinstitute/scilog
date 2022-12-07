from typing import TYPE_CHECKING, Any, Dict, List, Type, TypeVar, Union

import attr

from ..types import UNSET, Unset

if TYPE_CHECKING:
  from ..models.location_scope_filter import LocationScopeFilter




T = TypeVar("T", bound="LocationIncludeFilterItems")

@attr.s(auto_attribs=True)
class LocationIncludeFilterItems:
    """
    Attributes:
        relation (Union[Unset, str]):
        scope (Union[Unset, LocationScopeFilter]):
    """

    relation: Union[Unset, str] = UNSET
    scope: Union[Unset, 'LocationScopeFilter'] = UNSET
    additional_properties: Dict[str, Any] = attr.ib(init=False, factory=dict)


    def to_dict(self) -> Dict[str, Any]:
        relation = self.relation
        scope: Union[Unset, Dict[str, Any]] = UNSET
        if not isinstance(self.scope, Unset):
            scope = self.scope.to_dict()


        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if relation is not UNSET:
            field_dict["relation"] = relation
        if scope is not UNSET:
            field_dict["scope"] = scope

        return field_dict



    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        from ..models.location_scope_filter import LocationScopeFilter
        d = src_dict.copy()
        relation = d.pop("relation", UNSET)

        _scope = d.pop("scope", UNSET)
        scope: Union[Unset, LocationScopeFilter]
        if isinstance(_scope,  Unset):
            scope = UNSET
        else:
            scope = LocationScopeFilter.from_dict(_scope)




        location_include_filter_items = cls(
            relation=relation,
            scope=scope,
        )

        location_include_filter_items.additional_properties = d
        return location_include_filter_items

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
