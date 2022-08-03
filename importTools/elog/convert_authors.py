#!/usr/bin/env python

DEFAULT_SEP = " : "


import argparse

parser = argparse.ArgumentParser(description="Convert collected and mapped authors to json ...")

parser.add_argument("-i", "--input", default="authors", help="Input file name")
parser.add_argument("-o", "--output", default="authors.json", help="Output file name")
parser.add_argument("-s", "--separator", default=DEFAULT_SEP, help=f"Key-value separator in the output (default: \"{DEFAULT_SEP}\")")
parser.add_argument("-d", "--default", help="Default user")
parser.add_argument("-p", "--print", action="store_true", help="Print authors")

clargs = parser.parse_args()



from pathlib import Path
import json


def author_load(fname, sep, default):
    data = text_load(fname)
    res = {}
    for line in data:
        line = line.split(sep)
        old, new = line
        if new == "":
            print(f"Warning: will use default ({default}) for author \"{old}\".")
            new = default
        res[old] = new
    return res

def text_load(fname):
    res = []
    with open(fname, "r") as f:
        for line in f:
            line = line.split("#")[0] # remove comments
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



