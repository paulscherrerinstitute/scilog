import { Filecontainer } from '@model/basesnippets';
import { v4 as uuid } from 'uuid';
import { parseInertHtml } from './parse-inert-html';

/** The HTML of an entry and the files it refers to, with the field names of `Paragraphs`. */
export interface EntryContent {
  textcontent: string;
  files: Filecontainer[];
}

/**
 * Turns the editor's HTML into entry content. `knownFiles` are the files the
 * HTML may refer to.
 *
 * - Returns null only for `''`.
 * - A `data:` image becomes a new file with a random `fileHash`.
 * - An `http` image belongs to the known file whose `accessHash`, or `fileId`
 *   if it has no `accessHash`, is the last segment of the URL path. That file's
 *   `style` is overwritten with the width and height of the image's parent
 *   element. Throws if the URL is not valid or no known file matches.
 * - For every image with a file, the `style` of its parent element is removed
 *   and its `title` is set to the file's `fileHash`.
 * - A link adds the known file whose `fileHash` is the link's path without
 *   the leading `/`, as in `file:<fileHash>`. The scheme is not checked.
 * - `files` lists the images in document order, then the links. A file can
 *   appear more than once. Known files are the same objects as in
 *   `knownFiles`.
 */
export function entryContentFromEditorHtml(
  html: string,
  knownFiles: Filecontainer[] = [],
): EntryContent | null {
  if (html == '') return null;

  const span = parseInertHtml(html);

  let imgCollection = span.getElementsByTagName('img');

  let snippetFiles: Filecontainer[] = [];

  for (let index = 0; index < imgCollection.length; index++) {
    let img = imgCollection[index];
    let container: Filecontainer;
    if (img.src.startsWith('data:')) {
      // new image
      let blobData = dataURItoBlob(img.src);
      let type = img.src.split(',')[0].split(':')[1].split(';')[0];
      let file = new File([blobData], 'subFigure', { type: type });
      container = {
        style: {
          width: img.parentElement.style.width,
          height: img.parentElement.style.height,
        },
        file: file,
        fileHash: uuid(),
        fileExtension: type,
      };
      img.src = '';
    } else if (img.src.startsWith('http')) {
      // check for existing file
      const imageId = new URL(img.src).pathname.split('/').pop();
      container = knownFiles.find(
        (fileEntry) => (fileEntry.accessHash ?? fileEntry.fileId) == imageId,
      );
      container.style = {
        width: img.parentElement.style.width,
        height: img.parentElement.style.height,
      };
    }

    if (container != undefined) {
      snippetFiles.push(container);
      img.parentElement.removeAttribute('style');
      img.title = container.fileHash;
    }
  }

  let links = span.querySelectorAll('a');
  links.forEach((link) => {
    let f = knownFiles.find((file) => {
      return file.fileHash == link.pathname.substring(1);
    });
    if (typeof f != 'undefined') {
      snippetFiles.push(f);
    }
  });

  return { textcontent: span.innerHTML, files: snippetFiles };
}

function dataURItoBlob(dataURI: string) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0) byteString = atob(dataURI.split(',')[1]);
  else byteString = unescape(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], { type: mimeString });
}
