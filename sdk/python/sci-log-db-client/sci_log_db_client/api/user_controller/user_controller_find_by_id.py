from http import HTTPStatus
from typing import Any, Dict, Optional

import httpx

from ...client import AuthenticatedClient
from ...models.user import User
from ...types import Response


def _get_kwargs(
    user_id: str,
    *,
    client: AuthenticatedClient,

) -> Dict[str, Any]:
    url = "{}/users/{userId}".format(
        client.base_url,userId=user_id)

    headers: Dict[str, str] = client.get_headers()
    cookies: Dict[str, Any] = client.get_cookies()

    

    

    

    

    

    return {
	    "method": "get",
        "url": url,
        "headers": headers,
        "cookies": cookies,
        "timeout": client.get_timeout(),
    }


def _parse_response(*, response: httpx.Response) -> Optional[User]:
    if response.status_code == HTTPStatus.OK:
        response_200 = User.from_dict(response.json())



        return response_200
    return None


def _build_response(*, response: httpx.Response) -> Response[User]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(response=response),
    )


def sync_detailed(
    user_id: str,
    *,
    client: AuthenticatedClient,

) -> Response[User]:
    """
    Args:
        user_id (str):

    Returns:
        Response[User]
    """


    kwargs = _get_kwargs(
        user_id=user_id,
client=client,

    )

    response = httpx.request(
        verify=client.verify_ssl,
        **kwargs,
    )

    return _build_response(response=response)

def sync(
    user_id: str,
    *,
    client: AuthenticatedClient,

) -> Optional[User]:
    """
    Args:
        user_id (str):

    Returns:
        Response[User]
    """


    return sync_detailed(
        user_id=user_id,
client=client,

    ).parsed

async def asyncio_detailed(
    user_id: str,
    *,
    client: AuthenticatedClient,

) -> Response[User]:
    """
    Args:
        user_id (str):

    Returns:
        Response[User]
    """


    kwargs = _get_kwargs(
        user_id=user_id,
client=client,

    )

    async with httpx.AsyncClient(verify=client.verify_ssl) as _client:
        response = await _client.request(
            **kwargs
        )

    return _build_response(response=response)

async def asyncio(
    user_id: str,
    *,
    client: AuthenticatedClient,

) -> Optional[User]:
    """
    Args:
        user_id (str):

    Returns:
        Response[User]
    """


    return (await asyncio_detailed(
        user_id=user_id,
client=client,

    )).parsed

