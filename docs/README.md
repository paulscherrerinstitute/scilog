![scilog_logo.png](assets/scilog_logo.png)

# SciLog Electronic Logbook Overview
![Build Status](https://github.com/paulscherrerinstitute/scilog/actions/workflows/deploy-docu.yaml/badge.svg)

## Why SciLog ?

SciLog supports you as a scientist to capture as much information as possible while conducting an experiment or a measurement. In particular it allows you to easily enter information about data otherwise not readily available, e.g. when you did what with what intentions. Both text and images can be added easily. All this can be done in a collaborative fashion, where several people, potentially separated by large distances, work on the same experiment. All connected users see the same status of the available information in real time. 

SciLog is meant to replace the need for a paper written logbook, while keeping the ease of use of a paper written logbook. The resulting electronic logbook is an important addition to the metadata  describing the process, which generates the resulting datasets (and which are typically stored in a separate data catalog) and adds to the overall goal of making data F.A.I.R, in particular by improving on the aspect of reproducibility (R) of the data. In contrast to paper logbooks it adds readabaility  ;-) , ease of sharing and searchability of the entered information. Furthermore it allows to reuse the information in different contexts and to export the data to other systems.

SciLog has its *sweet spot* in supporting usually non-repetitive, collaborative experiments, but can as well be used in more structured or automated situations or in situations, where a single user wants to keep track of what he/she is doing. Data can be added to the logbook both manually by a human being or automatically via a command line (CLI) or REST programming interface from other processes, such as the data acquisition processes.


### Important concepts

SciLog clearly separates the storage of the entered data (*Backend*) from its representation to the user (*Frontend*). This has many advantages, in particular being able to adjust the representation of the data to specific use cases, while reusing a common backend of the data. 

The Backend is implement on the basis of a document database Mongo connected to a REST-API layer based on Loopback 4.

Frontends can be added choosing differnt GUI technologies (e.g. web based or Qt) and languages (Typescript, Python, C++). The current SciLog implementation comes with a default web based frontend implemented with Angular/Typescript as a so called *responsive single page application*(SPA) . In this way the GUI can be used both on a PC and on a smartphone or tablet.

The data is stored in a very fine grained way in so called *snippets* of data. Example of such snippet data are a short text or an image. The data entered into SciLog is automatically enriched with additional metadata, in particular about who and when the snippet was entered. The user can furthermore add tags to each snippet, thus improving on the searching and sorting capabilities. In this way data can be displayed in the frontend in  a structured but still flexible way. 

The underlying document database allows to query the snippet data , using all the available metadata fields as filter and or sorting criteria. The snippets are queried in order to present them in a logical (usually time sorted) manner to the user.

Snippets are connected via parent-child relationships. E.g. a  paragraph usually has a logboook snippet as a parent (think of this relation as a belongsTo relation, the snippet *belongs* to the logbook). Since logbooks are also snippets a hierarchy of logbooks can be created.

The database is initially filled with snippets of type *location* (e.g. a beamline or an instrument), describing the device that generates the data. A logbook is subsequently connected to a location at creation time. At PSI we create logbook instances automatically from the information provided in the digital uer office (DUO) system. Then the user can select from these pre-defined logbooks to enter their experiment data, i.e. *opening* the logbook. The user then adds further information in form of text and images to this logbook via the provided GUI(s). The connection to the respective logbooks are automatically provided by the system.

The following snippet types are currently supported: location (describing the beamline or instrument), logbook (containing the data snippets), paragraph (i.e. any HTMl text with Headings, tables etc), file (for attachments), image (for graphs, illustrations, photos etc), task (e.g. for todo lists)

All snippet types are derived from a basesnippet class, which offers common base functionality:
* keeping track of when data was created/updated and when updating options will expire (timestamps)
* definition of access control lists (ACLs) defining who can create/read/update/delete/share and manage data
* openAccess logic (to make images readable without need for authentication)
* pre-calculate on the fly user dependent calculatedACLs (not persistently stored in DB)
* history handling of snippet data when snippets are updated
* history and optional restore logic when snippets are deleted

Different connected users (*clients*) see the same status of the entered data, changes done
by one client are automatically propagated to all connected clients
via a push mechanism, based on websockets and supported by the underlying Mongo DB.

Since snippets are stored *independently* they can be presented in different contexts. So called virtual logbooks allow to enrich the displayed snippet data with  snippets of *other* logbooks by defining a query expression: all snippets from other logbooks fulfilling the query condition and to which the logged in user has read access will then be dispalyed along with the *normal* snippet data of this logbook. A typical use case may be, that a beamline manager wants to see all snippet data tagged with tag *manager* from other logbooks in the context of his *beamline manager* logbook, collecting information across different experiments, but conducted at the same beamline or instrument. 

In addition to interacting via the GUI users can also interact via the REST API directly (in any language of their choice) or they can use the Python SDK offered to deal with the snippet data via a command line interface. This is especially useful to connect other processes to SciLog, such as the data acquisition processes, or to migrate data from other existing electronic logbooks.

## Structure of Documentation

The documentaion is split into the following chapters:

* [User Guide](Users) - Users of the system can come here to see screen captures, FAQs and find resources on how to better understand SciLog.
* [Ingestor Guide](Ingestor) - Instrument responsibles read this to understand how data can ge ingested into SciLog either manually or in an automated fashion from external processes.
* [Operator Guide](Operator) - System admins read this part to set up SciLog for their institute
* [Developer Guide](Development) - Developers who want to contribute to the project should read this chapter.

## Talks and Posters

<div>
<a href="assets/scilog_poster.pdf" download>Poster at NOBUGS conference 2022</a>
</div>