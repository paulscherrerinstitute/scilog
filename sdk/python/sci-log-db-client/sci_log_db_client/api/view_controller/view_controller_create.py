from http import HTTPStatus
from typing import Any, Dict, Optional

import httpx

from ...client import Client
from ...models.new_viewtitle_new_viewexcludeiddeprecatedowner_groupaccess_groups import (
    NewViewtitleNewViewexcludeiddeprecatedownerGroupaccessGroups,
)
from ...models.view_groups_compatibledeprecatedowner_groupaccess_groups import (
    ViewGroupsCompatibledeprecatedownerGroupaccessGroups,
)
from ...types import Response


def _get_kwargs(
    *,
    client: Client,
    json_body: NewViewtitleNewViewexcludeiddeprecatedownerGroupaccessGroups,

) -> Dict[str, Any]:
    url = "{}/views".format(
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


def _parse_response(*, response: httpx.Response) -> Optional[ViewGroupsCompatibledeprecatedownerGroupaccessGroups]:
    if response.status_code == HTTPStatus.OK:
        response_200 = ViewGroupsCompatibledeprecatedownerGroupaccessGroups.from_dict(response.json())



        return response_200
    return None


def _build_response(*, response: httpx.Response) -> Response[ViewGroupsCompatibledeprecatedownerGroupaccessGroups]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(response=response),
    )


def sync_detailed(
    *,
    client: Client,
    json_body: NewViewtitleNewViewexcludeiddeprecatedownerGroupaccessGroups,

) -> Response[ViewGroupsCompatibledeprecatedownerGroupaccessGroups]:
    """
    Args:
        json_body (NewViewtitleNewViewexcludeiddeprecatedownerGroupaccessGroups): (tsType:
            Omit<ViewGroupsCompatible, 'id'>, schemaOptions: { exclude: [ 'id' ], title:
            'NewView{"title":"NewView","exclude":["id"],"deprecated":["ownerGroup","accessGroups"]}'
            })

    Returns:
        Response[ViewGroupsCompatibledeprecatedownerGroupaccessGroups]
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
    client: Client,
    json_body: NewViewtitleNewViewexcludeiddeprecatedownerGroupaccessGroups,

) -> Optional[ViewGroupsCompatibledeprecatedownerGroupaccessGroups]:
    """
    Args:
        json_body (NewViewtitleNewViewexcludeiddeprecatedownerGroupaccessGroups): (tsType:
            Omit<ViewGroupsCompatible, 'id'>, schemaOptions: { exclude: [ 'id' ], title:
            'NewView{"title":"NewView","exclude":["id"],"deprecated":["ownerGroup","accessGroups"]}'
            })

    Returns:
        Response[ViewGroupsCompatibledeprecatedownerGroupaccessGroups]
    """


    return sync_detailed(
        client=client,
json_body=json_body,

    ).parsed

async def asyncio_detailed(
    *,
    client: Client,
    json_body: NewViewtitleNewViewexcludeiddeprecatedownerGroupaccessGroups,

) -> Response[ViewGroupsCompatibledeprecatedownerGroupaccessGroups]:
    """
    Args:
        json_body (NewViewtitleNewViewexcludeiddeprecatedownerGroupaccessGroups): (tsType:
            Omit<ViewGroupsCompatible, 'id'>, schemaOptions: { exclude: [ 'id' ], title:
            'NewView{"title":"NewView","exclude":["id"],"deprecated":["ownerGroup","accessGroups"]}'
            })

    Returns:
        Response[ViewGroupsCompatibledeprecatedownerGroupaccessGroups]
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
    client: Client,
    json_body: NewViewtitleNewViewexcludeiddeprecatedownerGroupaccessGroups,

) -> Optional[ViewGroupsCompatibledeprecatedownerGroupaccessGroups]:
    """
    Args:
        json_body (NewViewtitleNewViewexcludeiddeprecatedownerGroupaccessGroups): (tsType:
            Omit<ViewGroupsCompatible, 'id'>, schemaOptions: { exclude: [ 'id' ], title:
            'NewView{"title":"NewView","exclude":["id"],"deprecated":["ownerGroup","accessGroups"]}'
            })

    Returns:
        Response[ViewGroupsCompatibledeprecatedownerGroupaccessGroups]
    """


    return (await asyncio_detailed(
        client=client,
json_body=json_body,

    )).parsed

