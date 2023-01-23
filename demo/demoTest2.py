#!/usr/bin/env python
import argparse
import json
import logging

logging.basicConfig(format="%(levelname)s:%(message)s", level=logging.INFO)
logger = logging.getLogger(__name__)

# ./testing.py -u https://scilog.qa.psi.ch/api/v1 scilog-adminQA@psi.ch

parser = argparse.ArgumentParser(formatter_class=argparse.ArgumentDefaultsHelpFormatter)
parser.add_argument("pgroup", help="Expected form: p12345")
parser.add_argument("-u", "--url", default="http://localhost:3000", help="Server address")

clargs = parser.parse_args()
pgroup = clargs.pgroup
url = clargs.url


import urllib3
from scilog import LogbookMessage, SciLog

# urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# connect under a given user name
# (likely this will be a functional account like a beamline account)
# (note: OIDC authenticated users can not authenticate from the CLI)

log = SciLog(url, options={"username": "swissfelaramis-bernina@psi.ch"})

# there are two ways of defining a query expression

# simple case: the where condition is built from the individual fields
# logbooks = log.get_logbooks(ownerGroup=pgroup)

# most flexible case: specify the where expression in Mongo Syntax as python dictionary

logbooks = log.get_logbooks(where={"ownerGroup": pgroup}, limit=10, skip=0)
assert len(logbooks) >= 1
logbook = logbooks[0]
# print("Logbook:",logbook)

# make sure that further actions to this logbook
log.select_logbook(logbook)

# example of *adding* information (text,images,tags) to this  logbook
# TODO: currently gives error: {"files":["is not defined in the model"],"linkType":["is not defined in the model"]}
# msg = LogbookMessage()
# msg.add_text("<p>Another example text<p>").add_file("./Image1.png").add_tag(["color"]).add_text("<p>After the image<p>").add_file("./Image2.png").add_tag(["testtag"])
# log.send_logbook_message(msg)

# # examples of *getting* snippet with *full* loopback 4 query syntax possibilities
# snippets = log.get_snippets(where={"createdBy":'swissfelaramis-bernina@psi.ch'})
# snippets = log.get_snippets(where={"createdBy":'swissfelaramis-bernina@psi.ch','createdAt': {"gt": '2023-01-05T15:12:00Z'}})

# # examples with *simplified* filter condition (All key value pairs ANDed)
# snippets = log.get_snippets(limit=10,skip=5)
# snippets = log.get_snippets(createdBy='swissfelaramis-bernina@psi.ch',limit=10,skip=5)
snippets = log.get_snippets(
    createdBy="swissfelaramis-bernina@psi.ch",
    limit=10,
    skip=5,
    fields={"snippetType": 1, "createdBy": 1, "createdAt": 1},
)

for snippet in snippets:
    print("==== Snippet:", snippet)
