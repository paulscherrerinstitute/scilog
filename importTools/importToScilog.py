#!/usr/bin/env python
import argparse
import json

parser = argparse.ArgumentParser(formatter_class=argparse.ArgumentDefaultsHelpFormatter)
# parser.add_argument("pgroup", help="Expected form: p12345")
parser.add_argument("-u", "--url", default="http://localhost:3000", help="Server address")

clargs = parser.parse_args()
# pgroup = clargs.pgroup
url = clargs.url


import urllib3
from scilog import SciLog

from elog.utils import retry

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


log = SciLog(url, options={"username": "scilog-admin@psi.ch"})


snippets = []
with open("./elog/scilog.json", "r") as stream:
    content = stream.read()
    snippets = json.loads(content)

retry_get = retry(log.get_logbooks)
retry_import = retry(log.import_from_dict)
previous_owner = ""
for snippet in snippets:
    owner = snippet["ownerGroup"]
    if owner == "any-authenticated-user":
        continue
    if owner != previous_owner:
        print(owner)
        logbooks = retry_get(ownerGroup=owner)
        previous_owner = owner
    assert len(logbooks) >= 1
    logbook = logbooks[0]
    log.select_logbook(logbook)
    retry_import(snippet=snippet)
