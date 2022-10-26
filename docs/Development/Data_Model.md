# An Introduction to the Data Model

## Model

There are only a few models models within the catalog and many of them are self explanatory. The API server creates routes for creation, retrieval, modification and deletion. However, it is worth explaining the core models that are used. You can explore the full API and the underlying models by navigating to api/v1/explorer URL on your installed instance, e.g. [scilog development instance](https://scilog.development.psi.ch/api/v1/explorer)


## The Basesnippet model

The most important model is the base snippet model and its related functions. For the schema just follow the Schema link at [Basesnippet description](https://scilog.development.psi.ch/api/v1/explorer/#/BasesnippetController/BasesnippetController.find )

It describes the fields that each snippet type will have, like date, ownership and history related information. Also the relation to a parent snippet is defined here.

Many other models are derived from this model. Derived models define the type via the *snippetType* field value


## Location
Describes a location of an activity like a measurement and is usually a description of a beammline or instrument together with some thumbnail image .

## Logbook
Each logboook is defined as snippet type *logbook* . A logbook always is linked to a location. Different accounts get different access rights depending on the logbook ACLs, which are partly derived from the location information.

The data model and its API endpoints are described in [Logbook controller](https://scilog.development.psi.ch/api/v1/explorer/#/LogbookController/LogbookController.find)

## Paragraph
TODO

## File
TODO

## Image
TODO

## Task

## Job



