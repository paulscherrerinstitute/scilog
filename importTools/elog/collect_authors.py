#!/usr/bin/env python

DEFAULT_SEP = " : "


import argparse

parser = argparse.ArgumentParser(description="Collect authors from an elog dump ...")

parser.add_argument("-d", "--dump", default="dump", help="Folder containing the elog dump")
parser.add_argument("-o", "--output", default="authors", help="Output file name")
parser.add_argument(
    "-s",
    "--separator",
    default=DEFAULT_SEP,
    help=f'Key-value separator in the output (default: "{DEFAULT_SEP}")',
)
parser.add_argument("-p", "--print", action="store_true", help="Print authors")

clargs = parser.parse_args()


import json
from pathlib import Path


def collect(folder):
    dump = Path(folder)
    fns = dump.glob("msg*.json")
    authors = set()
    for fn in sorted(fns):
        data = json_load(fn)
        author = data["Author"]
        authors.add(author)

    authors = sorted(authors)
    return authors


def check(authors, print_all=False):
    for a in authors:
        if print_all:
            print(a)

        stripped_author = a.strip()
        if a != stripped_author:
            print(f'Warning: Author "{author}" has strippable spaces.')

        if a == "":
            print("Warning: Author is the empty string.")


def save(authors, output, sep):
    data = [f"{a}{sep}" for a in authors]
    text_save(data, output)


def json_load(fname):
    with open(fname, "r") as f:
        return json.load(f)


def text_save(data, fname):
    with open(fname, "w") as f:
        for line in data:
            f.write(line)
            f.write("\n")


if __name__ == "__main__":
    authors = collect(clargs.dump)
    check(authors, clargs.print)
    save(authors, clargs.output, clargs.separator)
