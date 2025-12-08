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
    def __init__(self, *args, **kwargs):
        self.http_client = SciCatRestAPI(*args, **kwargs)

    @property
    def proposals(self):
        url = self.http_client.address + "/proposals"
        return self.http_client.get_request(url, headers=HEADER_JSON)


class SciCatAuthError(AuthError):
    pass
