from typing import Any, Dict, List, Type, TypeVar, Union

import attr

from ..types import UNSET, Unset

T = TypeVar("T", bound="CollectionWithRelations")

@attr.s(auto_attribs=True)
class CollectionWithRelations:
    """(tsType: CollectionWithRelations, schemaOptions: { includeRelations: true })

    Attributes:
        name (str):
        filter_ (str):
        description (Union[Unset, str]):
    """

    name: str
    filter_: str
    description: Union[Unset, str] = UNSET
    additional_properties: Dict[str, Any] = attr.ib(init=False, factory=dict)


    def to_dict(self) -> Dict[str, Any]:
        name = self.name
        filter_ = self.filter_
        description = self.description

        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
            "name": name,
            "filter": filter_,
        })
        if description is not UNSET:
            field_dict["description"] = description

        return field_dict



    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        d = src_dict.copy()
        name = d.pop("name")

        filter_ = d.pop("filter")

        description = d.pop("description", UNSET)

        collection_with_relations = cls(
            name=name,
            filter_=filter_,
            description=description,
        )

        collection_with_relations.additional_properties = d
        return collection_with_relations

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
