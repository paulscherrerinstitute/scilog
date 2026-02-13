import getpass
from abc import ABC, abstractmethod
from json.decoder import JSONDecodeError

from .config import Config

HEADER_JSON = {"Content-type": "application/json", "Accept": "application/json"}


def typename(obj):
    return type(obj).__name__


class AuthMixin(ABC):
    def __init__(self, address, options=None):
        self.address = address.rstrip("/")
        if not options:
            options = {}
        self._auto_save_token = options.get("auto_save_token", True)
        tn = typename(self).lower()
        try:
            self.config = Config(f".{tn}-tokens", auto_save_token=self._auto_save_token)
        except JSONDecodeError:
            self.config = {}

        self._token = options.get("token")
        self._username = options.get("username")
        self._password = options.get("password")
        self._login_path = options.get("login_path")
        self.options = options

    def __repr__(self):
        tn = typename(self)
        return f"{tn} @ {self.address}"

    @abstractmethod
    def authenticate(self, username, password):
        raise NotImplementedError

    @property
    def token(self):
        return self._retrieve_token()

    def reset_token(self):
        self._token = None

    def _retrieve_token(self):
        username = self._username or getpass.getuser()

        if self._token:
            # If a token is already set (either from options or from a previous authentication), use it.
            return self._token

        if not self._auto_save_token:
            # If auto-saving is disabled, authenticate without checking the config.
            self._token = self._authenticate()
            return self._token

        try:
            self._token = self.config[username]
        except KeyError:
            self._token = self._authenticate()
        self.config[username] = self._token
        return self._token

    def _authenticate(self):
        tn = typename(self)
        username = self._username or getpass.getuser()
        password = self._password or getpass.getpass(prompt=f"{tn} password for {username}: ")
        token = self.authenticate(username, password)
        return token


class AuthError(Exception):
    pass
