import {expect} from '@loopback/testlab';
import {ElnErrorCode} from '../../../../services/eln/errors';
import {OpenbisTranslator} from '../../../../services/eln/translators/openbis';
import {LinkType} from '../../../../models/paragraph.model';
import {validOpenbisCrate, validScilogCrate} from '../../../eln.helpers';

const translator = new OpenbisTranslator();

const BOOK = '/DEMO/BOOK1';
const MESSAGE = '/DEMO/MESSAGE1';
const COMMENT = '/DEMO/COMMENT1';
const PERSON = '/PERSON1';

describe('OpenbisTranslator.matches', () => {
  it('matches a crate whose @context declares the openBIS prefix', () => {
    expect(translator.matches(validOpenbisCrate())).to.be.true();
  });

  it('does not match a SciLog crate', () => {
    expect(translator.matches(validScilogCrate())).to.be.false();
  });
});

describe('OpenbisTranslator.validate', () => {
  it('accepts a fully valid crate', () => {
    expect(translator.validate(validOpenbisCrate())).to.be.empty();
  });

  it('rejects a crate with no BOOK', () => {
    const crate = validOpenbisCrate();
    crate.setProperty(BOOK, '@type', 'Dataset');
    expect(translator.validate(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_ELN_ENTITY, message: 'Missing BOOK'},
    ]);
  });

  it('rejects a crate with more than one BOOK', () => {
    const crate = validOpenbisCrate();
    crate.addEntity({'@id': '/DEMO/BOOK2', '@type': 'BOOK'});
    expect(translator.validate(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_ELN_STRUCTURE},
    ]);
  });

  it('rejects a BOOK missing a required field', () => {
    const crate = validOpenbisCrate();
    crate.deleteProperty(BOOK, 'openBIS:hasNAME');
    expect(translator.validate(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_DATASET_FIELD},
    ]);
  });

  it('rejects a MESSAGE missing a required field', () => {
    const crate = validOpenbisCrate();
    crate.deleteProperty(MESSAGE, 'openBIS:hasMESSAGE.CREATED_AT');
    expect(translator.validate(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_DATASET_FIELD},
    ]);
  });

  it('rejects a COMMENT missing a required field', () => {
    const crate = validOpenbisCrate();
    crate.deleteProperty(COMMENT, 'openBIS:hasCOMMENT.CREATED_AT');
    expect(translator.validate(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_DATASET_FIELD},
    ]);
  });

  it('rejects a dangling message reference', () => {
    const crate = validOpenbisCrate();
    crate.setProperty(BOOK, 'openBIS:hasBOOK.HASMESSAGE', {
      '@id': '/DEMO/GHOST',
    });
    expect(translator.validate(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_ELN_ENTITY},
    ]);
  });

  it('rejects a dangling file reference', () => {
    const crate = validOpenbisCrate();
    crate.setProperty(MESSAGE, 'schema:hasPart', {'@id': 'data/missing.png'});
    expect(translator.validate(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_ELN_ENTITY},
    ]);
  });

  it('rejects a dangling comment reference', () => {
    const crate = validOpenbisCrate();
    crate.setProperty(MESSAGE, 'openBIS:hasMESSAGE.HASCOMMENT', {
      '@id': '/DEMO/GHOST',
    });
    expect(translator.validate(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_ELN_ENTITY},
    ]);
  });

  it('rejects a missing author', () => {
    const crate = validOpenbisCrate();
    crate.setProperty(MESSAGE, 'openBIS:hasMESSAGE.AUTHOR', {'@id': '/GHOST'});
    expect(translator.validate(crate)).to.containDeep([
      {code: ElnErrorCode.MISSING_ELN_ENTITY},
    ]);
  });

  it('rejects a PERSON without an email', () => {
    const crate = validOpenbisCrate();
    crate.deleteProperty(PERSON, 'openBIS:hasPERSON.EMAIL');
    expect(translator.validate(crate)).to.containDeep([
      {code: ElnErrorCode.INVALID_AUTHOR},
    ]);
  });

  it('collects errors from across the graph', () => {
    const crate = validOpenbisCrate();
    crate.deleteProperty(BOOK, 'openBIS:hasNAME');
    crate.setProperty(MESSAGE, 'openBIS:hasMESSAGE.HASCOMMENT', {
      '@id': '/DEMO/GHOST',
    });
    const errors = translator.validate(crate);
    expect(errors).to.containDeep([{code: ElnErrorCode.MISSING_DATASET_FIELD}]);
    expect(errors).to.containDeep([{code: ElnErrorCode.MISSING_ELN_ENTITY}]);
  });
});

describe('OpenbisTranslator.toSciLog', () => {
  it('assembles the tree: a paragraph with its file and nested comment', () => {
    const draft = translator.toSciLog(validOpenbisCrate());
    expect(draft.paragraphs).to.have.length(2);

    const [message] = draft.paragraphs;
    expect(message.fields.linkType).to.equal(LinkType.PARAGRAPH);
    expect(message.files.map(file => file.elnId)).to.deepEqual([
      'data/a%20b.png',
    ]);

    expect(message.paragraphs).to.have.length(1);
    const [comment] = message.paragraphs;
    expect(comment.fields.linkType).to.equal(LinkType.COMMENT);
    expect(comment.files).to.be.empty();
    expect(comment.paragraphs).to.be.empty();
  });

  it('yields no paragraphs when the BOOK links no messages', () => {
    const crate = validOpenbisCrate();
    crate.deleteProperty(BOOK, 'openBIS:hasBOOK.HASMESSAGE');
    expect(translator.toSciLog(crate).paragraphs).to.be.empty();
  });

  describe('logbook', () => {
    it('extracts fields and provenance tags from the BOOK entity', () => {
      expect(translator.toSciLog(validOpenbisCrate()).fields).to.deepEqual({
        name: 'Demo Logbook',
        tags: [
          'eln:source:openbis',
          'eln:id:/DEMO/BOOK1',
          'eln:author:john.doe@example.org',
          'eln:created:2026-08-24',
        ],
      });
    });

    it('omits provenance tags whose values are absent', () => {
      const crate = validOpenbisCrate();
      crate.deleteProperty(BOOK, 'openBIS:hasBOOK.AUTHOR');
      crate.deleteProperty(BOOK, 'openBIS:hasBOOK.CREATED_AT');
      expect(translator.toSciLog(crate).fields).to.deepEqual({
        name: 'Demo Logbook',
        tags: ['eln:source:openbis', 'eln:id:/DEMO/BOOK1'],
      });
    });

    it('drops the created tag when CREATED_AT is unparseable', () => {
      const crate = validOpenbisCrate();
      crate.setProperty(BOOK, 'openBIS:hasBOOK.CREATED_AT', 'not-a-date');
      const {tags} = translator.toSciLog(crate).fields;
      expect(
        (tags ?? []).some(tag => tag.startsWith('eln:created:')),
      ).to.be.false();
    });
  });

  describe('paragraphs', () => {
    it('maps MESSAGE fields with linkType=paragraph and the extracted body', () => {
      const [message] = translator.toSciLog(validOpenbisCrate()).paragraphs;
      expect(message.fields).to.deepEqual({
        linkType: LinkType.PARAGRAPH,
        textcontent:
          '<p>hello</p><figure class="image"><img src="data/a%20b.png"></figure>',
        tags: [
          'eln:id:/DEMO/MESSAGE1',
          'eln:author:john.doe@example.org',
          'eln:created:2026-08-24',
        ],
        defaultOrder: new Date('2026-08-24T09:18:42Z').getTime() * 1000,
      });
    });

    it('derives defaultOrder from each message CREATED_AT', () => {
      const {paragraphs} = translator.toSciLog(validOpenbisCrate());
      expect(paragraphs[1].fields.defaultOrder).to.equal(
        new Date('2026-08-24T09:19:38Z').getTime() * 1000,
      );
    });
  });

  describe('files', () => {
    it('embeds the File entity with a decoded name on its message', () => {
      const [message] = translator.toSciLog(validOpenbisCrate()).paragraphs;
      expect(message.files).to.deepEqual([
        {
          elnId: 'data/a%20b.png',
          fields: {
            name: 'a b.png',
            filename: 'a b.png',
            fileExtension: 'png',
            tags: ['eln:id:data/a%20b.png'],
          },
        },
      ]);
    });

    it('leaves fileExtension undefined when the name has no extension', () => {
      const crate = validOpenbisCrate();
      crate.addEntity({'@id': 'data/README', '@type': 'File'});
      crate.addValues(MESSAGE, 'schema:hasPart', {'@id': 'data/README'});
      const [message] = translator.toSciLog(crate).paragraphs;
      const readme = message.files.find(file => file.elnId === 'data/README');
      expect(readme?.fields.fileExtension).to.be.undefined();
    });
  });

  describe('comments', () => {
    it('maps COMMENT fields with linkType=comment and plain, unwrapped text', () => {
      const [message] = translator.toSciLog(validOpenbisCrate()).paragraphs;
      const [comment] = message.paragraphs;
      expect(comment.fields).to.deepEqual({
        linkType: LinkType.COMMENT,
        textcontent: 'a comment',
        tags: [
          'eln:id:/DEMO/COMMENT1',
          'eln:author:john.doe@example.org',
          'eln:created:2026-08-24',
        ],
        defaultOrder: new Date('2026-08-24T09:15:02Z').getTime() * 1000,
      });
    });

    it('escapes markup so comment text renders as literal text', () => {
      const crate = validOpenbisCrate();
      crate.setProperty(COMMENT, 'openBIS:hasCOMMENT.TEXT', '<b>x</b> & y');
      const [message] = translator.toSciLog(crate).paragraphs;
      const [comment] = message.paragraphs;
      expect(comment.fields.textcontent).to.equal(
        '&lt;b&gt;x&lt;/b&gt; &amp; y',
      );
    });
  });
});
