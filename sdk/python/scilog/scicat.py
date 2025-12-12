from json import dumps
from urllib.parse import quote

from .authmixin import HEADER_JSON, AuthError
from .httpclient import HttpClient


class SciCatRestAPI(HttpClient):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.login_path = self._login_path or "https://dacat.psi.ch/auth/msad"
        self.token_prefix = self.options.get("token_prefix", "") or ""

    def authenticate(self, username, password):
        auth_payload = {"username": username, "password": password}
        res = self._login(auth_payload, HEADER_JSON)
        try:
            token = f"{self.token_prefix}{res['id']}"
        except KeyError as e:
            raise SciCatAuthError(res) from e
        else:
            return token


class SciCatLegacy:
    def __init__(self, *args, **kwargs):
        self.http_client = SciCatRestAPI(*args, **kwargs)

    @property
    def proposals(self):
        url = self.http_client.address + "/proposals"
        return self.http_client.get_request(url, headers=HEADER_JSON)


class SciCatNew:
    max_iterations = 1000

    def __init__(self, *args, return_options=None, **kwargs):
        self.return_options = return_options or {}
        self.http_client = SciCatRestAPI(*args, **kwargs)

    def _proposals_batch(self):
        url = self.http_client.address + "/proposals"
        limit = 500
        filter = {"limits": {"skip": 0, "limit": limit}}
        iteration = 0
        while True:
            iteration += 1
            if iteration > self.max_iterations:
                raise RuntimeError("Exceeded maximum iterations in proposals_batch")
            proposals = self.http_client.get_request(
                f"{url}?filters={quote(dumps(filter))}", headers=HEADER_JSON
            )
            if not proposals or len(proposals) == 0:
                break
            yield proposals
            filter["limits"]["skip"] += limit

    @property
    def proposals(self):
        lazy = self.return_options.get("lazy", False)
        generator = (proposal for batch in self._proposals_batch() for proposal in batch)
        return generator if lazy else list(generator)


class SciCat:
    def __new__(cls, *args, **kwargs):
        token_prefix = kwargs.get("options", {}).get("token_prefix")
        if token_prefix:
            return SciCatNew(*args, **kwargs)
        return SciCatLegacy(*args, **kwargs)


class SciCatAuthError(AuthError):
    pass
