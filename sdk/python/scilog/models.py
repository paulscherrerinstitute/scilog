from __future__ import annotations

from typing import Self

from pydantic import BaseModel, Field


class Basesnippet(BaseModel):
    snippetType: str = "basesnippet"
    id: str | None = None
    parentId: str | None = None
    createACL: list[str] | None = None
    readACL: list[str] | None = None
    updateACL: list[str] | None = None
    deleteACL: list[str] | None = None
    shareACL: list[str] | None = None
    adminACL: list[str] | None = None
    isPrivate: bool | None = None
    createdAt: str | None = None
    createdBy: str | None = None
    updatedAt: str | None = None
    updatedBy: str | None = None
    expiresAt: str | None = None
    subsnippets: list | None = None  # what type?
    tags: list[str] | None = None
    dashboardName: str | None = None
    files: list | None = None
    location: str | None = None
    defaultOrder: int | None = None
    linkType: str | None = None
    versionable: bool | None = None
    deleted: bool | None = None
    ownerGroup: str | None = Field(default=None, deprecated=True)
    accessGroups: list | None = Field(default=None, deprecated=True)

    @classmethod
    def from_http_response(cls, response: dict | list[dict]) -> Self | list[Self]:
        """
        Create an instance of the class from an HTTP response.

        Args:
            response (dict | list[dict]): The HTTP response data.

        Returns:
            Basesnippet | list[Basesnippet]: An instance or list of instances of the class.
        """
        if isinstance(response, list):
            return [cls(**resp) for resp in response]
        return cls(**response)


class Location(Basesnippet):
    snippetType: str = "location"
    name: str | None = None


class Logbook(Basesnippet):
    snippetType: str = "logbook"
    name: str | None = None
    description: str | None = None
    thumbnail: str | None = None


class Paragraph(Basesnippet):
    snippetType: str = "paragraph"
    textcontent: str | None = None
    isMessage: str | None = None


class Filesnippet(Basesnippet):
    snippetType: str = "image"
    fileExtension: str | None = None
    accessHash: str | None = None


def snippet_factory(response):
    """
    Factory function to create the appropriate snippet instance based on the snippetType in the response.

    Args:
        response (dict | list[dict]): The HTTP response data.

    Returns:
        Basesnippet | list[Basesnippet]: An instance or list of instances of the appropriate snippet class.
    """
    if isinstance(response, list):
        return [get_snippet_response(resp) for resp in response]
    return get_snippet_response(response)


def get_snippet_response(response: dict) -> Basesnippet:
    """
    Get the appropriate snippet instance based on the snippetType in the response.

    Args:
        response (dict): The HTTP response data.

    Returns:
        Basesnippet: An instance of the appropriate snippet class.
    """
    available_snippet_types = {
        "location": Location,
        "logbook": Logbook,
        "paragraph": Paragraph,
        "image": Filesnippet,
        "basesnippet": Basesnippet,
    }
    snippet_type = response["snippetType"]
    if snippet_type in available_snippet_types:
        return available_snippet_types[snippet_type].from_http_response(response)
    raise ValueError(f"Unknown snippet type: {snippet_type}")
