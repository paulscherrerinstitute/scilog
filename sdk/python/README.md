# Overview
This Python module provides a native interface to [electronic logbook APIs](https://scilog.psi.ch/). It is compatible with Python versions 3.9 and higher.

# Installation

```bash
pip install scilog
```

# Usage

For accessing logbooks you need to connect to the API server serving the logbook information at ```http[s]://<hostname>:<port>/api/v1```
For this a logbook handle must be retrieved. see also [demo.py](https://github.com/paulscherrerinstitute/scilog/blob/addPypiWorkflow/demo/demo.py) for a full example

```python
import scilog

log = SciLog("https://scilog.qa.psi.ch/api/v1")
```
This call will ask interactively for username and password in order to authenticate. The credentials are cached locally, so at the next call you wont be asked for username and password any more.

Alternatively you can pass your credentials in an options object:

```python
import scilog

log = SciLog("https://scilog.qa.psi.ch/api/v1",options={"username": "swissfelaramis-bernina@psi.ch","password":"secret"})
```

Once you have got hold of the logbook API handle all of its public methods can be used to find logbooks and to read, create, reply to, edit or delete the snippet data inside the logbooks.

## Get and Select existing logbooks

For example finding logbooks belonging to a certain ownerGroup you do a query using the get_logbooks endpoint

```python
logbooks = log.get_logbooks(where={"ownerGroup": pgroup}, limit=10, skip=0)
logbook = logbooks[0]
# make sure that further actions address this logbook
log.select_logbook(logbook)
```

## Create new Messages (Snippets)

```python
# create message structure, fill it and send it to logbook. This will result in one new snippet in the connected logbook
msg = LogbookMessage()
# you can concatenate arbitrary many add_text, add_tag and add_file commands to add text, images and tags
msg.add_text("<p>Another example text<p>").add_file("./Image1.png").add_tag(["color"])
log.send_logbook_message(msg)
```

## Get Existing Snippet data, Search Syntax

there are two ways of defining a query expression

### Simple Query:

In this case the where condition is built from the individual fields and  all key value pairs  are ANDed

```python
# get next 10 snippets, skipping first 5 snippets
snippets = log.get_snippets(limit=10,skip=5)
# get snippets creted by a specific user
snippets = log.get_snippets(createdBy='swissfelaramis-bernina@psi.ch',limit=10,skip=5)
# TODO get most recently entered snippet
```

The returned snippet objects contain the JSON formatted informations of the snippets.

### Advanced query 

In this case you  specify the where expression in Mongo/Loopback Syntax as a python dictionary
```python
# find snippets created by a certain user
snippets = log.get_snippets(where={"createdBy":'swissfelaramis-bernina@psi.ch'})
# ... and created after a given date
snippets = log.get_snippets(where={"createdBy":'swissfelaramis-bernina@psi.ch','createdAt': {"gt": '2023-01-05T15:12:00Z'}})

# Warning: DO NOT USE fields key in queries or if you need to use it, always add the id field
# like in the example below

snippets = log.get_snippets(
    createdBy="swissfelaramis-bernina@psi.ch",
    skip=5,
    fields={"id": 1, "snippetType": 1, "createdBy": 1, "createdAt": 1, "parentId":1},
    include=["subsnippets"]
)
```

## Reply to Message

```python
# TODO Reply to message 
```

## Edit Message

```python
# TODO
```

## Delete Message (and all its replies)

```python
# TODO
```




