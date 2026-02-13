from __future__ import annotations

import functools
import json
import logging
import os
import uuid
import warnings
from typing import Tuple, TypeVar, cast

from typeguard import typechecked

import scilog.logbook_message as lm
from .authmixin import HEADER_JSON
from .httpclient import HttpClient
from .models import Basesnippet, Filesnippet, Location, Logbook, Paragraph, snippet_factory

T = TypeVar("T", bound="Basesnippet")

ACLS = ["createACL", "readACL", "updateACL", "deleteACL", "shareACL", "adminACL"]


logger = logging.getLogger(__name__)


def pinned_to_logbook(logbook_keys, include_none=False):
    """
    Decorator to pin methods to the currently selected logbook.
    This means that the decorated method will automatically include
    the logbook's id in the specified keys (e.g., parentId) of the payload,
    if they are not already provided.
    """

    def pinned_to_logbook_inner(func):
        @functools.wraps(func)
        def pinned_to_logbook_call(log, *args, **kwargs):
            if not isinstance(log.logbook, Basesnippet):
                warnings.warn("No logbook selected.")
                return func(log, *args, **kwargs)

            logbook = log.logbook.model_dump(exclude_none=not include_none)
            logger.debug(f"====== pinned to logbook: {kwargs}")
            for key in logbook_keys:
                logger.debug(f"======pinned to logbook: {key}")
                if key in kwargs:
                    continue
                if key == "parentId":  # mapping from childinstance to parentinstance
                    if "where" not in kwargs:
                        kwargs[key] = log.logbook.id
                    else:
                        kwargs["where"] = {"and": [kwargs["where"], {"parentId": log.logbook.id}]}
                else:
                    logger.debug(f"Non parentId condition in pinned_to_logbook: {key}")
                    if logbook.get(key):
                        kwargs[key] = logbook[key]
            logger.debug(f"========= pinned to logbook: resulting kwargs: {kwargs}")
            return func(log, *args, **kwargs)  # real call happens here

        return pinned_to_logbook_call

    return pinned_to_logbook_inner


class SciLogRestAPI(HttpClient):
    pass


class SciLogCore:
    """
    Core functionalities of SciLog, including methods for posting snippets and locations,
    uploading files, and patching snippets. This class is intended to be used internally by
    the SciLog class and is not meant to be accessed directly by users.
    """

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
        where: dict | None = None,
        limit: int = 0,
        skip: int = 0,
        fields: dict | None = None,
        include: dict | None = None,
        order: list | None = None,
    ) -> dict:
        """
        Create a filter dictionary for querying snippets.

        Args:
            where (dict | None): Conditions to filter the snippets.
            limit (int): Maximum number of snippets to return.
            skip (int): Number of snippets to skip.
            fields (dict | None): Specific fields to include or exclude.
            include (dict | None): Related models to include.
            order (list | None): Order in which to return the snippets.

        Returns:
            dict: A dictionary representing the filter.

        """
        filt = {}
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

    # TODO if this is a user function add docstring
    @pinned_to_logbook(["parentId", *ACLS])
    def post_snippet(self, **kwargs) -> Paragraph:
        """
        Post a new snippet.

        Args:
            **kwargs: Keyword arguments to be included in the snippet payload.

        Returns:
            Paragraph: The newly created snippet.
        """
        url = self.http_client.address + "/basesnippets"
        payload = kwargs
        if payload.get("files"):
            payload = self.upload_files(payload)

        out = cast(
            Paragraph,
            Paragraph.from_http_response(
                self.http_client.post_request(url, payload=payload, headers=HEADER_JSON)
            ),
        )
        return out

    # TODO if this is a user function add docstring
    @pinned_to_logbook(["parentId", *ACLS])
    def post_location(self, **kwargs) -> Location:
        """
        Post a new location snippet.

        Args:
            **kwargs: Keyword arguments to be included in the Location payload.

        Returns:
            Location: The newly created Location snippet.
        """
        url = self.http_client.address + "/basesnippets"
        payload = kwargs
        if payload.get("files"):
            payload = self.upload_files(payload)
        out = cast(
            Location,
            Location.from_http_response(
                self.http_client.post_request(url, payload=payload, headers=HEADER_JSON)
            ),
        )
        return out

    def upload_files(self, payload: dict) -> dict:
        """
        Upload files specified in the payload and update the payload with
        the returned fileIds and accessHashes. Typically not used directly
        by the user, but rather as part of the post_snippet and post_location methods.

        Args:
            payload (dict): The original payload containing file paths.

        Returns:
            dict: The updated payload with fileIds and accessHashes.
        """
        for file in payload.get("files", []):
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

    def _post_filesnippet(self, filepath: str, **kwargs) -> Filesnippet:
        """
        Upload a file as a Filesnippet. Primarily used by the
        upload_files method to handle file uploads for snippets that contain files.

        Args:
            filepath (str): Path to the file that ought to be uploaded
            **kwargs: Additional keyword arguments to be included in the Filesnippet payload

        Raises:
            FileNotFoundError: Raised if the file specified in filepath does not exist
            ValueError: Raised if the filepath is not pointing to a file

        Returns:
            Filesnippet: Filesnippet containing the metadata of the newly created entry
        """
        url = self.http_client.address + "/filesnippet/files"

        file_extension = os.path.splitext(filepath)[-1]
        if not file_extension:
            raise ValueError("filepath must be pointing to a file, not a directory.")
        file_extension = file_extension[1:]

        snippet = Filesnippet(**kwargs)
        snippet.fileExtension = file_extension
        payload = snippet.model_dump(exclude_none=True)

        file_descriptor = "image" if file_extension in self.IMAGE_TYPES else "file"
        multipart_form_data = {
            "file": (
                filepath + "." + file_extension,
                open(filepath, "rb"),
                f"{file_descriptor}/{file_extension}",
            ),
            "fields": (None, json.dumps(payload)),
        }
        obj = Filesnippet.from_http_response(
            self.http_client.post_request(
                url, files=multipart_form_data, headers={"Accept": "application/json"}
            )
        )
        if isinstance(obj, list):
            return obj[0]
        return obj

    @pinned_to_logbook(ACLS)
    def post_file(self, filepath: str, **kwargs) -> Filesnippet:
        """
        Upload a file. As they are disconnected from paragraphs and logbooks, there
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
    def append_files_to_snippet(
        self, snippet: Paragraph, filepaths: list[str], **kwargs
    ) -> Paragraph:
        """
        Append files or images to an already existing snippet. Files and images will be
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
            if not snippet.textcontent:
                snippet.textcontent = ""
            snippet.textcontent += file_textcontent
            snippet.files.append(file_info)

        return self.patch_snippet(snippet)

    @staticmethod
    def prepare_file_content(
        filepath: str, fsnippet: Filesnippet | None = None
    ) -> Tuple[dict, str]:
        """
        Prepare file content and textcontent for appending to a snippet.

        Args:
            filepath (str): Path to the file that ought to be prepared
            fsnippet (Filesnippet | None): Optional Filesnippet containing metadata of the file

        Returns:
            Tuple[dict, str]: A tuple containing the file information dictionary and the text content string
        """
        file_extension = filepath.split(".")[-1].lower()
        file_hash = str(uuid.uuid4())
        file_id = fsnippet.id if fsnippet and fsnippet.id else None
        access_hash = fsnippet.accessHash if fsnippet and fsnippet.accessHash else None

        if file_extension in SciLogCore.IMAGE_TYPES:
            textcontent = (
                f'<figure class="image image_resized"><img src="" title="{file_hash}"></figure>'
            )
            file_info = {
                "fileHash": file_hash,
                "filepath": filepath,
                "fileExtension": f"image/{file_extension}",
                "fileId": file_id,
                "accessHash": access_hash,
                "style": {"width": "82.25%", "height": ""},
            }

        else:
            textcontent = f'<p><a class="fileLink" target="_blank" href="file:{file_hash}">{os.path.basename(filepath)}</a></p>'
            file_info = {
                "fileHash": file_hash,
                "filepath": filepath,
                "fileExtension": f"file/{file_extension}",
                "fileId": file_id,
                "accessHash": access_hash,
            }
        return (file_info, textcontent)

    def patch_snippet(self, snippet: T, **kwargs) -> T:
        """Update (patch) snippet with given snippet.
        Args:
            snippet (T): Snippet containing the newly updated fields
        Returns:
            T: Updated snippet
        """
        url = self.http_client.address + "/basesnippets/" + snippet.id
        snippet.id = None
        snippet.createdAt = None
        snippet.createdBy = None
        snippet.updatedAt = None
        snippet.updatedBy = None
        snippet.expiresAt = None
        payload = snippet.model_dump(exclude_none=True)

        out = cast(
            T,
            snippet_factory(
                self.http_client.patch_request(url, payload=payload, headers=HEADER_JSON)
            ),
        )
        return out


class SciLog:
    def __init__(self, address: str, options: dict | None = None, **kwargs):
        """
        Initialize the SciLog client.

        Args:
            address (str): The base URL of the SciLog server, e.g. "https://scilog.psi.ch/api/v1"
            options (dict | None): Optional dictionary containing authentication options such as
                    "token", "username", "password", "login_path" and "auto_save". If not
                    provided, the client will attempt to retrieve these from the environment or
                    prompt the user.
            **kwargs: Additional keyword arguments for authentication, if needed.
        """
        self.http_client = SciLogRestAPI(address=address, options=options, **kwargs)
        self.logbook = None
        self.core = SciLogCore(self)

    def select_logbook(self, logbook: Logbook):
        """
        Select a logbook to work with. This will pin subsequent operations to the selected logbook.

        Args:
            logbook (Logbook): The logbook to select.
        """
        self.logbook = logbook

    def new(self, text: str | None = None) -> lm.LogbookMessage:
        """
        Create a new LogbookMessage instance, optionally with initial text content.

        Args:
            text (str | None): Optional initial text content for the LogbookMessage.

        Returns:
            LogbookMessage: A new instance of LogbookMessage with the provided text content.

        Raises:
            ValueError: If no logbook is currently selected.
        """
        if self.logbook is None:
            raise ValueError(
                "No logbook selected. Please select a logbook before creating a message."
            )
        msg = lm.LogbookMessage()
        if text:
            msg.add_text(text)
        return msg

    @pinned_to_logbook(["parentId"])
    def get_snippets(
        self,
        where: dict | None = None,
        limit: int = 0,
        skip: int = 0,
        fields: dict | None = None,
        include: dict | None = None,
        order: list | None = None,
        **kwargs,
    ) -> list[Basesnippet]:
        """
        Retrieve snippets from the selected logbook.

        Args:
            where (dict | None): Filter conditions for the query.
            limit (int): Maximum number of snippets to retrieve.
            skip (int): Number of snippets to skip.
            fields (dict | None): Fields to include in the response.
            include (dict | None): Related entities to include in the response.
            order (list | None): Order in which to return the snippets.
            **kwargs: Additional keyword arguments for filtering, if 'where' is not provided.

        Returns:
            list[Basesnippet]: A list of retrieved snippets.
        """
        url = self.http_client.address + "/basesnippets"

        if not where:
            where = {"and": [kwargs.copy()]}
            logger.debug("==== where condition defined via keyword arguments:%s", where)
        else:
            logger.debug("==== where condition defined directly:%s", where)
        params = self.core.make_filter(
            where=where, limit=limit, skip=skip, fields=fields, include=include, order=order
        )
        # TODO dont allow case that both where and kwargs are defined, return error in this case
        out = cast(
            list[Basesnippet],
            snippet_factory(self.http_client.get_request(url, params=params, headers=HEADER_JSON)),
        )
        return out

    @pinned_to_logbook(["parentId", *ACLS])
    def import_from_dict(self, snippet: dict, **kwargs):
        msg = snippet["textcontent"]
        snippet_dict = {k: v for k, v in snippet.items() if k != "textcontent"}
        self.send_message(msg, **snippet_dict)

    @pinned_to_logbook(["parentId", *ACLS])
    def send_message(self, msg: str, **kwargs):
        """
        Send a message to the selected logbook.

        For more complex message compositions, it is recommended to use the send_logbook_message method,
        which allows for more flexibility and control over the message content and formatting.

        Args:
            msg (str): The message text to send.
            **kwargs: Additional keyword arguments to be included in the message payload.

        """
        lm_msg = lm.LogbookMessage(**kwargs)
        lm_msg.add_text(msg)

        self.send_logbook_message(lm_msg)

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
        payload = msg._content.model_dump(exclude_none=True)
        payload["linkType"] = "paragraph"
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            self.core.post_snippet(**payload)

    def get_logbooks(
        self,
        where: dict | None = None,
        limit: int = 0,
        skip: int = 0,
        fields: dict | None = None,
        include: dict | None = None,
        order: list | None = None,
        **kwargs,
    ) -> list[Logbook]:
        """
        Retrieve logbooks available to the user, with optional filtering and pagination.

        Args:
            where (dict | None): Filter conditions for the query.
            limit (int): Maximum number of logbooks to retrieve.
            skip (int): Number of logbooks to skip.
            fields (dict | None): Fields to include in the response.
            include (dict | None): Related entities to include in the response.
            order (list | None): Order in which to return the logbooks.
            **kwargs: Additional keyword arguments for filtering, if 'where' is not provided.

        Returns:
            list[Logbook]: A list of retrieved logbooks.
        """

        url = self.http_client.address + "/logbooks"

        if not where:
            where = {"and": [kwargs.copy()]}
            logger.debug("==== where condition defined via keyword arguments:%s", where)
        else:
            logger.debug("==== where condition defined directly:%s", where)

        params = self.core.make_filter(
            where=where, limit=limit, skip=skip, fields=fields, include=include, order=order
        )
        out = cast(
            list[Logbook],
            snippet_factory(self.http_client.get_request(url, params=params, headers=HEADER_JSON)),
        )
        return out

    # TODO: review and potentially move the whole core logic here
    def post_snippet(self, **kwargs) -> Paragraph:
        """
        Post a new snippet. This method is pinned to the currently selected logbook, meaning that
        the logbook's id will automatically be included in the payload.

        Note: For sending messages to the logbook, it is recommended to use the
        send_logbook_message method, which is specifically designed for that purpose and
        provides a more user-friendly interface.

        Args:
            **kwargs: Keyword arguments to be included in the snippet payload.

        Returns:
            Paragraph: The newly created snippet.
        """
        return self.core.post_snippet(**kwargs)

    # TODO: review and potentially move the whole core logic here
    def post_location(self, **kwargs) -> Location:
        """
        Post a new location. This method is pinned to the currently selected logbook, meaning that
        the logbook's id will automatically be included in the payload.

        Args:
            **kwargs: Keyword arguments to be included in the location payload.

        Returns:
            Location: The newly created location.
        """
        return self.core.post_location(**kwargs)
