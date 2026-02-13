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
        self._auto_save = options.get("auto_save", True)
        tn = typename(self).lower()
        try:
            self.config = Config(f".{tn}-tokens", auto_save=self._auto_save)
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
        token = self._token
        if token is None:
            if self._auto_save:
                try:
                    token = self.config[username]
                except KeyError:
                    token = self._authenticate()
            else:
                token = self._authenticate()

        self.config[username] = self._token = token
        return token

    def _authenticate(self):
        tn = typename(self)
        username = self._username or getpass.getuser()
        password = self._password or getpass.getpass(prompt=f"{tn} password for {username}: ")
        token = self.authenticate(username, password)
        return token


class AuthError(Exception):
    pass
