
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import FileDialogButtonView from '@ckeditor/ckeditor5-upload/src/ui/filedialogbuttonview';
import imageIcon from './clip.svg'; //'@ckeditor/ckeditor5-core/theme/icons/image.svg';

export default class InsertFile extends Plugin {
    init() {
        const editor = this.editor;
        editor.ui.componentFactory.add('insertFile', locale => {
            const view = new FileDialogButtonView(locale);

            view.set({
                acceptedType: '*',
                allowMultipleFiles: true
            });

            view.buttonView.set({
                label: 'Insert file',
                icon: imageIcon,
                tooltip: true
            });

            view.on('done', async (evt, files) => {
                const { v4: uuidv4 } = require('uuid');
                for (const file of Array.from(files)) {
                    console.log('Selected file', file);
                    // let fileContent = await this.createBlobFromFile(file);
                    // console.log(fileContent)
                    let fnameHash = uuidv4();
                    editor.model.change(writer => {
                        const link = writer.createText(file.name);

                        writer.setAttribute('linkHref', 'file:' + fnameHash, link);
                        console.log(link)
                        this.editor.model.insertContent(link, this.editor.model.document.selection);
                    });
                    let fnameParts = file.name.split('.');
                    let fileStorage = {
                        file: file,
                        fileHash: fnameHash,
                        fileExtension: 'file/' + fnameParts[fnameParts.length - 1]
                    }
                    this.editor.prel_filestorage = [fileStorage];
                }
            });

            return view;
        });
    }

    createBlobFromFile(file) {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result)
                console.log(reader)
            };
            reader.readAsBinaryString(file);
        })

    }
}
