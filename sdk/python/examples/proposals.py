#!/usr/bin/env python3
"""Demonstrates the bundled SciCat client (fetching proposals from a catalog)."""

import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


from scilog import SciCat

url = "https://dacat.psi.ch/api/v3/"
cat = SciCat(url)

props = cat.proposals
nprops = len(props)
print(f"got {nprops} proposals")
print(props[0])
