from http import HTTPStatus
from typing import Any, Dict, List, Optional

import httpx

from ...client import AuthenticatedClient
from ...models.logbook_groups_compatibleinclude_relationstruedeprecatedowner_groupaccess_groups import (
    LogbookGroupsCompatibleincludeRelationstruedeprecatedownerGroupaccessGroups,
)
from ...types import Response


def _get_kwargs(
    *,
    client: AuthenticatedClient,

) -> Dict[str, Any]:
    url = "{}/logbooks".format(
        client.base_url)

    headers: Dict[str, str] = client.get_headers()
    cookies: Dict[str, Any] = client.get_cookies()

    

    

    

    

    

    return {
	    "method": "get",
        "url": url,
        "headers": headers,
        "cookies": cookies,
        "timeout": client.get_timeout(),
    }


def _parse_response(*, response: httpx.Response) -> Optional[List['LogbookGroupsCompatibleincludeRelationstruedeprecatedownerGroupaccessGroups']]:
    if response.status_code == HTTPStatus.OK:
        response_200 = []
        _response_200 = response.json()
        for response_200_item_data in (_response_200):
            response_200_item = LogbookGroupsCompatibleincludeRelationstruedeprecatedownerGroupaccessGroups.from_dict(response_200_item_data)



            response_200.append(response_200_item)

        return response_200
    return None


def _build_response(*, response: httpx.Response) -> Response[List['LogbookGroupsCompatibleincludeRelationstruedeprecatedownerGroupaccessGroups']]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(response=response),
    )


def sync_detailed(
    *,
    client: AuthenticatedClient,

) -> Response[List['LogbookGroupsCompatibleincludeRelationstruedeprecatedownerGroupaccessGroups']]:
    """
    Returns:
        Response[List['LogbookGroupsCompatibleincludeRelationstruedeprecatedownerGroupaccessGroups']]
    """


    kwargs = _get_kwargs(
        client=client,

    )

    response = httpx.request(
        verify=client.verify_ssl,
        **kwargs,
    )

    return _build_response(response=response)

def sync(
    *,
    client: AuthenticatedClient,

) -> Optional[List['LogbookGroupsCompatibleincludeRelationstruedeprecatedownerGroupaccessGroups']]:
    """
    Returns:
        Response[List['LogbookGroupsCompatibleincludeRelationstruedeprecatedownerGroupaccessGroups']]
    """


    return sync_detailed(
        client=client,

    ).parsed

async def asyncio_detailed(
    *,
    client: AuthenticatedClient,

) -> Response[List['LogbookGroupsCompatibleincludeRelationstruedeprecatedownerGroupaccessGroups']]:
    """
    Returns:
        Response[List['LogbookGroupsCompatibleincludeRelationstruedeprecatedownerGroupaccessGroups']]
    """


    kwargs = _get_kwargs(
        client=client,

    )

    async with httpx.AsyncClient(verify=client.verify_ssl) as _client:
        response = await _client.request(
            **kwargs
        )

    return _build_response(response=response)

async def asyncio(
    *,
    client: AuthenticatedClient,

) -> Optional[List['LogbookGroupsCompatibleincludeRelationstruedeprecatedownerGroupaccessGroups']]:
    """
    Returns:
        Response[List['LogbookGroupsCompatibleincludeRelationstruedeprecatedownerGroupaccessGroups']]
    """


    return (await asyncio_detailed(
        client=client,

    )).parsed

