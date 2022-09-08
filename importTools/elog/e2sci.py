#!/usr/bin/env python

import base64
import json
import os
import uuid
from datetime import datetime
from glob import iglob
from os import walk

import requests
from scilog.scilog import SciLog

import pprint
pp = pprint.PrettyPrinter(indent=4)

def json_load(filename, *args, **kwargs):
    with open(filename, "r") as f:
        return json.load(f, *args, **kwargs)


def json_save(what, filename, *args, indent=4, sort_keys=True, **kwargs):
    with open(filename, "w") as f:
        json.dump(what, f, *args, indent=indent, sort_keys=sort_keys, **kwargs)


def get_image_src(html_input: str):
    attachment = html_input.split("src=")[1].split(" ")[0]
    attachment = attachment.replace("/", "_")
    return attachment


default_author = "unknown@domain.org"


mapped = {
    "Date": "createdAt",
}

ignored = [
    "Encoding",  # seems to be always HTML
    "MID",  # message ID
    # "Section",  # seems to be always the endstation
    "When",  # unclear how this differs from Date
    "Reply to",  # for now ignored
    "In reply to",  # for now ignored
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
attachments_path = f"{dump_path}/dump/attachments/"

attachment_lib = next(walk(attachments_path), (None, None, []))[2]

fns = sorted(iglob(f"{dump_path}/dump/msg*.json"))
res = []
ranges = [
    {"pgroup": "p18539", "start": 269, "end": 2132},
    {"pgroup": "p18713", "start": 2584, "end": 3564},
    {"pgroup": "p18711", "start": 3639, "end": 3989},
    {"pgroup": "p18763", "start": 4808, "end": 5137},
    {"pgroup": "p18915", "start": 5289, "end": 6135},
    {"pgroup": "p19160", "start": 6824, "end": 7707},
    {"pgroup": "p19303", "start": 8081, "end": 8591},
    {"pgroup": "p19318", "start": 8644, "end": 9046},
    {"pgroup": "p19319", "start": 9149, "end": 9664},
    {"pgroup": "p19320", "start": 9850, "end": 10290},
    {"pgroup": "p19321", "start": 10437, "end": 11009},
    # {"pgroup": "p19525", "start": 11425, "end": 12090},
    {"pgroup": "p19704", "start": 12735, "end": 13219},
    {"pgroup": "p19740", "start": 14065, "end": 14412},
    {"pgroup": "p19741", "start": 14443, "end": 15178},
    {"pgroup": "p19742", "start": 15193, "end": 15906},
    {"pgroup": "p20230", "start": 15908, "end": 16446},
]

for fn in fns:
    print(fn)
    data_out = {}
    data_in = json_load(fn)

    for k, v in data_in.items():
        if k in mapped or k in ignored or k in special or k in tags:
            continue
        print(fn, "has unassigned key:", k, "=", repr(v))

    default_pgroup = "any-authenticated-user"
    # check the chosen range
    for range in ranges:
        if range["start"] <= data_in["MID"] <= range["end"]:
            default_pgroup = range["pgroup"]
            break

    if default_pgroup == "any-authenticated-user":
        continue

    # if data_in["MID"] > 10757 :
    #      continue

    print ("This msg is selected")
    # remove ignored entries
    for i in ignored:
        data_in.pop(i, None)

    # copy mapped entries
    tmp = {o: data_in.pop(i) for i, o in mapped.items()}
    tmp = {k: v for k, v in tmp.items() if v}
    data_out.update(tmp)

    # convert date info
    tdate = datetime.strptime(data_out["createdAt"], "%a, %d %b %Y %H:%M:%S %z")
    data_out["createdAt"] = datetime.strftime(tdate, "%Y-%m-%dT%H:%M:%S%z")
    data_out["updatedAt"] = data_out["createdAt"]

    # make tags
    tmp = [data_in.pop(t, None) for t in tags]
    tmp = [i for i in tmp if i]
    if tmp:
        data_out["tags"] = tmp

    # treat special entries
    author = data_in.pop("Author")
    author = authors.get(author, default_author)
    data_out["createdBy"] = author
    data_out["updatedBy"] = author

    pgroup = data_in.pop("P-Group", default_pgroup)

    data_out["createACL"] = [pgroup]
    data_out["readACL"] = ["default"]
    data_out["updateACL"] = ["default"]
    data_out["deleteACL"] = ["default"]
    data_out["shareACL"] = ["default"]
    data_out["adminACL"] = ["default"]

    attchs = data_in.pop("attachments")
    # remove empty entries which seem sometimes to appear
    while '' in attchs:
       attchs.remove('')

    mesg = data_in.pop("message")

    mesg_parts = mesg.split("<img")
    mesg = mesg_parts[0]
    files = []
    if len(mesg_parts) > 1:
        for msg in mesg_parts[1:]:
            attachment = None
            msg_parts = msg.split("/>")
            source_attachment = get_image_src(msg_parts[0])
            index = None
            for ii, att in enumerate(attchs):
                if att in source_attachment:
                    index = ii
                    break
            if index:
                attachment = attchs.pop(index) 
            else:
                # image not contained as attachment
                for att in attachment_lib:
                    if att in source_attachment:
                        attachment = att
                        break
                if not attachment:
                    print("File not found in dumped attachment files")
                    try:
                        file_extension = [
                            ext
                            for ext in ["png", "jpg", "jpeg", "http"]
                            if ext in source_attachment.split(",")[0]
                        ]
                        if len(file_extension) != 1:
                            raise ValueError("Unknown file extension.")
                        file_extension = file_extension[0]
                        if file_extension == "http":
                            attachment = (
                                f"{os.path.basename(fn).split('.')[0]}_{str(uuid.uuid4())}.png"
                            )
                            r = requests.get(source_attachment[1:-1].replace("_", "/"))
                            print("==== adding missing http external file to attachments:",f"{attachments_path}{attachment}")
                            with open(f"{attachments_path}{attachment}", "wb") as output:
                                output.write(r.content)
                        else:
                            attachment = f"{os.path.basename(fn).split('.')[0]}_{str(uuid.uuid4())}.{file_extension}"
                            source_attachment = source_attachment.split(",")[1][0:-1].replace(
                                "_", "/"
                            )
                            print("==== adding base64 file to attachments:",f"{attachments_path}{attachment}")
                            with open(f"{attachments_path}{attachment}", "wb") as file_stream:
                                file_stream.write(base64.decodebytes(source_attachment.encode()))
                    except Exception as e:
                        print("Failed to parse embedded image.")
                        attachment = None
            if attachment:
                filepath = os.path.abspath(f"{dump_path}/dump/attachments/{attachment}")
                file_info, file_textcontent = SciLog.prepare_file_content(filepath)
                files.append(file_info)
                mesg += file_textcontent
            mesg += "".join(msg_parts[1:])

    title = data_in.pop("Title", None)
    if title == None:
        title = ""
    title = title.strip()
    title = f"<p><h3>{title}</h3></p>"

    textcontent = title + mesg

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
