from http import HTTPStatus
from typing import Any, Dict, Optional

import httpx

from ...client import AuthenticatedClient
from ...models.file_controller_update_by_id_with_file_multipart_data import (
    FileControllerUpdateByIdWithFileMultipartData,
)
from ...models.file_controller_update_by_id_with_file_response_204 import FileControllerUpdateByIdWithFileResponse204
from ...types import Response


def _get_kwargs(
    id: str,
    *,
    client: AuthenticatedClient,
    multipart_data: FileControllerUpdateByIdWithFileMultipartData,

) -> Dict[str, Any]:
    url = "{}/filesnippet/{id}/files".format(
        client.base_url,id=id)

    headers: Dict[str, str] = client.get_headers()
    cookies: Dict[str, Any] = client.get_cookies()

    

    

    

    

    multipart_multipart_data = multipart_data.to_multipart()




    return {
	    "method": "patch",
        "url": url,
        "headers": headers,
        "cookies": cookies,
        "timeout": client.get_timeout(),
        "files": multipart_multipart_data,
    }


def _parse_response(*, response: httpx.Response) -> Optional[FileControllerUpdateByIdWithFileResponse204]:
    if response.status_code == HTTPStatus.NO_CONTENT:
        response_204 = FileControllerUpdateByIdWithFileResponse204.from_dict(response.json())



        return response_204
    return None


def _build_response(*, response: httpx.Response) -> Response[FileControllerUpdateByIdWithFileResponse204]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(response=response),
    )


def sync_detailed(
    id: str,
    *,
    client: AuthenticatedClient,
    multipart_data: FileControllerUpdateByIdWithFileMultipartData,

) -> Response[FileControllerUpdateByIdWithFileResponse204]:
    """
    Args:
        id (str):
        multipart_data (FileControllerUpdateByIdWithFileMultipartData):

    Returns:
        Response[FileControllerUpdateByIdWithFileResponse204]
    """


    kwargs = _get_kwargs(
        id=id,
client=client,
multipart_data=multipart_data,

    )

    response = httpx.request(
        verify=client.verify_ssl,
        **kwargs,
    )

    return _build_response(response=response)

def sync(
    id: str,
    *,
    client: AuthenticatedClient,
    multipart_data: FileControllerUpdateByIdWithFileMultipartData,

) -> Optional[FileControllerUpdateByIdWithFileResponse204]:
    """
    Args:
        id (str):
        multipart_data (FileControllerUpdateByIdWithFileMultipartData):

    Returns:
        Response[FileControllerUpdateByIdWithFileResponse204]
    """


    return sync_detailed(
        id=id,
client=client,
multipart_data=multipart_data,

    ).parsed

async def asyncio_detailed(
    id: str,
    *,
    client: AuthenticatedClient,
    multipart_data: FileControllerUpdateByIdWithFileMultipartData,

) -> Response[FileControllerUpdateByIdWithFileResponse204]:
    """
    Args:
        id (str):
        multipart_data (FileControllerUpdateByIdWithFileMultipartData):

    Returns:
        Response[FileControllerUpdateByIdWithFileResponse204]
    """


    kwargs = _get_kwargs(
        id=id,
client=client,
multipart_data=multipart_data,

    )

    async with httpx.AsyncClient(verify=client.verify_ssl) as _client:
        response = await _client.request(
            **kwargs
        )

    return _build_response(response=response)

async def asyncio(
    id: str,
    *,
    client: AuthenticatedClient,
    multipart_data: FileControllerUpdateByIdWithFileMultipartData,

) -> Optional[FileControllerUpdateByIdWithFileResponse204]:
    """
    Args:
        id (str):
        multipart_data (FileControllerUpdateByIdWithFileMultipartData):

    Returns:
        Response[FileControllerUpdateByIdWithFileResponse204]
    """


    return (await asyncio_detailed(
        id=id,
client=client,
multipart_data=multipart_data,

    )).parsed

