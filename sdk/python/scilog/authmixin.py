import getpass
from abc import ABC, abstractmethod
from .config import Config
from .utils import typename


HEADER_JSON = {
    "Content-type": "application/json",
    "Accept":       "application/json"
}


class AuthMixin(ABC):

    def __init__(self, address, options=None):
        self.address = address.rstrip("/")
        self._token = None
        tn = typename(self).lower()
        self.config = Config(f".{tn}-tokens")
        if not options: options = {}
        self._username = options.get('username')
        self._password = options.get('password')
        self._login_path = options.get('login_path')

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
        username = self._username or getpass.getuser()
        token = self._token
        if token is None:
            try:
                token = self.config[username]
            except KeyError:
                tn = typename(self)
                password = self._password or getpass.getpass(prompt=f"{tn} password for {username}: ")
                token = self.authenticate(username, password)
        self.config[username] = self._token = token
        return token



class AuthError(Exception):
    pass



