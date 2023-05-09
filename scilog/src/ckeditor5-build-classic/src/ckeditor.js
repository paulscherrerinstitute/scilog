/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// The editor creator to use.
// import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

// import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
// import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
// import AutoSave from '@ckeditor/ckeditor5-autosave/src/autosave.js';
// import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
// import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
// import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough.js';
// import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript.js';
// import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript.js';
// import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline.js';
// import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
// import Heading from '@ckeditor/ckeditor5-heading/src/heading';
// import Image from '@ckeditor/ckeditor5-image/src/image';
// import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
// import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
// import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
// import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
// import { ImageResize } from '@ckeditor/ckeditor5-image';
// import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight.js';
// import Indent from '@ckeditor/ckeditor5-indent/src/indent';
// import Link from '@ckeditor/ckeditor5-link/src/link';
// import List from '@ckeditor/ckeditor5-list/src/list';
// import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
// import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
// import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
// import PictureEditing from '@ckeditor/ckeditor5-image/src/pictureediting';
// import Table from '@ckeditor/ckeditor5-table/src/table';
// import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
// import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation';
// import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock.js';
// import CKFinderUploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter.js';
// import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';
// import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
// import Enter from '@ckeditor/ckeditor5-enter/src/enter';
// import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor.js';
// import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor.js';
// import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily.js';
// import FontSize from '@ckeditor/ckeditor5-font/src/fontsize.js';
// import ListStyle from '@ckeditor/ckeditor5-list/src/liststyle.js';
// import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat.js';
// import SelectAll from '@ckeditor/ckeditor5-select-all/src/selectall';
// import SpecialCharacters from '@ckeditor/ckeditor5-special-characters/src/specialcharacters.js';
// import SpecialCharactersArrows from '@ckeditor/ckeditor5-special-characters/src/specialcharactersarrows.js';
// import SpecialCharactersCurrency from '@ckeditor/ckeditor5-special-characters/src/specialcharacterscurrency.js';
// import SpecialCharactersEssentials from '@ckeditor/ckeditor5-special-characters/src/specialcharactersessentials.js';
// import SpecialCharactersLatin from '@ckeditor/ckeditor5-special-characters/src/specialcharacterslatin.js';
// import SpecialCharactersMathematical from '@ckeditor/ckeditor5-special-characters/src/specialcharactersmathematical.js';
// import SpecialCharactersText from '@ckeditor/ckeditor5-special-characters/src/specialcharacterstext.js';
// import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
// import Typing from '@ckeditor/ckeditor5-typing/src/typing';
// import Undo from '@ckeditor/ckeditor5-undo/src/undo';
// import InsertFile from './fileUploadPlugin.js';

// export default class ClassicEditor extends ClassicEditorBase { }

// // Plugins to include in the build.
// ClassicEditor.builtinPlugins = [
// 	Essentials,
// 	Autoformat,
// 	AutoSave,
// 	Bold,
// 	Italic,
// 	BlockQuote,
// 	CKFinderUploadAdapter,
// 	CKFinder,
// 	CodeBlock,
// 	FontBackgroundColor,
// 	FontColor,
// 	FontFamily,
// 	FontSize,
// 	Heading,
// 	Highlight,
// 	Image,
// 	ImageCaption,
// 	ImageStyle,
// 	ImageResize,
// 	ImageToolbar,
// 	ImageUpload,
// 	Indent,
// 	InsertFile,
// 	Link,
// 	List,
// 	MediaEmbed,
// 	Paragraph,
// 	PasteFromOffice,
// 	PictureEditing,
// 	Table,
// 	TableToolbar,
// 	TextTransformation,
// 	Strikethrough,
// 	SpecialCharacters,
// 	SpecialCharactersArrows,
// 	SpecialCharactersCurrency,
// 	SpecialCharactersEssentials,
// 	SpecialCharactersLatin,
// 	SpecialCharactersMathematical,
// 	SpecialCharactersText,
// 	Subscript,
// 	Superscript,
// 	Underline
// ];

import CKFinderUploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter.js';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Autosave from '@ckeditor/ckeditor5-autosave/src/autosave.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code.js';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough.js';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript.js';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript.js';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline.js';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor.js';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor.js';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily.js';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight.js';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize.js';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import ListStyle from '@ckeditor/ckeditor5-list/src/liststyle.js';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat.js';
import SelectAll from '@ckeditor/ckeditor5-select-all/src/selectall';
import SpecialCharacters from '@ckeditor/ckeditor5-special-characters/src/specialcharacters.js';
import SpecialCharactersArrows from '@ckeditor/ckeditor5-special-characters/src/specialcharactersarrows.js';
import SpecialCharactersCurrency from '@ckeditor/ckeditor5-special-characters/src/specialcharacterscurrency.js';
import SpecialCharactersEssentials from '@ckeditor/ckeditor5-special-characters/src/specialcharactersessentials.js';
import SpecialCharactersLatin from '@ckeditor/ckeditor5-special-characters/src/specialcharacterslatin.js';
import SpecialCharactersMathematical from '@ckeditor/ckeditor5-special-characters/src/specialcharactersmathematical.js';
import SpecialCharactersText from '@ckeditor/ckeditor5-special-characters/src/specialcharacterstext.js';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock.js';
import InsertFile from './fileUploadPlugin.js';

export default class ClassicEditor extends ClassicEditorBase { }

// Plugins to include in the build.
ClassicEditor.builtinPlugins = [
	Autoformat,
	Autosave,
	BlockQuote,
	Bold,
	CKFinder,
	InsertFile,
	CKFinderUploadAdapter,
	Code,
	CodeBlock,
	Clipboard,
	Enter,
	SelectAll,
	Typing,
	Undo,
	FontBackgroundColor,
	FontColor,
	FontFamily,
	FontSize,
	Heading,
	Highlight,
	Image,
	ImageCaption,
	ImageResize,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	Italic,
	Link,
	List,
	ListStyle,
	MediaEmbed,
	Paragraph,
	RemoveFormat,
	SpecialCharacters,
	SpecialCharactersArrows,
	SpecialCharactersCurrency,
	SpecialCharactersEssentials,
	SpecialCharactersLatin,
	SpecialCharactersMathematical,
	SpecialCharactersText,
	Strikethrough,
	Subscript,
	Superscript,
	Table,
	TableProperties,
	TableToolbar,
	Underline
];

// Editor configuration.
ClassicEditor.defaultConfig = {
	toolbar: {
		items: [
			'heading',
			'|',
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'|',
			'outdent',
			'indent',
			'|',
			'uploadImage',
			'blockQuote',
			'insertTable',
			'mediaEmbed',
			'undo',
			'redo'
		]
	},
	image: {
		toolbar: [
			'imageStyle:inline',
			'imageStyle:block',
			'imageStyle:side',
			'|',
			'toggleImageCaption',
			'imageTextAlternative'
		]
	},
	table: {
		contentToolbar: [
			'tableColumn',
			'tableRow',
			'mergeTableCells'
		]
	},
	link: {
		decorators: {
			detectDownloadable: {
				mode: 'automatic',
				callback: url => { return ((url.startsWith('file:')) || ((/^(https?:)?\/\/.*\/download/.test(url) && (url.includes(window.location.hostname))))) },
				attributes: {
					class: 'fileLink',
					target: '_blank'
				}
			},
			addTargetToExternalLinks: {
				mode: 'automatic',
				callback: url => /^(https?:)?\/\//.test(url),
				attributes: {
					target: '_blank',
					rel: 'noopener noreferrer'
				}
			}
		}
	},
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'en'
};

