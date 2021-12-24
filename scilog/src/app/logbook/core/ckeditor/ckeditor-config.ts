// export let CKeditorConfig = {
//     fontFamily: {
//       options: [
//         'default',
//         'Ubuntu, Arial, sans-serif',
//         'Ubuntu Mono, Courier New, Courier, monospace'
//       ]
//     },
//     toolbar: {
//       items: [
//         "heading",
//         "undo",
//         "redo",
//         "bold",
//         "italic",
//         // "indent",
//         // "outdent",
//         // "fontColor",
//         "highlight",
//         '|',
//         "subscript",
//         "superscript",
//         '|',
//         "insertTable",
//         "numberedList",
//         "bulletedList",
//         '|',
//         "imageUpload",
//         "link",
//         // '|',
//         // "MathType",
//         // "ChemType",
//         "|",
//         "tableColumn",
//         "tableRow",
//         // "mergeTableCells",
//       ],
//       shouldNotGroupWhenFull: true,
//     },
//     autosave: {
//       save: ( editor ) => {
//           return this.editorChange( editor );
//       }
//   },
//     placeholder: 'Add your content here.'
//     // extraPlugins: [ CK5ImageUploadAdapterPlugin ]
//   };

  export let CKeditorConfig = {
    fontFamily: {
      options: [
        'default',
        'Ubuntu, Arial, sans-serif',
        'Ubuntu Mono, Courier New, Courier, monospace'
      ]
    },
    // removePlugins: ["MathType", "ShiftEnter"],
    toolbar: [
      "heading",
      "undo",
      "redo",
      "bold",
      "italic",
      // "indent",
      // "outdent",
      // "fontColor",'/',
      "highlight",
      '|',
      "subscript",
      "superscript",
      "strikethrough",
      "underline",
      '|',
      "insertTable",
      "numberedList",
      "bulletedList",
      '|',
      "imageUpload",
      "insertFile",
      "link",
      // '|',
      // "MathType",
      // "ChemType",
      "|",
      "tableColumn",
      "tableRow",
      // "mergeTableCells",
    ],
    // shouldNotGroupWhenFull: true,
    placeholder: 'Add your content here.',
    // toolbarLocation: 'bottom',
    // extraPlugins: [ fontFamily ]
  };