Below we give a mapping from SciLog concepts to ELN terms.

| SciLog Concept | ELN term /schema.org property |
|----------------|----------|
| Logbook        | @type=Dataset, genre=experiment |
| Paragraph      | @type=Dataset, genre=experiment     |
| Logbook -->is_parent_of--> Paragraph | mentions |
| comments       | comment |
| Paragraph.textContent | text |
| tags           | keywords |
| Snippet.createdAt | dateCreated |
| Snippet.updatedAt | dateModified |
| Logbook.title | name |
| Logbook.description | description |

The `Dataset`s are further classified by the `genre` property as per the ELN spec ([issue](https://github.com/TheELNConsortium/TheELNFileFormat/pull/103)). The value of `experiment` is used for both Logbooks and Paragraphs. This is to done to be compatible with elabFTW. Other possible values in elabFTW are `resource`.
(From here: https://github.com/TheELNConsortium/TheELNFileFormat/discussions/55:
How to discriminate experiments, samples, equipements
Use genre: https://schema.org/genre)
