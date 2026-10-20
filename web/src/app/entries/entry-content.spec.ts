import { extractNotificationMessage } from './entry-content';

describe('extractNotificationMessage', () => {
  it('should extract notification with new files', () => {
    let figureMock =
      '<figure class="image image_resized" style="width:79%;"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAEjgAAA2oCAIAAACtz6bAAAAACXBIWXMAAHsIAAB7CAF"></figure>"';
    let figureMockNoSrc = ['<figure class="image image_resized"><img src=""', '></figure>"'];

    let message = extractNotificationMessage(figureMock);
    expect(message.files[0].style).toEqual({ height: '', width: '79%' });
    expect(message.files[0].style).toEqual({ height: '', width: '79%' });
    expect(message.files[0].fileExtension).toEqual('image/png');
    expect(message.files[0].file).toBeTruthy();
    expect(message.files[0].fileHash).toBeTruthy();
    combineHtmlFigureHash(figureMockNoSrc, message.files[0].fileHash);
    expect(message.textcontent).toEqual(
      combineHtmlFigureHash(figureMockNoSrc, message.files[0].fileHash),
    );
  });

  it('should extract notification without files', () => {
    let figureMock =
      '<figure class="image image_resized" style="width:79%;"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAEjgAAA2oCAIAAACtz6bAAAAACXBIWXMAAHsIAAB7CAF"></figure>"';
    let figureMockNoSrc = ['<figure class="image image_resized"><img src=""', '></figure>"'];
    let fileStorageMock = [{ fileHash: 'myHash' }];

    let message = extractNotificationMessage(figureMock, fileStorageMock);
    expect(message.files[0].style).toEqual({ height: '', width: '79%' });
    expect(message.files[0].style).toEqual({ height: '', width: '79%' });
    expect(message.files[0].fileHash).toBeTruthy();
    combineHtmlFigureHash(figureMockNoSrc, message.files[0].fileHash);
    expect(message.textcontent).toEqual(
      combineHtmlFigureHash(figureMockNoSrc, message.files[0].fileHash),
    );
  });

  it('should extract links', () => {
    let linkMock = '<p><a class="fileLink" href="file:myHash">myFile.pdf</a></p>';
    let linkStorageMock = [{ fileHash: 'myHash' }];
    let message = extractNotificationMessage(linkMock, linkStorageMock);
    expect(message.files[0].fileHash).toEqual('myHash');
  });

  function combineHtmlFigureHash(figureMock: string[], hash: string) {
    return figureMock[0] + ' title="' + hash + '"' + figureMock[1];
  }
});
