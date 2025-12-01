import {expect} from '@loopback/testlab';
import {Paragraph} from '../../models';
import {Filesnippet} from '../../models/file.model';
import {EntityBuilderService} from '../../services';

describe('EntityBuilderService (unit)', () => {
  let entityBuilder: EntityBuilderService;

  beforeEach(() => {
    entityBuilder = new EntityBuilderService();
  });

  it('replaces image references in paragraph textcontent', () => {
    const fileHash = 'testHash123';
    const paragraph: Paragraph = new Paragraph({
      id: 'snippet-1',
      textcontent: `<p>This is a paragraph with an image: <img title="${fileHash}"></p>`,
      files: [
        {
          fileId: '12345',
          fileHash: fileHash,
        },
      ],
    });
    const fileObj: Filesnippet = new Filesnippet({
      id: '12345',
      _fileId: 'file-67890',
      contentType: 'image/png',
      fileExtension: 'png',
    });

    const updatedText = entityBuilder.replaceFileReferences(paragraph, fileObj);
    const expectedSrc = entityBuilder.getFilePath(
      paragraph.id,
      fileObj._fileId,
      fileObj.fileExtension,
    );
    expect(updatedText).to.containEql(`src="${expectedSrc}"`);
  });

  it('replaces attachment references in paragraph textcontent', () => {
    const fileHash = 'attachHash456';
    const paragraph: Paragraph = new Paragraph({
      id: 'snippet-2',
      textcontent: `<p>Download the file <a href="file:${fileHash}">here</a></p>`,
      files: [
        {
          fileId: '67890',
          fileHash: fileHash,
        },
      ],
    });
    const fileObj: Filesnippet = new Filesnippet({
      id: '67890',
      _fileId: 'file-54321',
      contentType: 'application/pdf',
      fileExtension: 'pdf',
    });

    const updatedText = entityBuilder.replaceFileReferences(paragraph, fileObj);
    const expectedHref = entityBuilder.getFilePath(
      paragraph.id,
      fileObj._fileId,
      fileObj.fileExtension,
    );
    expect(updatedText).to.containEql(`href="${expectedHref}"`);
  });
});
