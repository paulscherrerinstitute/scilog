# Use of Python SDK

The SDK ships an example script, [`logbook.py`](https://github.com/paulscherrerinstitute/scilog/tree/main/sdk/python/examples/logbook.py), that adds a paragraph containing text, images and tags and queries existing snippets in a logbook. It is heavily commented, walking through the steps and query options.

```
cd sdk/python/examples
pip install -e ..
python3 ./logbook.py -u https://scilog.qa.psi.ch/api/v1 p20580
```
