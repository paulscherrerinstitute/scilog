#!/usr/bin/env python

DEFAULT_SEP = " : "


import argparse
from subprocess import Popen, PIPE

parser = argparse.ArgumentParser(description="Convert collected and mapped authors to json ...")

parser.add_argument("-i", "--input", default="authors", help="Input file name")
parser.add_argument("-o", "--output", default="authors.json", help="Output file name")
parser.add_argument(
    "-s",
    "--separator",
    default=DEFAULT_SEP,
    help=f'Key-value separator in the output (default: "{DEFAULT_SEP}")',
)
parser.add_argument("-d", "--default", help="Default user")
parser.add_argument("-p", "--print", action="store_true", help="Print authors")

clargs = parser.parse_args()


from pathlib import Path
import json
import ldap

con = ldap.initialize("ldaps://d.psi.ch")


def author_load(fname, sep, default):
    data = text_load(fname)
    res = {}
    for line in data:
        line = line.split(sep)
        old, new = line
        if new == "":
            if len(old.split(" ")) < 2:
                continue
            surname = old.split(" ")[0]
            givenName = old.split(" ")[1]
            print("Will try to map author to email address using ldap", surname, givenName)
            ldapres = con.search_s(
                f"ou=users,ou=psi,dc=d,dc=psi,dc=ch",
                ldap.SCOPE_SUBTREE,
                f"(&(sn={surname})(givenName={givenName}*))",
                ["cn", "mail", "sn", "givenName"],
            )
            print("Res:", ldapres)
            if ldapres == []:
                new = f"{givenName}.{surname}@psi.ch"
            else:
                for dn, entry in ldapres:
                    new = entry["mail"][0].decode()
                    # print(repr(entry["mail"][0]),repr(entry["sn"]))
            res[old] = new
            print("Resulting email:", new)
    return res


def text_load(fname):
    res = []
    with open(fname, "r") as f:
        for line in f:
            line = line.split("#")[0]  # remove comments
            line = line.rstrip("\n")
            if not line:
                continue
            res.append(line)
    return res


def print_dict(d):
    length = maxstrlen(d.keys())
    for k, v in d.items():
        print(k.rjust(length), "->", v)


def maxstrlen(seq):
    return max(strlen(i) for i in seq)


def strlen(val):
    return len(str(val))


def json_dump(data, fname):
    with open(fname, "w") as f:
        json.dump(data, f, sort_keys=True, indent=4)


if __name__ == "__main__":
    author_map = author_load(clargs.input, clargs.separator, clargs.default)
    if clargs.print:
        print_dict(author_map)
    json_dump(author_map, clargs.output)
