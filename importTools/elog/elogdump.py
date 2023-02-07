#!/usr/bin/env python

import argparse
import imghdr

parser = argparse.ArgumentParser(
    description="Dump an elog ...", formatter_class=argparse.ArgumentDefaultsHelpFormatter
)

parser.add_argument("url", help="elog URL, e.g., https://elog-gfa.psi.ch/SwissFEL+test/")
parser.add_argument("-o", "--output", default="dump", help="Output folder")
parser.add_argument(
    "-a",
    "--attachments",
    default="attachments",
    help="Attachments sub-folder relative to the output folder",
)

clargs = parser.parse_args()


import builtins
import json
import os
import shutil

from tqdm import tqdm
import elog
import urllib3

from utils import retry

# Certs are not valid...
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
http = urllib3.PoolManager(cert_reqs="CERT_NONE")


# HTML messages contain some code-formatting characters
FORMATTING_CHARS = ["\n", "\t"]


class ELogScraper:
    def __init__(self, url, output_folder=".", attachment_subfolder="attachments"):
        self.url = url = (
            url if url.endswith("/") else url + "/"
        )  # TODO: only needed for attachments bug!

        self.output_folder = output_folder
        mkdirs(output_folder)

        self.attachment_folder = attachment_folder = os.path.join(
            output_folder, attachment_subfolder
        )
        self.fd = FileDownloader(attachment_folder)

        self.lb = elog.open(url)
        self.elog_read = retry(self.lb.read)

        mids = self.lb.get_message_ids()
        self.mids = sorted(mids)
        # to selectively dump messages: self.mids = sorted(i for i in mids if i <= 13120)
        self.nmsgs = nmsgs = len(mids)
        self.counter_width = len(str(nmsgs))

    def dump(self):
        print()
        print(f"Dumping {self.nmsgs} messages from {self.url}")
        print(f"- Messages to:    {self.output_folder}")
        print(f"- Attachments to: {self.attachment_folder}")
        print()
        try:
            builtins.print = tqdm.write  # otherwise print() breaks tqdm
            for msg in tqdm(self.get_entries(), total=self.nmsgs):
                pass
        except KeyboardInterrupt:
            raise SystemExit(
                f'\nDump not finished! You might want to delete the "{output}" folder.'
            )
        finally:
            builtins.print = print

    def get_entries(self):
        for i in self.mids:
            yield self.get_entry(i)

    def get_entry(self, index):
        message, attributes, attachments = self.elog_read(index)
        message = sanitize_message(message)
        attributes = sanitize_attributes(index, attributes)
        attachments = sanitize_attachments(attachments, self.url)
        fns = self.fd.get(attachments)
        entry = build_entry(index, message, attributes, fns)

        counter = str(index).zfill(self.counter_width)
        fname = f"msg{counter}.json"
        fname = os.path.join(self.output_folder, fname)

        json_dump(entry, fname)
        return entry


def sanitize_message(message):
    return remove_all(message, FORMATTING_CHARS)


def remove_all(s, chars):
    for c in chars:
        s = s.replace(c, "")
    return s


def sanitize_attributes(i, attributes):
    mid = attributes.pop("$@MID@$")
    mid = int(mid)
    assert i == mid
    attributes["MID"] = i
    return attributes


def sanitize_attachments(attachments, url):
    #    if attachments == [url]: #TODO: WTF?!
    #        attachments = []
    return attachments


def build_entry(i, message, attributes, attachments):
    entry = {}
    entry.update(attributes)
    entry["attachments"] = attachments
    entry["message"] = message
    return entry


def json_dump(data, fname):
    with open(fname, "w") as f:
        json.dump(data, f, sort_keys=True, indent=4)


class FileDownloader:
    def __init__(self, folder="."):
        self.folder = folder
        mkdirs(folder)

    def get(self, urls):
        return [self.get_file(u) for u in urls]

    def get_file(self, url):
        fname = extract_filename(url)
        full_fname = os.path.join(self.folder, fname)
        # fix missing extensions here
        if fname != "":
            pathname, extension = os.path.splitext(fname)
            if extension == "":
                extension = "png"  # for now assume its a png file, TODO imghdr.what(attachment)
                fname = pathname + "." + extension
                print(f"After =========== {fname}")
            print(f"{url} -> {fname}")
            download(url, full_fname)
        return fname


def extract_filename(url):
    parsed_url = urllib3.util.parse_url(url)
    path = parsed_url.path
    fname = os.path.basename(path)
    return fname


def download(url, fname):
    with http.request("GET", url, preload_content=False) as resp:
        print(f"{url} -> {fname}")
        with open(fname, "wb") as f:
            shutil.copyfileobj(resp, f)
    resp.release_conn()


def mkdirs(folder):
    os.makedirs(folder, exist_ok=True)


if __name__ == "__main__":
    url = clargs.url
    output = clargs.output
    attachments = clargs.attachments
    els = ELogScraper(url, output_folder=output, attachment_subfolder=attachments)
    els.dump()
