#!/usr/bin/env python3

import os

from dotenv import load_dotenv
from scilog import Location, SciCat, SciLog

from psi_webpage_icon_extractor import PSIWebpageIconExtractor


def prepare_location_snippet(log):
    snips = log.get_snippets(snippetType="location", name="root")
    if snips:
        print("location snippet exists already:", snips[0].id)
        assert len(snips) == 1
        loc_id = snips[0].id
        return loc_id

    filepath = os.environ["SCILOG_DEFAULT_LOGBOOK_ICON"]
    location_snippet = {
        "isPrivate": True,
        "snippetType": "location",
        "name": "root",
        "location": "root",
        "accessGroups": ["any-authenticated-user"],
        "files": [{"filepath": filepath}],
    }
    snip = log.post_snippet(**location_snippet)
    loc_id = snip.id
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
        # if (not(prop["ownerGroup"] in ["p18539", "p18713","p18711", "p18763","p18915", "p19160","p19303","p19318","p19319","p19320","p19321","p19704","p19740", "p19741","p19742","p20230"])):
        #     continue
        for ag in prop["accessGroups"]:
            accessGroups.add(ag)

        loc = prop["MeasurementPeriodList"][0]["instrument"]
        locations.add(loc)

        proposalsStorage.append(
            {
                "ownerGroup": prop["ownerGroup"],
                "abstract": prop["abstract"],
                "title": prop["title"],
                "location": prop["MeasurementPeriodList"][0]["instrument"],
            }
        )

    return accessGroups, locations, proposalsStorage


def _update_locations(log, loc_id, locations):
    locationStorage = {}

    locations_snippet = log.get_snippets(id=loc_id)[0]

    for loc in locations:
        # TODO: move this to the first loop?
        if loc[:4] != "/PSI":
            raise RuntimeError("Unexpected facility prefix")

        snips = log.get_snippets(parentId=loc_id, location=loc)

        if snips:
            assert len(snips) == 1
            snip = snips[0]
            locationStorage[loc] = snip
            continue

        group = loc[5:].replace("/", "").lower()
        files = None
        try:
            img = PSIWebpageIconExtractor(
                "https://www.psi.ch/", f"en/{loc[5:].lower()}", loc[5:].split("/")[-1]
            )
            filepath = os.path.abspath(img.filepath)
            files = [{"filepath": filepath}]
        except IndexError as exc:
            print(exc)

        if not files:
            files = locations_snippet.files

        new_location = Location()
        new_location.accessGroups = ["any-authenticated-user"]
        new_location.isPrivate = True
        new_location.location = loc
        new_location.name = loc.split("/")[-1]
        new_location.files = files
        new_location.parentId = loc_id

        snip = log.post_location(**new_location.to_dict(include_none=False))
        locationStorage[loc] = snip

    return locationStorage


def _update_proposals(log, locationStorage, proposalsStorage):
    for proposal in proposalsStorage:
        ownerGroup = proposal["ownerGroup"]

        locStr = proposal["location"]
        loc = locationStorage[locStr]

        new_snip = {
            "ownerGroup": ownerGroup,
            "isPrivate": False,
            "name": proposal["title"],
            "location": loc.id,
            "description": proposal["abstract"],
            "snippetType": "logbook",
        }

        if loc.files:
            new_snip["thumbnail"] = loc.files[0]["fileId"]
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


class ClientSettingsFromEnv:
    def __init__(self, name):
        self.address = os.environ[f"{name}_URL"]
        self.options = {
            "username": os.environ[f"{name}_USERNAME"],
            "password": os.environ[f"{name}_PWD"],
            "login_path": "/".join(
                [self.address.strip("/"), os.environ[f"{name}_LOGIN"].strip("/")]
            ),
        }


if __name__ == "__main__":
    load_dotenv()
    scicat = ClientSettingsFromEnv("SCICAT")

    scilog = ClientSettingsFromEnv("SCILOG")

    cat = SciCat(**scicat.__dict__)
    props = cat.proposals

    log = SciLog(**scilog.__dict__)
    loc_id = prepare_location_snippet(log)

    update_locations_and_proposals(log, loc_id, props)
