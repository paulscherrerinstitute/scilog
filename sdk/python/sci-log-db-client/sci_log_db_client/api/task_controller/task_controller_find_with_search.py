from http import HTTPStatus
from typing import Any, Dict, List, Optional

import httpx

from ...client import AuthenticatedClient
from ...models.task_groups_compatibleinclude_relationstruedeprecatedowner_groupaccess_groups import (
    TaskGroupsCompatibleincludeRelationstruedeprecatedownerGroupaccessGroups,
)
from ...types import Response


def _get_kwargs(
    search: str,
    *,
    client: AuthenticatedClient,

) -> Dict[str, Any]:
    url = "{}/tasks/search={search}".format(
        client.base_url,search=search)

    headers: Dict[str, str] = client.get_headers()
    cookies: Dict[str, Any] = client.get_cookies()

    

    

    

    

    

    return {
	    "method": "get",
        "url": url,
        "headers": headers,
        "cookies": cookies,
        "timeout": client.get_timeout(),
    }


def _parse_response(*, response: httpx.Response) -> Optional[List['TaskGroupsCompatibleincludeRelationstruedeprecatedownerGroupaccessGroups']]:
    if response.status_code == HTTPStatus.OK:
        response_200 = []
        _response_200 = response.json()
        for response_200_item_data in (_response_200):
            response_200_item = TaskGroupsCompatibleincludeRelationstruedeprecatedownerGroupaccessGroups.from_dict(response_200_item_data)



            response_200.append(response_200_item)

        return response_200
    return None


def _build_response(*, response: httpx.Response) -> Response[List['TaskGroupsCompatibleincludeRelationstruedeprecatedownerGroupaccessGroups']]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(response=response),
    )


def sync_detailed(
    search: str,
    *,
    client: AuthenticatedClient,

) -> Response[List['TaskGroupsCompatibleincludeRelationstruedeprecatedownerGroupaccessGroups']]:
    """
    Args:
        search (str):

    Returns:
        Response[List['TaskGroupsCompatibleincludeRelationstruedeprecatedownerGroupaccessGroups']]
    """


    kwargs = _get_kwargs(
        search=search,
client=client,

    )

    response = httpx.request(
        verify=client.verify_ssl,
        **kwargs,
    )

    return _build_response(response=response)

def sync(
    search: str,
    *,
    client: AuthenticatedClient,

) -> Optional[List['TaskGroupsCompatibleincludeRelationstruedeprecatedownerGroupaccessGroups']]:
    """
    Args:
        search (str):

    Returns:
        Response[List['TaskGroupsCompatibleincludeRelationstruedeprecatedownerGroupaccessGroups']]
    """


    return sync_detailed(
        search=search,
client=client,

    ).parsed

async def asyncio_detailed(
    search: str,
    *,
    client: AuthenticatedClient,

) -> Response[List['TaskGroupsCompatibleincludeRelationstruedeprecatedownerGroupaccessGroups']]:
    """
    Args:
        search (str):

    Returns:
        Response[List['TaskGroupsCompatibleincludeRelationstruedeprecatedownerGroupaccessGroups']]
    """


    kwargs = _get_kwargs(
        search=search,
client=client,

    )

    async with httpx.AsyncClient(verify=client.verify_ssl) as _client:
        response = await _client.request(
            **kwargs
        )

    return _build_response(response=response)

async def asyncio(
    search: str,
    *,
    client: AuthenticatedClient,

) -> Optional[List['TaskGroupsCompatibleincludeRelationstruedeprecatedownerGroupaccessGroups']]:
    """
    Args:
        search (str):

    Returns:
        Response[List['TaskGroupsCompatibleincludeRelationstruedeprecatedownerGroupaccessGroups']]
    """


    return (await asyncio_detailed(
        search=search,
client=client,

    )).parsed

