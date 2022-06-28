from __future__ import annotations
import functools
import uuid
import warnings
import os

from .authmixin import AuthError, HEADER_JSON
from .httpclient import HttpClient
from .snippet import Filesnippet, Snippet, Basesnippet, Paragraph


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
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)


class SciLog:
    def __init__(self, *args, **kwargs):
        self.http_client = SciLogRestAPI(*args, **kwargs)
        self.logbook = None
        self.image_types = ["png", "jpg", "jpeg"]

    def select_logbook(self, logbook: type(Basesnippet)):
        self.logbook = logbook

    @pinned_to_logbook(["parentId", "ownerGroup", "accessGroups"])
    def get_snippets(self, **kwargs):
        url = self.http_client.address + "/basesnippets"
        params = self.http_client.make_filter(where=kwargs)
        headers = HEADER_JSON.copy()
        return Paragraph.from_http_response(
            self.http_client.get_request(url, params=params, headers=headers)
        )

    @pinned_to_logbook(["parentId", "ownerGroup", "accessGroups"])
    def send_message(self, msg, **kwargs):
        url = self.http_client.address + "/basesnippets"
        snippet = Paragraph()
        snippet.import_dict(kwargs)
        snippet.textcontent = msg
        payload = snippet.to_dict(include_none=False)
        print(HEADER_JSON, payload, url)
        return Paragraph.from_http_response(
            self.http_client.post_request(url, payload=payload, headers=HEADER_JSON)
        )

    @pinned_to_logbook(["parentId", "ownerGroup", "accessGroups"])
    def post_snippet(self, **kwargs):
        url = self.http_client.address + "/basesnippets"
        payload = kwargs
        return Paragraph.from_http_response(
            self.http_client.post_request(url, payload=payload, headers=HEADER_JSON)
        )

    @pinned_to_logbook(["ownerGroup", "accessGroups"])
    def _post_filesnippet(self, file_extension, **kwargs):
        url = self.http_client.address + "/filesnippet"
        snippet = Filesnippet()
        snippet.import_dict(kwargs)
        snippet.fileExtension = file_extension
        payload = snippet.to_dict(include_none=False)
        return Filesnippet.from_http_response(
            self.http_client.post_request(url, payload=payload, headers=HEADER_JSON)
        )

    def _file_upload(self, filepath, filename, file_extension):
        url = self.http_client.address + "/files"
        file_descriptor = "image" if file_extension in self.image_types else "file"

        files = {
            "target_filename": (
                filename + "." + file_extension,
                open(filepath, "rb"),
                f"{file_descriptor}/{file_extension}",
            )
        }
        return self.http_client.post_request(url, files=files, headers={})

    @pinned_to_logbook(["ownerGroup", "accessGroups"])
    def post_file(self, filepath: str, **kwargs) -> Filesnippet:
        """Upload a file

        Args:
            filepath (str): Path to the file that ought to be uploaded

        Raises:
            FileNotFoundError: Raised if the file specified in filepath does not exist
            ValueError: Raised if the filepath is not pointing to a file

        Returns:
            Filesnippet: Filesnippet containing the metadata of the newly created entry
        """
        if not os.path.exists(filepath):
            raise FileNotFoundError("Specified file does not exist.")
        file_extension = os.path.splitext(filepath)[-1]
        if not file_extension:
            raise ValueError("filepath must be pointing to a file, not a directory.")
        file_extension = file_extension[1:]
        fsnippet = self._post_filesnippet(file_extension)
        ret = self._file_upload(filepath, fsnippet.id, file_extension)
        return fsnippet

    @pinned_to_logbook(["ownerGroup", "accessGroups"])
    def append_files_to_snippet(
        self, snippet: Paragraph, filepaths: list, **kwargs
    ) -> Paragraph:
        """Append files or images to an already existing snippet. Files and images will be appended following the order given in 'filepaths'.

        Args:
            snippet (Paragraph): Snippet to which the files should be appended
            filepaths (list): List of file paths pointing to the files that should be uploaded

        Returns:
            Paragraph: Updated snippet
        """
        snippet.id
        for filepath in filepaths:
            fsnippet = self.post_file(filepath)

            # if we reach this point, we can assume that filepath has been checked (cf. self.post_file)
            file_extension = filepath.split(".")[-1].lower()
            file_hash = str(uuid.uuid4())

            if not isinstance(snippet.files, list):
                snippet.files = []

            if file_extension in self.image_types:
                snippet.textcontent += f'<figure class="image image_resized"><img src="" title="{file_hash}"></figure>'
                snippet.files.append(
                    {
                        "fileHash": file_hash,
                        "fileExtension": f"image/{file_extension}",
                        "fileId": f"{fsnippet.id}",
                        "style": {"width": "82.25%", "height": ""},
                    }
                )
            else:
                snippet.textcontent += f'<p><a class="fileLink" target="_blank" href="file:{file_hash}">{os.path.basename(filepath)}</a></p>'
                snippet.files.append(
                    {
                        "fileHash": file_hash,
                        "fileExtension": f"file/{file_extension}",
                        "fileId": f"{fsnippet.id}",
                    }
                )

        return self.patch_snippet(snippet)

    def patch_snippet(self, snippet: Paragraph, **kwargs) -> Paragraph:
        """Update (patch) snippet with given snippet.

        Args:
            snippet (Basesnippet): Snippet containing the newly updated fields

        Returns:
            Basesnippet: Updated snippet
        """
        url = self.http_client.address + "/basesnippets/" + snippet.id
        snippet.id = None
        snippet.createdAt = None
        snippet.createdBy = None
        snippet.expiresAt = None
        payload = snippet.to_dict(include_none=False)
        return Basesnippet.from_http_response(
            self.http_client.patch_request(url, payload=payload, headers=HEADER_JSON)
        )

    def get_logbooks(self, **kwargs):
        url = self.http_client.address + "/basesnippets"
        snippet = Basesnippet()
        snippet.import_dict(kwargs)
        snippet.snippetType = "logbook"
        params = self.http_client.make_filter(where=snippet.to_dict(include_none=False))
        return Basesnippet.from_http_response(
            self.http_client.get_request(url, params=params, headers=HEADER_JSON)
        )


class SciLogAuthError(AuthError):
    pass
