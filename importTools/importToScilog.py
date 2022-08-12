#!/usr/bin/env python
import argparse

parser = argparse.ArgumentParser(formatter_class=argparse.ArgumentDefaultsHelpFormatter)
# parser.add_argument("pgroup", help="Expected form: p12345")
parser.add_argument("-u", "--url", default="http://localhost:3000", help="Server address")

clargs = parser.parse_args()
# pgroup = clargs.pgroup
url = clargs.url


import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


from scilog import SciLog
from scilog import Basesnippet, Paragraph
import json

log = SciLog(url, options={"username": "scilog-admin@psi.ch"})


snippets = []
with open("./elog/scilog.json", "r") as stream:
    content = stream.read()
    snippets = json.loads(content)

for snippet in snippets:
    pgroup=snippet["ownerGroup"]
    if pgroup == "any-authenticated-user":
        continue
    logbooks = log.get_logbooks(ownerGroup=pgroup)
    assert len(logbooks) >= 1
    logbook = logbooks[0]
    log.select_logbook(logbook)
    log.import_from_dict(snippet=snippet)
