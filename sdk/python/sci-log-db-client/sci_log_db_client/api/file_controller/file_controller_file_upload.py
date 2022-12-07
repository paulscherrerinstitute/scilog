from http import HTTPStatus
from typing import Any, Dict, Optional

import httpx

from ...client import AuthenticatedClient
from ...models.file_controller_file_upload_multipart_data import FileControllerFileUploadMultipartData
from ...models.file_controller_file_upload_response_200 import FileControllerFileUploadResponse200
from ...types import Response


def _get_kwargs(
    *,
    client: AuthenticatedClient,
    multipart_data: FileControllerFileUploadMultipartData,

) -> Dict[str, Any]:
    url = "{}/filesnippet/files".format(
        client.base_url)

    headers: Dict[str, str] = client.get_headers()
    cookies: Dict[str, Any] = client.get_cookies()

    

    

    

    

    multipart_multipart_data = multipart_data.to_multipart()




    return {
	    "method": "post",
        "url": url,
        "headers": headers,
        "cookies": cookies,
        "timeout": client.get_timeout(),
        "files": multipart_multipart_data,
    }


def _parse_response(*, response: httpx.Response) -> Optional[FileControllerFileUploadResponse200]:
    if response.status_code == HTTPStatus.OK:
        response_200 = FileControllerFileUploadResponse200.from_dict(response.json())



        return response_200
    return None


def _build_response(*, response: httpx.Response) -> Response[FileControllerFileUploadResponse200]:
    return Response(
        status_code=HTTPStatus(response.status_code),
        content=response.content,
        headers=response.headers,
        parsed=_parse_response(response=response),
    )


def sync_detailed(
    *,
    client: AuthenticatedClient,
    multipart_data: FileControllerFileUploadMultipartData,

) -> Response[FileControllerFileUploadResponse200]:
    """
    Args:
        multipart_data (FileControllerFileUploadMultipartData):

    Returns:
        Response[FileControllerFileUploadResponse200]
    """


    kwargs = _get_kwargs(
        client=client,
multipart_data=multipart_data,

    )

    response = httpx.request(
        verify=client.verify_ssl,
        **kwargs,
    )

    return _build_response(response=response)

def sync(
    *,
    client: AuthenticatedClient,
    multipart_data: FileControllerFileUploadMultipartData,

) -> Optional[FileControllerFileUploadResponse200]:
    """
    Args:
        multipart_data (FileControllerFileUploadMultipartData):

    Returns:
        Response[FileControllerFileUploadResponse200]
    """


    return sync_detailed(
        client=client,
multipart_data=multipart_data,

    ).parsed

async def asyncio_detailed(
    *,
    client: AuthenticatedClient,
    multipart_data: FileControllerFileUploadMultipartData,

) -> Response[FileControllerFileUploadResponse200]:
    """
    Args:
        multipart_data (FileControllerFileUploadMultipartData):

    Returns:
        Response[FileControllerFileUploadResponse200]
    """


    kwargs = _get_kwargs(
        client=client,
multipart_data=multipart_data,

    )

    async with httpx.AsyncClient(verify=client.verify_ssl) as _client:
        response = await _client.request(
            **kwargs
        )

    return _build_response(response=response)

async def asyncio(
    *,
    client: AuthenticatedClient,
    multipart_data: FileControllerFileUploadMultipartData,

) -> Optional[FileControllerFileUploadResponse200]:
    """
    Args:
        multipart_data (FileControllerFileUploadMultipartData):

    Returns:
        Response[FileControllerFileUploadResponse200]
    """


    return (await asyncio_detailed(
        client=client,
multipart_data=multipart_data,

    )).parsed

