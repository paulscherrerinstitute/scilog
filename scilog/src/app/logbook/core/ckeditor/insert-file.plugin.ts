import { Plugin, FileDialogButtonView, icons } from 'ckeditor5';
import { v4 as uuid } from 'uuid';
import type { FileAttachment } from './editor';

export class InsertFile extends Plugin {
  init() {
    const editor = this.editor;
    editor.ui.componentFactory.add('insertFile', (locale) => {
      const view = new FileDialogButtonView(locale);

      view.set({
        acceptedType: '*',
        allowMultipleFiles: true,
      });

      view.buttonView.set({
        label: 'Insert file',
        icon: icons.browseFiles,
        tooltip: true,
      });

      view.on('done', (_evt, files: FileList) => {
        for (const file of Array.from(files)) {
          const fnameHash = uuid();
          editor.model.change((writer) => {
            const link = writer.createText(file.name, { linkHref: 'file:' + fnameHash });
            editor.model.insertContent(link, editor.model.document.selection);
          });
          const fnameParts = file.name.split('.');
          const fileAttachment: FileAttachment = {
            file,
            fileHash: fnameHash,
            fileExtension: 'file/' + fnameParts[fnameParts.length - 1],
          };
          editor.fileAttachments = [...(editor.fileAttachments ?? []), fileAttachment];
        }
      });

      return view;
    });
  }
}
