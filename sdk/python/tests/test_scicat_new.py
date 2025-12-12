from json import dumps
from unittest.mock import ANY, Mock, call, patch
from urllib.parse import quote

import pytest

from scilog import SciCat

ADDRESS = "http://scicat"

OPTIONS = {
    "username": f"username",
    "password": "password",
    "login_path": f"{ADDRESS}/login",
    "token_prefix": "Bearer ",
}


@pytest.fixture()
def scicat():
    scicat = SciCat(ADDRESS, options=OPTIONS)
    scicat.http_client.config = {}
    return scicat


@patch("requests.post")
@patch("requests.get")
def test_get_proposals(mock_get, mock_post, scicat):
    headers = {"Content-type": "application/json", "Accept": "application/json"}
    token = "token123"
    mock_response = Mock()
    mock_response.json.return_value = {"id": token}
    mock_post.return_value = mock_response
    list(scicat.proposals)
    mock_post.assert_called_with(
        OPTIONS["login_path"],
        json={"username": OPTIONS["username"], "password": OPTIONS["password"]},
        headers=headers,
        timeout=ANY,
        verify=True,
    )
    filter = {"limits": {"skip": 0, "limit": 500}}
    mock_get.assert_called_with(
        f"{ADDRESS}/proposals?filters={quote(dumps(filter))}",
        params=None,
        headers={**headers, "Authorization": f"{OPTIONS['token_prefix']}{token}"},
        timeout=ANY,
        verify=True,
    )


@patch("scilog.scicat.SciCatRestAPI.get_request")
def test__proposals_batch(mock_get, scicat):

    mock_get.side_effect = [[1, 2], [3, 4], []]
    filters = [{"limits": {"skip": 0, "limit": 500}}, {"limits": {"skip": 500, "limit": 500}}]
    for _ in scicat._proposals_batch():
        continue

    assert mock_get.call_count == 3

    expected_calls = [
        call(f"{ADDRESS}/proposals?filters={quote(dumps(filters[0]))}", headers=ANY),
        call(f"{ADDRESS}/proposals?filters={quote(dumps(filters[1]))}", headers=ANY),
    ]
    mock_get.assert_has_calls(expected_calls, any_order=False)


@patch("scilog.scicat.SciCatRestAPI.get_request")
@pytest.mark.parametrize(
    "return_options",
    [
        None,
        {"lazy": True},
        {"lazy": False},
    ],
)
def test_proposals(mock_get, return_options):
    scicat = SciCat(ADDRESS, options=OPTIONS, return_options=return_options)
    scicat.http_client.config = {}
    mock_get.side_effect = [[1, 2], [3, 4], []]
    proposals = [1, 2, 3, 4]
    scicat_proposals = scicat.proposals
    for i, p in enumerate(scicat_proposals):
        assert p == proposals[i]
    lazy = return_options.get("lazy", False) if return_options else False
    assert len(list(scicat_proposals)) == (0 if lazy else len(proposals))
