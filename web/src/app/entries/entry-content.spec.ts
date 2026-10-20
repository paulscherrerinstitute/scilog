import { extractNotificationMessage } from './entry-content';

// Decodes to the bytes 00 01 02 FF.
const IMAGE_DATA_URI = 'data:image/png;base64,AAEC/w==';
const NEW_IMAGE_FIGURE = `<figure class="image"><img src="${IMAGE_DATA_URI}"></figure>`;

function parseBody(html: string) {
  return new DOMParser().parseFromString(html, 'text/html').body;
}

describe('extractNotificationMessage', () => {
  describe('new images', () => {
    it('turns a data: image into a new file', () => {
      const message = extractNotificationMessage(NEW_IMAGE_FIGURE);

      const file = message.files[0];
      expect(file.file).toBeInstanceOf(File);
      expect(file.file.type).toBe('image/png');
      // The upload in remote-data.service takes the extension from this MIME type.
      expect(file.fileExtension).toBe('image/png');
      expect(file.fileHash).toBeTruthy();
      const img = parseBody(message.textcontent).querySelector('img');
      expect(img.getAttribute('src')).toBe('');
      expect(img.title).toBe(file.fileHash);
    });

    it('stores the decoded bytes of a base64 data: image', async () => {
      const message = extractNotificationMessage(NEW_IMAGE_FIGURE);

      const bytes = new Uint8Array(await message.files[0].file.arrayBuffer());
      expect(Array.from(bytes)).toEqual([0, 1, 2, 255]);
    });

    it('stores the decoded bytes of a URL-encoded data: image', async () => {
      const message = extractNotificationMessage(
        '<figure class="image"><img src="data:image/png,%00%01%FF"></figure>',
      );

      const bytes = new Uint8Array(await message.files[0].file.arrayBuffer());
      expect(Array.from(bytes)).toEqual([0, 1, 255]);
    });

    it('moves the figure width into files[].style', () => {
      const message = extractNotificationMessage(
        `<figure class="image image_resized" style="width:79%;"><img src="${IMAGE_DATA_URI}"></figure>`,
      );

      expect(message.files[0].style).toEqual({ width: '79%', height: '' });
      const figure = parseBody(message.textcontent).querySelector('figure');
      expect(figure.hasAttribute('style')).toBeFalse();
    });

    it('gives each new image its own file', () => {
      const message = extractNotificationMessage(NEW_IMAGE_FIGURE + NEW_IMAGE_FIGURE);

      const hashes = message.files.map((file) => file.fileHash);
      expect(hashes).toHaveSize(2);
      expect(hashes[0]).not.toBe(hashes[1]);
      const titles = Array.from(parseBody(message.textcontent).querySelectorAll('img')).map(
        (img) => img.title,
      );
      expect(titles).toEqual(hashes);
    });
  });

  describe('existing images', () => {
    it('links an http image to the known file with that accessHash', () => {
      const src = 'http://localhost/images/abc';
      const message = extractNotificationMessage(
        `<figure class="image image_resized" style="width:50%;"><img src="${src}"></figure>`,
        [{ fileHash: 'h1', accessHash: 'abc' }],
      );

      expect(message.files[0].fileHash).toBe('h1');
      expect(message.files[0].style).toEqual({ width: '50%', height: '' });
      const img = parseBody(message.textcontent).querySelector('img');
      expect(img.title).toBe('h1');
      expect(img.getAttribute('src')).toBe(src);
    });
  });

  describe('links', () => {
    it('adds the known file that a file: link points to', () => {
      const message = extractNotificationMessage('<p><a href="file:myHash">myFile.pdf</a></p>', [
        { fileHash: 'myHash' },
      ]);

      expect(message.files.map((file) => file.fileHash)).toEqual(['myHash']);
    });

    it('adds no file for a link to an unknown file', () => {
      const message = extractNotificationMessage('<p><a href="file:otherHash">other.pdf</a></p>', [
        { fileHash: 'myHash' },
      ]);

      expect(message.files).toEqual([]);
    });
  });

  describe('other HTML', () => {
    it('returns null for empty editor data', () => {
      expect(extractNotificationMessage('')).toBeNull();
    });

    it('keeps HTML without images or links unchanged', () => {
      const html = '<p>Some <strong>text</strong></p>';

      expect(extractNotificationMessage(html).textcontent).toBe(html);
    });
  });
});
