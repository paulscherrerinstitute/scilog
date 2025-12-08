from unittest.mock import ANY, Mock, patch

import pytest

from scilog import SciCat


@patch("requests.post")
@patch("requests.get")
@pytest.mark.parametrize(
    "token_prefix",
    [
        "",
        None,
        "Bearer ",
    ],
)
def test_get_proposals(mock_get, mock_post, token_prefix):
    address = "http://scicat"
    options = {
        "username": f"username{token_prefix}",
        "password": "password",
        "login_path": f"{address}/login",
        "token_prefix": token_prefix,
    }
    headers = {"Content-type": "application/json", "Accept": "application/json"}
    token = "token123"

    scicat = SciCat(address, options=options)
    mock_response = Mock()
    mock_response.json.return_value = {"id": token}
    mock_post.return_value = mock_response
    scicat.http_client.config = {}
    scicat.proposals
    mock_post.assert_called_with(
        options["login_path"],
        json={"username": options["username"], "password": options["password"]},
        headers=headers,
        timeout=ANY,
        verify=True,
    )
    mock_get.assert_called_with(
        f"{address}/proposals",
        params=None,
        headers={**headers, "Authorization": f"{token_prefix or ''}{token}"},
        timeout=ANY,
        verify=True,
    )
