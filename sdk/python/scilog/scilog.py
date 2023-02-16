from __future__ import annotations

import functools
import json
import logging
import os
import uuid
import warnings
from typing import Any, Tuple

from typeguard import typechecked

import scilog.logbook_message as lm
from .authmixin import HEADER_JSON, AuthError
from .httpclient import HttpClient
from .snippet import Basesnippet, Filesnippet, Location, Paragraph, snippet_factory

ACLS = ["createACL", "readACL", "updateACL", "deleteACL", "shareACL", "adminACL"]


logger = logging.getLogger(__name__)


def pinned_to_logbook(logbook_keys, include_none=False):
    def pinned_to_logbook_inner(func):
        @functools.wraps(func)
        def pinned_to_logbook_call(log, *args, **kwargs):
            if not isinstance(log.logbook, Basesnippet):
                warnings.warn("No logbook selected.")
            else:
                logbook = log.logbook.to_dict(include_none=include_none)
                logger.debug(f"====== pinned to logbook: {kwargs}")
                for key in logbook_keys:
                    logger.debug(f"======pinned to logbook: {key}")
                    if key not in kwargs:
                        if key == "parentId":  # mapping from childinstance to parentinstance
                            if "where" not in kwargs:
                                kwargs[key] = log.logbook.id
                            else:
                                kwargs["where"] = {
                                    "and": [kwargs["where"], {"parentId": log.logbook.id}]
                                }
                        else:
                            logger.debug(f"Non parentId condition in pinned_to_logbook: {key}")
                            if logbook.get(key):
                                kwargs[key] = logbook[key]
                logger.debug(f"========= pinned to logbook: resulting kwargs: {kwargs}")
            return func(log, *args, **kwargs)  # real call happens here

        return pinned_to_logbook_call

    return pinned_to_logbook_inner


class SciLogRestAPI(HttpClient):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)


class SciLogCore:
    IMAGE_TYPES = ["png", "jpg", "jpeg"]

    def __init__(self, high_level_interface) -> None:
        self._hli = high_level_interface

    @property
    def logbook(self):
        return self._hli.logbook

    @logbook.setter
    def logbook(self, val):
        self._hli.logbook = val

    @property
    def http_client(self):
        return self._hli.http_client

    def make_filter(
        self,
        where: dict = None,
        limit: int = 0,
        skip: int = 0,
        fields: dict = None,
        include: dict = None,
        order: list = None,
    ):
        filt = dict()
        if where is not None:
            # TOOD needed ? items = [where.copy()]
            filt["where"] = where  #
        if limit > 0:
            filt["limit"] = limit
        if skip > 0:
            filt["skip"] = skip
        if fields is not None:
            filt["fields"] = fields
        if include is not None:
            filt["include"] = include
        if order is not None:
            filt["order"] = order
        filt = json.dumps(filt)
        return {"filter": filt}

    @staticmethod
    def _replace_json_placeholder(snippet: dict, field: str, data: Any) -> dict:
        if not snippet.get(field):
            return snippet
        if isinstance(snippet[field], list):
            if "default" in snippet[field]:
                data = set(data) | set(group for group in snippet[field] if group)
                snippet[field] = list(data)
            return snippet

        if isinstance(snippet[field], str):
            if snippet[field] == "default":
                snippet[field] = data
            return snippet

        raise ValueError("The used placeholder type is not supported. ")

    # TODO if this is a user function add docstring
    @pinned_to_logbook(["parentId", *ACLS])
    def post_snippet(self, **kwargs):
        url = self.http_client.address + "/basesnippets"
        payload = kwargs
        if payload.get("files"):
            payload = self.upload_files(payload)
        return Paragraph.from_http_response(
            self.http_client.post_request(url, payload=payload, headers=HEADER_JSON)
        )

    # TODO if this is a user function add docstring
    @pinned_to_logbook(["parentId", *ACLS])
    def post_location(self, **kwargs):
        url = self.http_client.address + "/basesnippets"
        payload = kwargs
        if payload.get("files"):
            payload = self.upload_files(payload)
        return Location.from_http_response(
            self.http_client.post_request(url, payload=payload, headers=HEADER_JSON)
        )

    def upload_files(self, payload):
        for file in payload.get("files"):
            if "fileId" in file and file["fileId"] is not None:
                continue
            logger.debug(f"Posting from filepath: {file['filepath']}")
            filesnippet = self._post_filesnippet(
                file["filepath"],
                **{key: val for key, val in payload.items() if key in [*ACLS, "tags"]},
            )
            file["fileId"] = filesnippet.id
            file["accessHash"] = filesnippet.accessHash
            file.pop("filepath")
        return payload

    def _post_filesnippet(self, filepath, **kwargs):
        url = self.http_client.address + "/filesnippet/files"

        file_extension = os.path.splitext(filepath)[-1]
        if not file_extension:
            raise ValueError("filepath must be pointing to a file, not a directory.")
        file_extension = file_extension[1:]

        snippet = Filesnippet()
        snippet.import_dict(kwargs)
        snippet.fileExtension = file_extension
        payload = snippet.to_dict(include_none=False)

        file_descriptor = "image" if file_extension in self.IMAGE_TYPES else "file"
        multipart_form_data = {
            "file": (
                filepath + "." + file_extension,
                open(filepath, "rb"),
                f"{file_descriptor}/{file_extension}",
            ),
            "fields": (None, json.dumps(payload)),
        }
        return Filesnippet.from_http_response(
            self.http_client.post_request(
                url, files=multipart_form_data, headers={"Accept": "application/json"}
            )
        )

    @pinned_to_logbook(ACLS)
    def post_file(self, filepath: str, **kwargs) -> Filesnippet:
        """Upload a file. As they are disconnected from paragraphs and logbooks, there
        is no need to copy the parentId. Instead we simply keep the ACLS.

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

        fsnippet = self._post_filesnippet(filepath, **kwargs)
        # ret = self._file_upload(filepath, fsnippet.id, file_extension)
        return fsnippet

    @pinned_to_logbook(ACLS)
    def append_files_to_snippet(self, snippet: Paragraph, filepaths: list, **kwargs) -> Paragraph:
        """Append files or images to an already existing snippet. Files and images will be
        appended following the order given in 'filepaths'. As the files / images are disconnected
        from paragraphs and logbooks, there is no need to copy the parentId. Instead we simply
        keep the ACLS.

        Args:
            snippet (Paragraph): Snippet to which the files should be appended
            filepaths (list): List of file paths pointing to the files that should be uploaded
        Returns:
            Paragraph: Updated snippet
        """
        for filepath in filepaths:
            fsnippet = self.post_file(filepath)

            if not isinstance(snippet.files, list):
                snippet.files = []

            # if we reach this point, we can assume that filepath has been checked (cf. self.post_file)
            file_info, file_textcontent = self.prepare_file_content(
                filepath=filepath, fsnippet=fsnippet
            )
            snippet.textcontent += file_textcontent
            snippet.files.append(file_info)

        return self.patch_snippet(snippet)

    @staticmethod
    def prepare_file_content(filepath: str, fsnippet: Filesnippet = None) -> Tuple:
        file_extension = filepath.split(".")[-1].lower()
        file_hash = str(uuid.uuid4())
        file_id = fsnippet.id if fsnippet and fsnippet.id else None
        accessHash = fsnippet.accessHash if fsnippet and fsnippet.accessHash else None

        if file_extension in SciLogCore.IMAGE_TYPES:
            textcontent = (
                f'<figure class="image image_resized"><img src="" title="{file_hash}"></figure>'
            )
            file_info = {
                "fileHash": file_hash,
                "filepath": filepath,
                "fileExtension": f"image/{file_extension}",
                "fileId": file_id,
                "accessHash": accessHash,
                "style": {"width": "82.25%", "height": ""},
            }

        else:
            textcontent = f'<p><a class="fileLink" target="_blank" href="file:{file_hash}">{os.path.basename(filepath)}</a></p>'
            file_info = {
                "fileHash": file_hash,
                "filepath": filepath,
                "fileExtension": f"file/{file_extension}",
                "fileId": file_id,
                "accessHash": accessHash,
            }
        return (file_info, textcontent)

    def patch_snippet(self, snippet: Basesnippet, **kwargs) -> Basesnippet:
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
        snippet.updatedAt = None
        snippet.updatedBy = None
        snippet.expiresAt = None
        payload = snippet.to_dict(include_none=False)
        return snippet_factory(
            self.http_client.patch_request(url, payload=payload, headers=HEADER_JSON)
        )


class SciLog:
    def __init__(self, *args, **kwargs):
        self.http_client = SciLogRestAPI(*args, **kwargs)
        self.logbook = None
        self.core = SciLogCore(self)

    def select_logbook(self, logbook: Basesnippet):
        self.logbook = logbook

    @pinned_to_logbook(["parentId"])
    def get_snippets(
        self,
        where: dict = None,
        limit: int = 0,
        skip: int = 0,
        fields: dict = None,
        include: dict = None,
        order: list = None,
        **kwargs,
    ):
        url = self.http_client.address + "/basesnippets"
        if not where:
            items = [kwargs.copy()]
            where_keys = {"and": items}
            logger.debug(f"==== where condition defined via keyword arguments:{where_keys}")
            params = self.core.make_filter(
                where=where_keys,
                limit=limit,
                skip=skip,
                fields=fields,
                include=include,
                order=order,
            )
        else:
            logger.debug(f"==== where condition defined directly:{where}")
            params = self.core.make_filter(
                where=where, limit=limit, skip=skip, fields=fields, include=include, order=order
            )
        # TODO dont allow case that both where and kwargs are defined, return error in this case
        return snippet_factory(
            self.http_client.get_request(url, params=params, headers=HEADER_JSON)
        )

    @pinned_to_logbook(["parentId", *ACLS])
    def import_from_dict(self, snippet: dict, **kwargs):
        msg = snippet["textcontent"]
        snippet_dict = {k: v for k, v in snippet.items() if k != "textcontent"}
        self.send_message(msg, **snippet_dict)

    @pinned_to_logbook(["parentId", *ACLS])
    def send_message(self, msg, **kwargs):
        lm_msg = lm.LogbookMessage()
        lm_msg._content.import_dict(kwargs)
        lm_msg.add_text(msg)

        return self.send_logbook_message(lm_msg)

    @typechecked
    def send_logbook_message(self, msg: lm.LogbookMessage) -> None:
        """Upload a new message to SciLog.

        Args:
            msg (lm.LogbookMessage): Previously composed LogbookMessage.

        Example:
            >>> msg = LogbookMessage()
            >>> msg.add_text("Another example text").add_tag(["color"])
            >>> log.send_logbook_message(msg)

        """
        payload = msg._content.to_dict(include_none=False)
        payload["linkType"] = "paragraph"
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            self.core.post_snippet(**payload)

    def get_logbooks(
        self,
        where: dict = None,
        limit: int = 0,
        skip: int = 0,
        fields: dict = None,
        include: dict = None,
        order: list = None,
        **kwargs,
    ):
        url = self.http_client.address + "/logbooks"
        if not where:
            items = [kwargs.copy()]
            where_keys = {"and": items}
            logger.debug(f"==== where condition defined via keyword arguments:{where_keys}")
            params = self.core.make_filter(
                where=where_keys,
                limit=limit,
                skip=skip,
                fields=fields,
                include=include,
                order=order,
            )
        else:
            logger.debug(f"==== where condition defined directly:{where}")
            params = self.core.make_filter(
                where=where, limit=limit, skip=skip, fields=fields, include=include, order=order
            )
        return snippet_factory(
            self.http_client.get_request(url, params=params, headers=HEADER_JSON)
        )

    @pinned_to_logbook(["parentId"])
    def post_snippet(self, **kwargs):
        return self.core.post_snippet(**kwargs)


class SciLogAuthError(AuthError):
    pass
