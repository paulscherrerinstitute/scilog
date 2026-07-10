import { PLUGINS } from './editor';

export let CKeditorConfig = {
  plugins: PLUGINS,
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
  image: {
    insert: {
      type: 'auto',
    },
    toolbar: [
      'imageStyle:inline',
      'imageStyle:block',
      'imageStyle:side',
      '|',
      'toggleImageCaption',
      'imageTextAlternative',
    ],
  },
  table: {
    contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
  },
  link: {
    decorators: {
      detectDownloadable: {
        mode: 'automatic',
        callback: (url: string | null) =>
          !!url &&
          (url.startsWith('file:') ||
            (/^(https?:)?\/\/.*\/download/.test(url) && url.includes(window.location.hostname))),
        attributes: {
          class: 'fileLink',
          target: '_blank',
        },
      },
      addTargetToExternalLinks: {
        mode: 'automatic',
        callback: (url: string | null) => !!url && /^(https?:)?\/\//.test(url),
        attributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      },
    },
  },
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
