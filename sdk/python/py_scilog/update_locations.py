#!/usr/bin/env python3

import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


from scicat import SciCat, SciLog


def prepare_location_snippet(log):
    snips = log.get_snippets(title="location", ownerGroup="admin")

    if snips:
        assert len(snips) == 1
        loc_id = snips[0]["id"]
        return loc_id

    new_loc = {
        "ownerGroup": "admin",
        "accessGroups": ["customer"],
        "isPrivate": True,
        "title": "location",
        "snippetType": "paragraph",
    }

    snip = log.post_snippet(**new_loc)
    loc_id = snip["id"]
    return loc_id


def update_locations_and_proposals(log, loc_id, proposals):
    _accessGroups, locations, proposalsStorage = _collect_data(proposals)
    locationStorage = _update_locations(log, loc_id, locations)
    _update_proposals(log, locationStorage, proposalsStorage)


def _collect_data(proposals):
    accessGroups = set()
    locations = set()
    proposalsStorage = []

    for prop in proposals:
        for ag in prop["accessGroups"]:
            accessGroups.add(ag)

        loc = prop["MeasurementPeriodList"][0]["instrument"]
        locations.add(loc)

        proposalsStorage.append({
            "ownerGroup": prop["ownerGroup"],
            "abstract": prop["abstract"],
            "title": prop["title"],
            "location": prop["MeasurementPeriodList"][0]["instrument"]
        })

    return accessGroups, locations, proposalsStorage


def _update_locations(log, loc_id, locations):
    locationStorage = dict()

    for loc in locations:
        #TODO: move this to the first loop?
        if loc[:4] != "/PSI":
            raise RuntimeError("Unexpected facility prefix")

        snips = log.get_snippets(parentId=loc_id, location=loc)

        if snips:
            assert len(snips) == 1
            snip = snips[0]
            locationStorage[loc] = snip
            continue

        group = loc[5:].replace("/", "").lower()
        new_snip = {
            "ownerGroup": group,
            "accessGroups": ["customer"],
            "isPrivate": True,
            "title": loc.split("/")[-1],
            "location": loc,
            "contact": group + "@psi.ch",
            "snippetType": "image",
            "parentId": loc_id,
            "file": "files/default_logbook_icon.jpg"
        }

        if "thumbnail" in loc:
            new_snip["file"] = loc["thumbnail"]

        snip = log.post_request(**new_snip)
        locationStorage[loc] = snip

    return locationStorage


def _update_proposals(log, locationStorage, proposalsStorage):
    for proposal in proposalsStorage:
        ownerGroup = proposal["ownerGroup"]

        loc = proposal["location"]
        loc = locationStorage[loc]

        new_snip = {
            "ownerGroup": ownerGroup,
            "accessGroups": [loc["ownerGroup"]],
            "isPrivate": False,
            "name": proposal["title"],
            "location": loc["id"],
            "description": proposal["abstract"],
            "snippetType": "logbook"
        }

        if "file" in loc:
            new_snip["thumbnail"] = loc["file"]
        if not new_snip["name"]:
            new_snip["name"] = ownerGroup
        if not new_snip["description"]:
            new_snip["description"] = "No proposal found."

        snips = log.get_snippets(snippetType="logbook", ownerGroup=ownerGroup)

        if snips:
            print(f"Logbook exists already for ownerGroup {ownerGroup}")
            continue

        print(f"Adding new logbook for ownerGroup {ownerGroup}")
        snip = log.post_snippet(**new_snip)
        print(snip)





if __name__ == "__main__":
    url = "https://dacat.psi.ch/api/v3/"
    cat = SciCat(url)
    props = cat.proposals

    url = "https://lnode2.psi.ch/api/v1"
    log = SciLog(url)
    loc_id = prepare_location_snippet(log)

    update_locations_and_proposals(log, loc_id, props)



