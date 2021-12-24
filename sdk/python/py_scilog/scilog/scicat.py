from .authmixin import AuthMixin, AuthError, HEADER_JSON
from .httpclient import HttpClient


class SciCatRestAPI(HttpClient):
    def __init__(self, url):
        super().__init__(url)
        self.login_path = "https://dacat.psi.ch/auth/msad"

    def authenticate(self, username, password):
        auth_payload = {
            "username": username,
            "password": password
        }
        res = self._login(auth_payload, HEADER_JSON)
        try:
            token = res["access_token"]
        except KeyError as e:
            raise SciCatAuthError(res) from e
        else:
            return token

class SciCat():

    def __init__(self, url="https://dacat.psi.ch/api/v3/"):
        self.http_client = SciCatRestAPI(url)


    @property
    def proposals(self):
        url = self.http_client.address + "/proposals"
        return self.http_client.get_request(url, headers=HEADER_JSON)



class SciCatAuthError(AuthError):
    pass



