import functools
import warnings
from typing import get_type_hints


def scilog_typechecked(func):
    @functools.wraps(func)
    def typechecked_call(obj, *args, **kwargs):
        type_hints = get_type_hints(func)
        del type_hints["return"]
        for arg, dtype in zip(args, type_hints.values()):
            arg_type = type(arg)
            if dtype != arg_type and arg is not None:
                raise TypeError(
                    f"{func} expected to receive input of type {dtype.__name__} but received {arg_type.__name__}"
                )
            if len(func.__closure__) > 0:
                property_name = func.__closure__[0].cell_contents.strip("_")
                # if obj._deprecated.get(property_name):
                #     warnings.warn(
                #         f"{property_name} is deprecated by {obj._deprecated_by[property_name]}"
                #     )
        return func(obj, *args, **kwargs)

    return typechecked_call


def property_maker(name, dtype):
    storage_name = "_" + name

    @property
    def prop(self) -> dtype:
        return getattr(self, storage_name)

    @prop.setter
    @scilog_typechecked
    def prop(self, value: dtype) -> None:
        setattr(self, storage_name, value)

    return prop


class Snippet:
    def __init__(self, snippetType="snippet"):
        self._properties = []
        self.init_properties(snippetType=str)
        self.snippetType = snippetType

    def init_properties(self, **kwargs):
        for name, dtype in kwargs.items():
            storage_name = "_" + name
            cls = type(self)
            setattr(cls, storage_name, None)
            setattr(cls, name, property_maker(name, dtype))
            self._properties.append(name)

    def to_dict(self, include_none=True, include_deprecated=True):
        properties = (
            self._properties
            if include_deprecated
            else list(set(self._properties).difference(self._deprecated.keys()))
        )
        if include_none:
            return {key: getattr(self, key) for key in properties}
        return {key: getattr(self, key) for key in properties if getattr(self, key) is not None}

    def import_dict(self, properties):
        for name, value in properties.items():
            setattr(self, name, value)

    @classmethod
    def from_dict(cls, properties):
        new = cls()
        new.import_dict(properties)
        return new

    def __str__(self):
        return f"{self.__class__.__name__}: {self.to_dict(include_none=False)}"

    def __repr__(self):
        return f"{self.__class__.__name__}: {self.to_dict(include_none=False)}"

    @classmethod
    def from_http_response(cls, response):
        if isinstance(response, list):
            return [cls.from_dict(resp) for resp in response]
        else:
            return cls.from_dict(response)


class Basesnippet(Snippet):
    _deprecated = {"ownerGroup": str, "accessGroups": list}
    _deprecated_by = {"ownerGroup": "ACLS", "accessGroups": "ACLS"}

    def __init__(self, snippetType="basesnippet"):
        super().__init__(snippetType=snippetType)
        self.init_properties(
            id=str,
            parentId=str,
            createACL=list,
            readACL=list,
            updateACL=list,
            deleteACL=list,
            shareACL=list,
            adminACL=list,
            isPrivate=bool,
            createdAt=str,
            createdBy=str,
            updatedAt=str,
            updateBy=str,
            subsnippets=list,
            tags=list,
            dashboardName=str,
            files=list,
            location=str,
            defaultOrder=int,
            linkType=str,
            versionable=bool,
            deleted=bool,
            **self._deprecated,
        )


class Location(Basesnippet):
    def __init__(self):
        super().__init__(snippetType="location")
        self.init_properties(name=str, location=str)


class Logbook(Basesnippet):
    def __init__(self):
        super().__init__(snippetType="logbook")
        self.init_properties(name=str, description=str, thumbnail=str, location=str)


class Paragraph(Basesnippet):
    def __init__(self):
        super().__init__(snippetType="paragraph")
        self.init_properties(textcontent=str, isMessage=str)


class Filesnippet(Basesnippet):
    def __init__(self):
        super().__init__(snippetType="image")  # TODO make that type "file" eventually ?
        self.init_properties(fileExtension=str, accessHash=str)


def snippet_factory(response):
    if isinstance(response, list):
        return [get_snippet_response(resp) for resp in response]
    return get_snippet_response(response)


def get_snippet_response(response):
    # extract snippetType from response
    snippetType = response["snippetType"]
    if snippetType == "location":
        return Location.from_http_response(response)
    if snippetType == "logbook":
        return Logbook.from_http_response(response)
    if snippetType == "paragraph":
        return Paragraph.from_http_response(response)
    if snippetType == "image":
        return Filesnippet.from_http_response(response)
    if snippetType == "basesnippet":
        return Basesnippet.from_http_response(response)
