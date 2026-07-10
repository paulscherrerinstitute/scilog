import {expect} from '@loopback/testlab';
import {Paragraph} from '../../models';
import {Filesnippet} from '../../models/file.model';
import {EntityBuilderService} from '../../services';

describe('EntityBuilderService (unit)', () => {
  let entityBuilder: EntityBuilderService;

  beforeEach(() => {
    entityBuilder = new EntityBuilderService();
  });

  const testCases = [
    {
      name: 'image references',
      fileHash: 'testHash123',
      snippetId: 'snippet-1',
      fileId: '12345',
      gridfsId: 'file-67890',
      contentType: 'image/png',
      fileExtension: 'png',
      htmlContent: (hash: string) =>
        `<p>This is a paragraph with an image: <img title="${hash}"></p>`,
      expectedAttribute: 'src',
      selector: 'img',
    },
    {
      name: 'attachment references',
      fileHash: 'attachHash456',
      snippetId: 'snippet-2',
      fileId: '67890',
      gridfsId: 'file-54321',
      contentType: 'application/pdf',
      fileExtension: 'pdf',
      htmlContent: (hash: string) =>
        `<p>Download the file <a href="file:${hash}">here</a></p>`,
      expectedAttribute: 'href',
      selector: 'a',
    },
  ];

  testCases.forEach(testCase => {
    it(`replaces ${testCase.name} in paragraph textcontent`, () => {
      const paragraph: Paragraph = new Paragraph({
        id: testCase.snippetId,
        textcontent: testCase.htmlContent(testCase.fileHash),
        files: [
          {
            fileId: testCase.fileId,
            fileHash: testCase.fileHash,
          },
        ],
      });
      const fileObj: Filesnippet = new Filesnippet({
        id: testCase.fileId,
        _fileId: testCase.gridfsId,
        contentType: testCase.contentType,
        fileExtension: testCase.fileExtension,
      });

      const updatedText = entityBuilder.replaceFileReferences(
        paragraph,
        fileObj,
      );
      const expectedPath = entityBuilder.getFilePath(
        paragraph.id,
        fileObj._fileId,
        fileObj.fileExtension,
      );
      expect(updatedText).to.containEql(
        `${testCase.expectedAttribute}="${expectedPath}"`,
      );
    });
  });
});
