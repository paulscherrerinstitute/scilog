from http import HTTPStatus
from typing import Any, Dict, Optional

import httpx

from ...client import AuthenticatedClient
from ...models.filesnippet_groups_compatiblestricttruedeprecatedowner_groupaccess_groups import (
    FilesnippetGroupsCompatiblestricttruedeprecatedownerGroupaccessGroups,
)
from ...models.new_filetitle_new_fileexcludeidstricttruedeprecatedowner_groupaccess_groups import (
    NewFiletitleNewFileexcludeidstricttruedeprecatedownerGroupaccessGroups,
)
from ...types import Response


def _get_kwargs(
    *,
    client: AuthenticatedClient,
    json_body: NewFiletitleNewFileexcludeidstricttruedeprecatedownerGroupaccessGroups,

) -> Dict[str, Any]:
    url = "{}/filesnippet".format(
        client.base_url)

    headers: Dict[str, str] = client.get_headers()
    cookies: Dict[str, Any] = client.get_cookies()

    

    

    

    json_json_body = json_body.to_dict()



    

    return {
	    "method": "post",
        "url": url,
        "headers": headers,
        "cookies": cookies,
        "timeout": client.get_timeout(),
        "json": json_json_body,
    }


def _parse_response(*, response: httpx.Response) -> Optional[FilesnippetGroupsCompatiblestricttruedeprecatedownerGroupaccessGroups]:
    if response.status_code == HTTPStatus.OK:
        response_200 = FilesnippetGroupsCompatiblestricttruedeprecatedownerGroupaccessGroups.from_dict(response.json())



        return response_200
    return None


def _build_response(*, response: httpx.Response) -> Response[FilesnippetGroupsCompatiblestricttruedeprecatedownerGroupaccessGroups]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(response=response),
    )


def sync_detailed(
    *,
    client: AuthenticatedClient,
    json_body: NewFiletitleNewFileexcludeidstricttruedeprecatedownerGroupaccessGroups,

) -> Response[FilesnippetGroupsCompatiblestricttruedeprecatedownerGroupaccessGroups]:
    """
    Args:
        json_body (NewFiletitleNewFileexcludeidstricttruedeprecatedownerGroupaccessGroups):
            (tsType: Omit<FilesnippetGroupsCompatible, 'id'>, schemaOptions: { exclude: [ 'id' ],
            strict: true, title: 'NewFile{"title":"NewFile","exclude":["id"],"strict":true,"deprecated
            ":["ownerGroup","accessGroups"]}' })

    Returns:
        Response[FilesnippetGroupsCompatiblestricttruedeprecatedownerGroupaccessGroups]
    """


    kwargs = _get_kwargs(
        client=client,
json_body=json_body,

    )

    response = httpx.request(
        verify=client.verify_ssl,
        **kwargs,
    )

    return _build_response(response=response)

def sync(
    *,
    client: AuthenticatedClient,
    json_body: NewFiletitleNewFileexcludeidstricttruedeprecatedownerGroupaccessGroups,

) -> Optional[FilesnippetGroupsCompatiblestricttruedeprecatedownerGroupaccessGroups]:
    """
    Args:
        json_body (NewFiletitleNewFileexcludeidstricttruedeprecatedownerGroupaccessGroups):
            (tsType: Omit<FilesnippetGroupsCompatible, 'id'>, schemaOptions: { exclude: [ 'id' ],
            strict: true, title: 'NewFile{"title":"NewFile","exclude":["id"],"strict":true,"deprecated
            ":["ownerGroup","accessGroups"]}' })

    Returns:
        Response[FilesnippetGroupsCompatiblestricttruedeprecatedownerGroupaccessGroups]
    """


    return sync_detailed(
        client=client,
json_body=json_body,

    ).parsed

async def asyncio_detailed(
    *,
    client: AuthenticatedClient,
    json_body: NewFiletitleNewFileexcludeidstricttruedeprecatedownerGroupaccessGroups,

) -> Response[FilesnippetGroupsCompatiblestricttruedeprecatedownerGroupaccessGroups]:
    """
    Args:
        json_body (NewFiletitleNewFileexcludeidstricttruedeprecatedownerGroupaccessGroups):
            (tsType: Omit<FilesnippetGroupsCompatible, 'id'>, schemaOptions: { exclude: [ 'id' ],
            strict: true, title: 'NewFile{"title":"NewFile","exclude":["id"],"strict":true,"deprecated
            ":["ownerGroup","accessGroups"]}' })

    Returns:
        Response[FilesnippetGroupsCompatiblestricttruedeprecatedownerGroupaccessGroups]
    """


    kwargs = _get_kwargs(
        client=client,
json_body=json_body,

    )

    async with httpx.AsyncClient(verify=client.verify_ssl) as _client:
        response = await _client.request(
            **kwargs
        )

    return _build_response(response=response)

async def asyncio(
    *,
    client: AuthenticatedClient,
    json_body: NewFiletitleNewFileexcludeidstricttruedeprecatedownerGroupaccessGroups,

) -> Optional[FilesnippetGroupsCompatiblestricttruedeprecatedownerGroupaccessGroups]:
    """
    Args:
        json_body (NewFiletitleNewFileexcludeidstricttruedeprecatedownerGroupaccessGroups):
            (tsType: Omit<FilesnippetGroupsCompatible, 'id'>, schemaOptions: { exclude: [ 'id' ],
            strict: true, title: 'NewFile{"title":"NewFile","exclude":["id"],"strict":true,"deprecated
            ":["ownerGroup","accessGroups"]}' })

    Returns:
        Response[FilesnippetGroupsCompatiblestricttruedeprecatedownerGroupaccessGroups]
    """


    return (await asyncio_detailed(
        client=client,
json_body=json_body,

    )).parsed

