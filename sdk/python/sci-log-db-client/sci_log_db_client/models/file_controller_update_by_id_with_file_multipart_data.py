import json
from io import BytesIO
from typing import TYPE_CHECKING, Any, Dict, List, Tuple, Type, TypeVar, Union

import attr

from ..types import UNSET, File, FileJsonType, Unset

if TYPE_CHECKING:
  from ..models.filesnippet_groups_compatiblestricttruedeprecatedowner_groupaccess_groups import (
      FilesnippetGroupsCompatiblestricttruedeprecatedownerGroupaccessGroups,
  )




T = TypeVar("T", bound="FileControllerUpdateByIdWithFileMultipartData")

@attr.s(auto_attribs=True)
class FileControllerUpdateByIdWithFileMultipartData:
    """
    Attributes:
        fields (Union[Unset, FilesnippetGroupsCompatiblestricttruedeprecatedownerGroupaccessGroups]): (tsType:
            FilesnippetGroupsCompatible, schemaOptions: { strict: true, title:
            'FilesnippetGroupsCompatible{"strict":true,"deprecated":["ownerGroup","accessGroups"]}' })
        file (Union[Unset, File]):
    """

    fields: Union[Unset, 'FilesnippetGroupsCompatiblestricttruedeprecatedownerGroupaccessGroups'] = UNSET
    file: Union[Unset, File] = UNSET
    additional_properties: Dict[str, Any] = attr.ib(init=False, factory=dict)


    def to_dict(self) -> Dict[str, Any]:
        fields: Union[Unset, Dict[str, Any]] = UNSET
        if not isinstance(self.fields, Unset):
            fields = self.fields.to_dict()

        file: Union[Unset, FileJsonType] = UNSET
        if not isinstance(self.file, Unset):
            file = self.file.to_tuple()


        field_dict: Dict[str, Any] = {}
        field_dict.update(self.additional_properties)
        field_dict.update({
        })
        if fields is not UNSET:
            field_dict["fields"] = fields
        if file is not UNSET:
            field_dict["file"] = file

        return field_dict


    def to_multipart(self) -> Dict[str, Any]:
        fields: Union[Unset, Tuple[None, bytes, str]] = UNSET
        if not isinstance(self.fields, Unset):
            fields = (None, json.dumps(self.fields.to_dict()).encode(), 'application/json')

        file: Union[Unset, FileJsonType] = UNSET
        if not isinstance(self.file, Unset):
            file = self.file.to_tuple()


        field_dict: Dict[str, Any] = {}
        field_dict.update({
            key: (None, str(value).encode(), "text/plain")
            for key, value in self.additional_properties.items()
        })
        field_dict.update({
        })
        if fields is not UNSET:
            field_dict["fields"] = fields
        if file is not UNSET:
            field_dict["file"] = file

        return field_dict


    @classmethod
    def from_dict(cls: Type[T], src_dict: Dict[str, Any]) -> T:
        from ..models.filesnippet_groups_compatiblestricttruedeprecatedowner_groupaccess_groups import (
            FilesnippetGroupsCompatiblestricttruedeprecatedownerGroupaccessGroups,
        )
        d = src_dict.copy()
        _fields = d.pop("fields", UNSET)
        fields: Union[Unset, FilesnippetGroupsCompatiblestricttruedeprecatedownerGroupaccessGroups]
        if isinstance(_fields,  Unset):
            fields = UNSET
        else:
            fields = FilesnippetGroupsCompatiblestricttruedeprecatedownerGroupaccessGroups.from_dict(_fields)




        _file = d.pop("file", UNSET)
        file: Union[Unset, File]
        if isinstance(_file,  Unset):
            file = UNSET
        else:
            file = File(
             payload = BytesIO(_file)
        )




        file_controller_update_by_id_with_file_multipart_data = cls(
            fields=fields,
            file=file,
        )

        file_controller_update_by_id_with_file_multipart_data.additional_properties = d
        return file_controller_update_by_id_with_file_multipart_data

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
