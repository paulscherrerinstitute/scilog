#!/usr/bin/env python

import json
import os
from glob import iglob
from datetime import datetime

from scilog.scilog import SciLog


def json_load(filename, *args, **kwargs):
    with open(filename, "r") as f:
        return json.load(f, *args, **kwargs)


def json_save(what, filename, *args, indent=4, sort_keys=True, **kwargs):
    with open(filename, "w") as f:
        json.dump(what, f, *args, indent=indent, sort_keys=sort_keys, **kwargs)


default_pgroup = "any-authenticated-user"
default_author = "unknown@domain.org"


mapped = {
    "Date": "createdAt",
}

ignored = [
    "Encoding",  # seems to be always HTML
    "MID",  # message ID
    # "Section",  # seems to be always the endstation
    "When",  # unclear how this differs from Date
    "Reply to", # for now ignored
    "In reply to" # for now ignored
]

special = ["Author", "attachments", "P-Group", "message", "Title"]

tags = [
    "Component",
    "Entry",
    "System",
    "Subsystem",
    "Category",
    "Domain",
    "Effect",
    "Valid until",
    "Group",
    "Type",
    "Subject",
    "Section",
]


authors = json_load("authors.json")

dump_path = "./"

fns = sorted(iglob(f"{dump_path}/dump/msg*.json"))
res = []
ranges=[
    {"pgroup":"p18539", "start": 269,   "end": 2132 },
    {"pgroup":"p18713", "start": 2584,  "end": 3564 },
    {"pgroup":"p18711", "start": 3639,  "end": 3989 },
    {"pgroup":"p18763", "start": 4808,  "end": 5137 },
    {"pgroup":"p18915", "start": 5289,  "end": 6135 },
    {"pgroup":"p19160", "start": 6824,  "end": 7707 },
    {"pgroup":"p19303", "start": 8081,  "end": 8591 },
    {"pgroup":"p19318", "start": 8644,  "end": 9046 },
    {"pgroup":"p19319", "start": 9149,  "end": 9664 },
    {"pgroup":"p19320", "start": 9850,  "end": 10290 },
    {"pgroup":"p19321", "start": 10437, "end": 11009 },
    {"pgroup":"p19525", "start": 11425, "end": 12090 },
    {"pgroup":"p19704", "start": 12735, "end": 13219 },
    {"pgroup":"p19740", "start": 14065, "end": 14412 },
    {"pgroup":"p19741", "start": 14443, "end": 15178 },
    {"pgroup":"p19742", "start": 15193, "end": 15906 },
    {"pgroup":"p20230", "start": 15908, "end": 16446 },
]

for fn in fns:
    print(fn)
    data_out = {}
    data_in = json_load(fn)

    for k, v in data_in.items():
        if k in mapped or k in ignored or k in special or k in tags:
            continue
        print(fn, "has unassigned key:", k, "=", repr(v))

    # check the chosen range
    for range in ranges:
        if range["start"] <= data_in["MID"] <= range["end"]:
            default_pgroup= range["pgroup"]
            break

    # remove ignored entries
    for i in ignored:
        data_in.pop(i,None)

    # copy mapped entries
    tmp = {o: data_in.pop(i) for i, o in mapped.items()}
    tmp = {k: v for k, v in tmp.items() if v}
    data_out.update(tmp)

    #convert date info
    tdate=datetime.strptime(data_out["createdAt"], '%a, %d %b %Y %H:%M:%S %z')
    data_out["createdAt"]=datetime.strftime(tdate, "%Y-%m-%dT%H:%M:%S%z")
    data_out["updatedAt"]=data_out["createdAt"]

    # make tags
    tmp = [data_in.pop(t, None) for t in tags]
    tmp = [i for i in tmp if i]
    if tmp:
        data_out["tags"] = tmp

    # treat special entries
       # treat special entries
    author = data_in.pop("Author")
    author = authors.get(author, default_author)
    data_out["createdBy"] = author
    data_out["updatedBy"] = author


    pgroup = data_in.pop("P-Group", default_pgroup)
    data_out["ownerGroup"] = pgroup

    data_out["accessGroups"] = []

    mesg = data_in.pop("message")
    title = data_in.pop("Title",None)
    if title == None:
        title=""
    title = title.strip()
    title = f"<p><h3>{title}</h3></p>"

    textcontent = title + mesg
    files = []

    attchs = data_in.pop("attachments")
    if attchs:
        for fn in attchs:
            filepath = os.path.abspath(f"{dump_path}/dump/attachments/{fn}")
            file_info, file_textcontent = SciLog.prepare_file_content(filepath)
            files.append(file_info)
            textcontent += file_textcontent

    data_out["textcontent"] = textcontent
    data_out["files"] = files

    if data_in:
        raise ValueError(f"there are unassigned entries in {fn}: {data_in}")

    data_out["snippetType"] = data_out["linkType"] = "paragraph"

    res.append(data_out)


json_save(res, "scilog.json")
