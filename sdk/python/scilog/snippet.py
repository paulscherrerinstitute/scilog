import functools
from typing import get_type_hints

from .utils import typename


def typechecked(func):
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
        return func(obj, *args, **kwargs)

    return typechecked_call


def property_maker(name, dtype):
    storage_name = "_" + name

    @property
    def prop(self) -> dtype:
        return getattr(self, storage_name)

    @prop.setter
    @typechecked
    def prop(self, value: dtype) -> None:
        setattr(self, storage_name, value)

    return prop


class EntityMixin:
    def init_properties(self, **kwargs):
        for name, dtype in kwargs.items():
            storage_name = "_" + name
            cls = type(self)
            setattr(cls, storage_name, None)
            setattr(cls, name, property_maker(name, dtype))
            self._properties.append(name)

    def to_dict(self, include_none=True):
        if include_none:
            return {key: getattr(self, key) for key in self._properties}

        return {
            key: getattr(self, key) for key in self._properties if getattr(self, key) is not None
        }

    def import_dict(self, properties):
        for name, value in properties.items():
            setattr(self, name, value)

    @classmethod
    def from_dict(cls, properties):
        new = cls()
        new.import_dict(properties)
        return new

    def __str__(self):
        return typename(self)

    def __repr__(self):
        return f"{self.__class__.__name__}: {self.to_dict()}"

    @classmethod
    def from_http_response(cls, response):
        if isinstance(response, list):
            return [cls.from_dict(resp) for resp in response]
        else:
            return cls.from_dict(response)


class Snippet(EntityMixin):
    def __init__(self, snippetType="snippet"):
        super().__init__()
        self._properties = []
        self.init_properties(snippetType=str)
        self.snippetType = snippetType


class ACL(EntityMixin):
    def __init__(self, **kwargs):
        self._properties = []
        self.init_properties(
            id=str,
            parentId=str,
            create=list,
            read=list,
            update=list,
            delete=list,
            share=list,
            admin=list,
            subAcls=list,
        )
        self.create = kwargs.get("create", [])
        self.read = kwargs.get("read", [])
        self.update = kwargs.get("update", [])
        self.delete = kwargs.get("delete", [])
        self.share = kwargs.get("share", [])
        self.admin = kwargs.get("admin", [])


class Basesnippet(Snippet):
    def __init__(self, snippetType="basesnippet"):
        super().__init__(snippetType=snippetType)
        self.init_properties(
            id=str,
            parentId=str,
            aclId=str,
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
        )


class Paragraph(Basesnippet):
    def __init__(self, snippetType="paragraph"):
        super().__init__(snippetType=snippetType)
        self.init_properties(textcontent=str, isMessage=str)


class Filesnippet(Basesnippet):
    def __init__(self, snippetType="paragraph"):
        super().__init__(snippetType=snippetType)
        self.init_properties(fileExtension=str, accessHash=str)


# if __name__ == "__main__":
#     tmp = Snippet(id=str, textcontent=str, defaultOrder=int)
#     print(tmp.id)
#     tmp.id = 2
