# API-01 ELN conventions

- Roughly the [ELN File format](https://github.com/TheELNConsortium/TheELNFileFormat/blob/master/SPECIFICATION.md) (in terms of structure of the archive i.e. a zipped RO-Crate with .eln extension)
- Except, more informative types than `Dataset` (e.g. Book, Message, etc), instead of using the `genre` property to distinguish between ELN concepts.
- Possibility to have multiple `@type`s e.g. `[Book, Dataset]`, for best-effort compatibility with the ELN file format

## Structure of a logbook

A logbook is a collection of messages. A message may have several comments. Both messages and comments may have attached files.
We found the following schema.org types appropriate for these entities:

| ELN Concept | schema.org class                              |
| ----------- | --------------------------------------------- |
| Logbook     | [Book](https://schema.org/Book)               |
| Message     | [Message](https://schema.org/Message)         |
| Comment     | [Comment](https://schema.org/Comment)         |
| File        | [MediaObject](https://schema.org/MediaObject) |

We note that all the above types inherit from CreativeWork.

### How are the entities related?

- A Logbook (`Book`) [`hasPart`](https://schema.org/hasPart) `Message`s.
- A `Message` has `Comments` through the [`comment`](https://schema.org/comment) property.
- Files:
  - Messages have attachments (i.e. `MediaObject`s) through the [`messageAttachment`](https://schema.org/messageAttachment) property.
  - Comments have attachments through the [`sharedContent`](https://schema.org/sharedContent) property.

Visually:


```mermaid
---
title: Logbook entity-relations
---
erDiagram
    Book ||--o{ Message : hasPart
    Message ||--o{ Comment : comment
    Message ||--o{ MediaObject : messageAttachment
    Comment ||--o{ MediaObject : sharedContent
    Message ||--o| Person : author
    Comment ||--o| Person : author
    Book ||--o| Person : author
```

### Properties of the entities

The Logbook is our container type. It has a title, author / creator, description, and create/update timestamps.
We map these to following schema.org properties:

| Logbook property | schema.org property |
| ---------------- | ------------------- |
| created at       | dateCreated         |
| updated at       | dateModified        |
| title            | name                |
| description      | description         |
| creator/author   | author              |

A message and comment have the same properties, except for how they reference Files (messageAttachment vs sharedContent).

| Message / Comment property | schema.org property           |
| -------------------------- | ----------------------------- |
| created at                 | dateCreated                   |
| updated at                 | dateModified                  |
| HTML text content          | text                          |
|                            | `encodingFormat: "text/html"` |
| tags                       | keyword                       |
| author                     | author                        |

An `author` is a schema.org Person.

Finally, a File may have the usual [metadata properties](https://github.com/TheELNConsortium/TheELNFileFormat/blob/master/SPECIFICATION.md#example-file) as described in the ELN file format.

### How are attached files included?

Again, we follow the ELN file format - A `Message` or a `Comment` will have an `@id` of a local directory name. All the files attached to the message/comment will be placed in the directory, and have local identifiers as well.
