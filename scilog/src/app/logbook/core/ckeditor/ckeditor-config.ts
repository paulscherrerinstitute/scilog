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
    "indent",
    "outdent",
    // "fontColor",
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
    "CodeBlock",
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
  codeBlock: {
    languages: [
      { language: 'python', label: 'Python' },
      { language: 'matlab', label: 'MATLAB' },
      { language: 'bash', label: 'Bash' },
      { language: 'julia', label: 'Julia' },
      { language: 'cpp', label: 'C++' },
      { language: 'css', label: 'CSS' },
      { language: 'html', label: 'HTML' },
      { language: 'js', label: 'Javascript' },
      { language: 'typescript', label: 'Typescript' },
      { language: 'c', label: 'C' },
      { language: 'markup', label: 'Markup' },
      { language: 'docker', label: 'Docker' },
      { language: 'json', label: 'JSON' },
      { language: 'yaml', label: 'Yaml' },
    ]
  },
};
