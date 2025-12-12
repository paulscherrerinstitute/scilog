from unittest.mock import ANY, Mock, patch

import pytest

from scilog import SciCat


@pytest.mark.parametrize(
    "token_prefix, expected_class",
    [
        ["", "SciCatLegacy"],
        [None, "SciCatLegacy"],
        ["Bearer ", "SciCatNew"],
    ],
)
def test_new(token_prefix, expected_class):
    scicat = SciCat(
        "http://scicat",
        options={
            "token_prefix": token_prefix,
        },
    )
    assert scicat.__class__.__name__ == expected_class
