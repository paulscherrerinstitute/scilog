#!/usr/bin/env python

# call it like below, specifying the URL of the API server and the group,
# for which you want to search a logbook
# The first logbook found will be used to add some example data and retrieve
# data back
# The account used is predefined in the code , change it to your needs
#
# python3 ./demo.py -u https://scilog.qa.psi.ch/api/v1 p12345

import argparse
import logging

from scilog import LogbookMessage, SciLog

logging.basicConfig(format="%(levelname)s:%(message)s", level=logging.INFO)
logger = logging.getLogger(__name__)

parser = argparse.ArgumentParser(formatter_class=argparse.ArgumentDefaultsHelpFormatter)
parser.add_argument("pgroup", help="Expected form: p12345")
parser.add_argument("-u", "--url", default="http://localhost:3000", help="Server address")

clargs = parser.parse_args()
pgroup = clargs.pgroup
url = clargs.url

# urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# connect under a given user name
# (likely this will be a functional account like a beamline account)
# (note: at PSI OIDC authenticated users can not authenticate from the CLI)

log = SciLog(url, options={"username": "swissfelaramis-bernina@psi.ch"})
logbooks = log.get_logbooks(where={"ownerGroup": pgroup}, limit=10, skip=0)
assert len(logbooks) >= 1
logbook = logbooks[0]

# make sure that further actions to this logbook
log.select_logbook(logbook)

# example of *adding* information (text,images,tags) to this  logbook. You can concatenate as much informationas you like
msg = LogbookMessage()
msg.add_text("<p>Another example text<p>").add_file("./Image1.png").add_tag(["color"]).add_text(
    "<p>After the image<p>"
).add_file("./Image2.png").add_tag(["testtag"])
log.send_logbook_message(msg)

# Querying data: (the skip and limit arguments are optional)

# there are two ways of defining a query expression

# simple case:
# the where condition is built from the individual fields, all key value pairs ANDed
# snippets = log.get_snippets(limit=10,skip=5)
# snippets = log.get_snippets(createdBy='swissfelaramis-bernina@psi.ch',limit=10,skip=5)

# most flexible case: specify the where expression in Mongo/Loopback Syntax as python dictionary
# snippets = log.get_snippets(where={"createdBy":'swissfelaramis-bernina@psi.ch'})
# snippets = log.get_snippets(where={"createdBy":'swissfelaramis-bernina@psi.ch','createdAt': {"gt": '2023-01-05T15:12:00Z'}})

# Warning: DO NOT USE fields key in queries or if you need to use it, always add the id field
# like in the example below

snippets = log.get_snippets(
    createdBy="swissfelaramis-bernina@psi.ch",
    skip=5,
    fields={"id": 1, "snippetType": 1, "createdBy": 1, "createdAt": 1, "parentId": 1},
    include=["subsnippets"],
)

for snippet in snippets:
    print("==== Snippet:", snippet)
