import functools
import json
import requests

from .authmixin import AuthMixin, AuthError, HEADER_JSON


def authenticated(func):
    @functools.wraps(func)
    def authenticated_call(client, *args, **kwargs):
        if not isinstance(client, HttpClient):
            raise AttributeError("First argument must be an instance of HttpClient")
        if "headers" in kwargs:
            kwargs["headers"] = kwargs["headers"].copy()
        else:
            kwargs["headers"] = {}
        kwargs["headers"]["Authorization"] = client.token
        return func(client, *args, **kwargs)

    return authenticated_call


class HttpClient(AuthMixin):
    def __init__(self, address):
        self.address = address
        self._verify_certificate = True
        self.login_path = self.address + "/users/login"
        super().__init__(address)

    def authenticate(self, username, password):
        auth_payload = {"principal": username, "password": password}
        res = self._login(auth_payload, HEADER_JSON)
        try:
            token = "Bearer " + res["token"]
        except KeyError as e:
            raise AuthError(res) from e
        else:
            return token

    @authenticated
    def get_request(self, url, params=None, headers=None, timeout=10):
        response = requests.get(
            url,
            params=params,
            headers=headers,
            timeout=timeout,
            verify=self._verify_certificate,
        )
        if response.ok:
            return response.json()
        else:
            if response.reason == "Unauthorized":
                self.config.delete()
            raise response.raise_for_status()

    @authenticated
    def post_request(self, url, payload=None, files=None, headers=None, timeout=10):
        req = requests.post(
            url,
            json=payload,
            files=files,
            headers=headers,
            timeout=timeout,
            verify=self._verify_certificate,
        )
        req.raise_for_status()
        return req.json()

    @authenticated
    def patch_request(self, url, payload=None, files=None, headers=None, timeout=10):
        req = requests.patch(
            url,
            json=payload,
            files=files,
            headers=headers,
            timeout=timeout,
            verify=self._verify_certificate,
        )
        req.raise_for_status()
        return {}

    def _login(self, payload=None, headers=None, timeout=10):
        return requests.post(
            self.login_path,
            json=payload,
            headers=headers,
            timeout=timeout,
            verify=self._verify_certificate,
        ).json()

    @staticmethod
    def make_filter(
        where: dict = None,
        limit: int = 0,
        skip: int = 0,
        fields: dict = None,
        include: dict = None,
        order: list = None,
    ):
        filt = dict()
        if where is not None:
            items = [where.copy()]
            filt["where"] = {"and": items}
        if limit > 0:
            filt["limit"] = limit
        if skip > 0:
            filt["skip"] = skip
        if fields is not None:
            filt["fields"] = include
        if order is not None:
            filt["order"] = order
        filt = json.dumps(filt)
        return {"filter": filt}
