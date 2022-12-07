from typing import TYPE_CHECKING, Any, Dict, List, Type, TypeVar, Union

import attr

from ..types import UNSET, Unset

if TYPE_CHECKING:
  from ..models.paragraph_scope_filter import ParagraphScopeFilter




T = TypeVar("T", bound="ParagraphIncludeFilterItems")

@attr.s(auto_attribs=True)
class ParagraphIncludeFilterItems:
    """
    Attributes:
        relation (Union[Unset, str]):
        scope (Union[Unset, ParagraphScopeFilter]):
    """

    relation: Union[Unset, str] = UNSET
    scope: Union[Unset, 'ParagraphScopeFilter'] = UNSET
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
        from ..models.paragraph_scope_filter import ParagraphScopeFilter
        d = src_dict.copy()
        relation = d.pop("relation", UNSET)

        _scope = d.pop("scope", UNSET)
        scope: Union[Unset, ParagraphScopeFilter]
        if isinstance(_scope,  Unset):
            scope = UNSET
        else:
            scope = ParagraphScopeFilter.from_dict(_scope)




        paragraph_include_filter_items = cls(
            relation=relation,
            scope=scope,
        )

        paragraph_include_filter_items.additional_properties = d
        return paragraph_include_filter_items

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
