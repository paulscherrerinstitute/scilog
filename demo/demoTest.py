#!/usr/bin/env python
import argparse
import json

parser = argparse.ArgumentParser(formatter_class=argparse.ArgumentDefaultsHelpFormatter)
parser.add_argument("pgroup", help="Expected form: p12345")
parser.add_argument("-u", "--url", default="http://localhost:3000", help="Server address")

clargs = parser.parse_args()
pgroup = clargs.pgroup
url = clargs.url


import urllib3
from scilog import SciLog

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

log = SciLog(url, options={"username": "swissfelaramis-bernina@psi.ch"})

snippets = []
with open("./demoSnippets.json", "r") as stream:
    content = stream.read()
    snippets = json.loads(content)

logbooks = log.get_logbooks(ownerGroup=pgroup)
assert len(logbooks) >= 1
logbook = logbooks[0]
log.select_logbook(logbook)

for snippet in snippets:
    log.import_from_dict(snippet=snippet)
