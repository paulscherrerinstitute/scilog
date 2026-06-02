# SciLog SDK examples

Runnable scripts demonstrating the two clients shipped from `scilog`:

- **`logbook.py`** — uses the `SciLog` client to query logbooks, send a logbook message with text/images/tags via the `LogbookMessage` builder, and query snippets with field projection and `include=["subsnippets"]`.
- **`proposals.py`** — uses the `SciCat` client to fetch the proposal list from a catalog instance.

The `assets/` directory holds images and a sample-snippet JSON file referenced by `logbook.py`.

## Install

From this directory:

```bash
pip install -e ..
```

This installs the SDK in editable mode from the adjacent `sdk/python/` package.

## Run

```bash
# Send a message to the first logbook in pgroup p12345 on a SciLog instance
python logbook.py -u https://scilog.qa.psi.ch/api/v1 p12345

# Fetch the proposal list from a SciCat catalog
python proposals.py
```

`logbook.py` defaults to `http://localhost:3000` if `-u` is omitted.
