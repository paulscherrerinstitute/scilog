import getpass
from abc import ABC, abstractmethod
from .config import Config
from .utils import typename


HEADER_JSON = {
    "Content-type": "application/json",
    "Accept":       "application/json"
}


class AuthMixin(ABC):

    def __init__(self, address):
        self.address = address.rstrip("/")
        self._token = None
        tn = typename(self).lower()
        self.config = Config(f".{tn}-tokens")

    def __repr__(self):
        tn = typename(self)
        return f"{tn} @ {self.address}"

    @abstractmethod
    def authenticate(self, username, password):
        raise NotImplementedError

    @property
    def token(self):
        return self._retrieve_token()

    def _retrieve_token(self):
        username = getpass.getuser()
        token = self._token
        if token is None:
            try:
                token = self.config[username]
            except KeyError:
                tn = typename(self)
                password = getpass.getpass(prompt=f"{tn} password for {username}: ")
                token = self.authenticate(username, password)
        self.config[username] = self._token = token
        return token



class AuthError(Exception):
    pass



