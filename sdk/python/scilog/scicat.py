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


class SciCat:
    max_iterations = 1000

    def __init__(self, *args, **kwargs):
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
                f"{url}?filter={quote(dumps(filter))}", headers=HEADER_JSON
            )
            if not proposals or len(proposals) == 0:
                break
            yield proposals
            filter["limits"]["skip"] += limit

    @property
    def proposals(self):
        for proposals_batch in self._proposals_batch():
            for proposal in proposals_batch:
                yield proposal


class SciCatAuthError(AuthError):
    pass
