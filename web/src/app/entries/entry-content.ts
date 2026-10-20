import { ChangeStreamNotification } from '@shared/changestreamnotification.model';
import { LinkType } from '@model/paragraphs';
import { Filecontainer } from '@model/basesnippets';
import { v4 as uuid } from 'uuid';

export function extractNotificationMessage(htmlData: string, fileStorage: any = []) {
  console.log('extracting notification');

  let dataEditor = htmlData;
  var span = document.createElement('figure');
  span.innerHTML = dataEditor;

  let imgCollection = span.getElementsByTagName('img');

  let snippetFiles: Filecontainer[] = [];

  for (let index = 0; index < imgCollection.length; index++) {
    let img = imgCollection[index];
    console.log(img);
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
      container = fileStorage.find((fileEntry) => img.src.includes(fileEntry.accessHash));
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
    console.log(link);
    let f = fileStorage.find((file) => {
      return file.fileHash == link.pathname.substring(1);
    });
    if (typeof f != 'undefined') {
      snippetFiles.push(f);
    }
    if (typeof link.target != 'undefined') {
      link.target = '_blank';
    }
  });

  console.log(snippetFiles);

  console.log(span.innerHTML);

  let notification: ChangeStreamNotification = null;
  if (dataEditor != '') {
    notification = {
      linkType: LinkType.PARAGRAPH,
      textcontent: span.innerHTML,
      files: snippetFiles,
    };
  }

  return notification;
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
