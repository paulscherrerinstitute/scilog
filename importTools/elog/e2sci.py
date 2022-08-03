#!/usr/bin/env python

from glob import iglob
import json
import uuid

def json_load(filename, *args, **kwargs):
    with open(filename, "r") as f:
        return json.load(f, *args, **kwargs)

def json_save(what, filename, *args, indent=4, sort_keys=True, **kwargs):
    with open(filename, "w") as f:
        json.dump(what, f, *args, indent=indent, sort_keys=sort_keys, **kwargs)




default_pgroup = "default"
default_author = "default"


mapped = {
#    "Author": "createdBy",
    "Date": "timestamp",
#    "message": "textcontent",
#    "P-Group": "ownerGroup"
}

ignored = [
    "Encoding", # seems to be always HTML
    "MID", # message ID
    "Section", # seems to be always the endstation
    "When" # unclear how this differs from Date
]

special = [
    "Author",
    "attachments",
    "P-Group",
    "message",
    "Title"
]

tags = [
    "Component",
    "Entry",
    "System",

    "Category",
    "Domain",
    "Effect",
    "Valid until",
    "Group",
    "Type"
]


authors = json_load("authors.json")

fns = sorted(iglob("dump/msg*.json"))
res = []
for fn in fns:
    data_out = {}
    data_in = json_load(fn)

    for k, v in data_in.items():
        if k in mapped or k in ignored or k in special or k in tags:
            continue
        print(fn, "has unassigned key:", k, "=", repr(v))

    # remove ignored entries
    for i in ignored:
        data_in.pop(i)

    # copy mapped entries
    tmp = {o: data_in.pop(i) for i, o in mapped.items()}
    tmp = {k: v for k, v in tmp.items() if v}
    data_out.update(tmp)

    # make tags
    tmp = [data_in.pop(t, None) for t in tags]
    tmp = [i for i in tmp if i]
    if tmp:
        data_out["tags"] = tmp

    # treat special entries
    author = data_in.pop("Author")
    author = authors.get(author, default_author)
    data_out["createdBy"] = author

    pgroup = data_in.pop("P-Group", default_pgroup)
    data_out["ownerGroup"] = pgroup

    data_out["accessGroups"] = [author, pgroup]


    mesg = data_in.pop("message")
    title = data_in.pop("Title")
    title = title.strip()
    title = f"<p><h3>{title}</h3></p>"

    textcontent = title + mesg
    files = []

    attchs = data_in.pop("attachments")
    if attchs:
        for fn in attchs:
            f_hash = str(uuid.uuid4())
            f_id = str(uuid.uuid4())
            filepath = f"./dump/attachments/{fn}"
            f_ext = fn.split(".")[-1]
            textcontent += (
                f'<p><a class="fileLink" target="_blank" href="file:{f_hash}">{fn}</a></p>'
            )
            files.append({"fileHash": f_hash, "fileId": f_id, "fileExtension": f"file/{f_ext}", "filepath": filepath})

    data_out["textcontent"] = textcontent
    data_out["files"] = files

    if data_in:
        raise ValueError(f"there are unassigned entries in \"{fn}\": {data_in}")

    data_out["snippetType"] = data_out["linkType"] = "paragraph"

    res.append(data_out)


json_save(res, "scilog.json")



