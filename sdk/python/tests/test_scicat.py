from json import dumps
from unittest.mock import ANY, Mock, call, patch
from urllib.parse import quote

import pytest

from scilog import SciCat

ADDRESS = "http://scicat"


@pytest.fixture()
def scicat():
    scicat_client = SciCat(ADDRESS)
    scicat_client.http_client.config = {}
    return scicat_client


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
    options = {
        "username": f"username{token_prefix}",
        "password": "password",
        "login_path": f"{ADDRESS}/login",
        "token_prefix": token_prefix,
    }
    headers = {"Content-type": "application/json", "Accept": "application/json"}
    token = "token123"

    scicat = SciCat(ADDRESS, options=options)
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
    filter = {"limits": {"skip": 0, "limit": 500}}
    mock_get.assert_called_with(
        f"{ADDRESS}/proposals?filter={quote(dumps(filter))}",
        params=None,
        headers={**headers, "Authorization": f"{token_prefix or ''}{token}"},
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
        call(f"{ADDRESS}/proposals?filter={quote(dumps(filters[0]))}", headers=ANY),
        call(f"{ADDRESS}/proposals?filter={quote(dumps(filters[1]))}", headers=ANY),
    ]
    mock_get.assert_has_calls(expected_calls, any_order=False)


@patch("scilog.scicat.SciCatRestAPI.get_request")
def test_proposals(mock_get, scicat):
    mock_get.side_effect = [[1, 2], [3, 4], []]
    proposals = [1, 2, 3, 4]
    for i, p in enumerate(scicat.proposals):
        assert p == proposals[i]
