#!/usr/bin/env python3

import argparse

parser = argparse.ArgumentParser(formatter_class=argparse.ArgumentDefaultsHelpFormatter)
parser.add_argument("pgroup", help="Expected form: p12345")
parser.add_argument("-u", "--url", default="https://lnode2.psi.ch/api/v1", help="Server address")

clargs = parser.parse_args()
pgroup = clargs.pgroup
url = clargs.url


import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


from scilog import Basesnippet, Paragraph, SciLog

tmp = Basesnippet()
tmp.id = "2"

log = SciLog(url)
# print(log.token)
logbooks = log.get_logbooks(ownerGroup=pgroup)
print(logbooks)

assert len(logbooks) == 1
logbook = logbooks[0]
print(logbook)

log.select_logbook(logbook)
import time

time.sleep(5)
import datetime

begin_time = datetime.datetime.now()
for ii in range(1000):
    log.send_message(f"<p>from python; number: {ii}</p>")
# print(res)
print(datetime.datetime.now() - begin_time)

# snips = log.get_snippets(snippetType="paragraph", ownerGroup=pgroup)
# print(snips)
