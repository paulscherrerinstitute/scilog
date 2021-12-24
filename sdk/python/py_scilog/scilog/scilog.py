from __future__ import annotations
import functools
import warnings

from .authmixin import AuthError, HEADER_JSON
from .httpclient import HttpClient
from .snippet import Snippet, Basesnippet, Paragraph


def pinned_to_logbook(logbook_keys):
    def pinned_to_logbook_inner(func):
        @functools.wraps(func)
        def pinned_to_logbook_call(log, *args, **kwargs):
            if not isinstance(log.logbook, Basesnippet):
                warnings.warn("No logbook selected.")
            else:
                for key in logbook_keys:
                    if key not in kwargs:
                        if key == "parentId":
                            kwargs[key] = log.logbook.id
                        else:
                            kwargs[key] = getattr(log.logbook, key)
            return func(log, *args, **kwargs)
        return pinned_to_logbook_call
    return pinned_to_logbook_inner


class SciLogRestAPI(HttpClient):
    def __init__(self, url):
        super().__init__(url)
        self._verify_certificate = False


class SciLog():

    def __init__(self, url="https://lnode2.psi.ch/api/v1"):
        self.http_client = SciLogRestAPI(url)
        self.logbook = None

    def select_logbook(self, logbook:type(Basesnippet)):
        self.logbook = logbook

    @pinned_to_logbook(["parentId", "ownerGroup", "accessGroups"])
    def get_snippets(self, **kwargs):
        url = self.http_client.address + "/basesnippets"
        params = self.http_client.make_filter(where=kwargs)
        headers = HEADER_JSON.copy()
        return Basesnippet.from_http_response(self.http_client.get_request(url, params=params, headers=headers))

    @pinned_to_logbook(["parentId", "ownerGroup", "accessGroups"])
    def send_message(self, msg, **kwargs):
        url = self.http_client.address + "/basesnippets"
        snippet = Paragraph()
        snippet.import_dict(kwargs)
        snippet.textcontent = msg
        payload = snippet.to_dict(include_none=False)
        return Basesnippet.from_http_response(self.http_client.post_request(url, payload=payload, headers=HEADER_JSON))

    @pinned_to_logbook(["parentId", "ownerGroup", "accessGroups"])
    def post_snippet(self, **kwargs):
        url = self.http_client.address + "/basesnippets"
        payload = kwargs
        return Basesnippet.from_http_response(self.http_client.post_request(url, payload=payload, headers=HEADER_JSON))

    def get_logbooks(self, **kwargs):
        url = self.http_client.address + "/basesnippets"
        snippet = Basesnippet()
        snippet.import_dict(kwargs)
        snippet.snippetType = "logbook"
        params = self.http_client.make_filter(where=snippet.to_dict(include_none=False))
        return Basesnippet.from_http_response(self.http_client.get_request(url, params=params, headers=HEADER_JSON))


class SciLogAuthError(AuthError):
    pass



