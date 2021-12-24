import {bind, BindingScope, ContextTags} from '@loopback/core';
import {EXPORT_SERVICE} from '../keys';


interface LateXTag {
  header: string;
  footer: string;
  waitUntilRead: boolean;
  position: number;
}


@bind({
  scope: BindingScope.TRANSIENT,
  tags: {[ContextTags.KEY]: EXPORT_SERVICE},
})
export class ExportService {

  currentDataSnippet: any;
  tableColumnsCounter: number = 0;
  _fileCounter: number = 0;
  updateFileCounter: boolean = true;
  texFile: string;
  texPath: string;
  pdfOnly: boolean;
  imagePath: string;
  fs: any;
  jobId: string;
  imagePathLaTeX: string;
  basePath: string;


  constructor() {}

  prepareLateXSourceFile(snippets: any, jobId: string, pdfOnly: boolean, basePath: string): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      this.fs = require('fs')
      this.pdfOnly = pdfOnly;
      this.jobId = jobId;
      this.basePath = basePath;
      this.imagePath = this.pdfOnly ? this.basePath : this.basePath + jobId + "/images/";
      this.imagePathLaTeX = this.pdfOnly ? "../" : "./images/";
      if (!this.pdfOnly) {
        this.fs.mkdirSync(this.imagePath);
      }

      this.texPath = this.basePath + jobId;
      this.texFile = this.basePath + jobId + '/export.tex';
      var fileExport = this.fs.createWriteStream(this.texFile, {
        flags: 'w' // 'a' means appending (old data will be preserved)
      })
      // const html2Latex = require('html-to-latex');


      let src = "";
      fileExport.write(this.prepareHeader() + "\r\n");
      for (let index = 0; index < snippets.length; index++) {
        this.currentDataSnippet = snippets[index];


        // write the quotes first
        if (this.currentDataSnippet?.subsnippets) {
          for (let subIndex = 0; subIndex < snippets[index].subsnippets.length; subIndex++) {
            this.currentDataSnippet = snippets[index].subsnippets[subIndex];
            if ((this.currentDataSnippet?.textcontent) && (this.currentDataSnippet.linkType == "quote")) {
              let latexData: string = this.translate2LaTeX(this.currentDataSnippet.textcontent);

              fileExport.write(latexData + "\r\n");
              console.log("resetting file counter");
              this.fileCounter = 0;
            }
          }
        }
        // write snippet
        this.currentDataSnippet = snippets[index];
        if (this.currentDataSnippet?.textcontent) {
          // console.log(this.currentDataSnippet.textcontent);
          let latexData: string = this.translate2LaTeX(this.currentDataSnippet.textcontent);
          // console.log(this.currentDataSnippet.subsnippets)
          // console.log(latexData);
          fileExport.write(latexData + "\r\n");
          console.log("resetting file counter");
          this.fileCounter = 0;
        }
        // write comments
        if (this.currentDataSnippet?.subsnippets) {
          for (let subIndex = 0; subIndex < snippets[index].subsnippets.length; subIndex++) {
            this.currentDataSnippet = snippets[index].subsnippets[subIndex];
            if ((this.currentDataSnippet?.textcontent) && (this.currentDataSnippet.linkType == "comment")) {
              let latexData: string = this.translate2LaTeX(this.currentDataSnippet.textcontent);

              fileExport.write(latexData + "\r\n");
              // console.log("resetting file counter");
              this.fileCounter = 0;
            }
          }
        }


      }
      fileExport.write(this.writeFooter() + "\r\n");
      fileExport.close();
      resolve(src);
    });
  }

  compilePDF(): Promise<any> {
    const exec = require('child_process').exec;
    return new Promise((resolve, reject) => {
      exec("cd " + this.texPath + "; pdflatex -interaction=nonstopmode ./export.tex", (error: string, stdout: string, stderr: string) => {
        if (error) {
          console.warn(error);
        }

        resolve(stdout ? stdout : stderr);
      });
    });
  }

  createZipFile(): Promise<any> {
    const exec = require('child_process').exec;
    return new Promise((resolve, reject) => {
      exec("cd " + this.basePath + this.jobId + "; zip -r " + this.jobId + ".zip ./images/ ./export.pdf ./export.tex", (error: string, stdout: string, stderr: string) => {
        if (error) {
          console.warn(error);
        }

        resolve(this.texPath + "/" + this.jobId + ".zip");
      });
    });
  }


  private set fileCounter(value: number) {
    if (this.updateFileCounter) {
      this._fileCounter = value;
    }
  }

  private get fileCounter(): number {
    return this._fileCounter;
  }

  private prepareHeader() {
    const header = "\\documentclass[11pt, a4paper, abstraction]{scrartcl}\r\n" +
      "%\\usepackage[T1]{fontenc}\r\n" +
      "\\usepackage[utf8]{inputenc}\r\n" +
      "\\usepackage[british]{babel}\r\n" +
      "\\usepackage{graphicx}\r\n" +
      "\\usepackage{subcaption}\r\n" +
      "\\usepackage{verbatim}\r\n" +
      "\\usepackage{sectsty}\r\n" +
      "\\usepackage{pdfpages}\r\n" +
      "\\usepackage{hyperref}\r\n" +
      "\\usepackage{float}\r\n" +
      "\\usepackage{fancyhdr}\r\n\r\n" +
      "\\usepackage{ulem}\r\n\r\n" +

      "% % Header and footer% %\r\n" +
      "\\pagestyle{fancy}\r\n" +
      "\\fancyhf{}\r\n" +
      "\\fancyhead[LE,RO]{\\leftmark}\r\n" +
      "\\fancyhead[RE,LO]{SCILOG - \\today}\r\n" +
      "\\fancyfoot[LE,RO]{\\thepage}\r\n\r\n" +

      "% % Import math tools % %\r\n" +
      "\\usepackage{amsfonts}\r\n" +
      "\\usepackage{amsmath}\r\n" +
      "\\usepackage{amssymb}\r\n" +
      "\\usepackage{mathrsfs}\r\n" +
      "\\usepackage{bm}\r\n" +
      "\\usepackage{upgreek}\r\n\r\n" +

      "% % define layout % %\r\n" +
      "\\usepackage[a4paper]{geometry}\r\n" +
      "\\newgeometry{inner=2.5cm, outer=2.5cm, bottom=3cm, top=2cm, marginparwidth=1.5cm}\r\n\r\n" +

      "% % font color % %\r\n" +
      "\\usepackage{xcolor}\r\n" +
      "\\definecolor{darkblue}{rgb}{0, 0.2, 0.349}\r\n" +
      "\\definecolor{comment}{HTML}{F7F2C5}\r\n" +
      "\\definecolor{quote}{HTML}{ECECEC}\r\n" +
      "\\usepackage[labelfont={color=darkblue,bf}, format=plain]{caption}\r\n\r\n" +

      "\\chapterfont{\\color{darkblue}}\r\n" +
      "\\sectionfont{\\color{darkblue}}\r\n" +
      "\\subsectionfont{\\color{darkblue}}\r\n\r\n" +

      "\\usepackage{csquotes}\r\n\r\n" +

      "% % define hyphenation for fancy words %%\r\n" +
      "\\hyphenation{pty-cho-gra-phy}\r\n" +
      "\\hyphenation{pty-cho-gra-phic}\r\n\r\n" +

      "% % code snippets %%\r\n" +
      "\\usepackage{listings}\r\n" +
      "\\lstset{\r\n  basicstyle=\\ttfamily,\r\n  columns=fullflexible,\r\n  frame=single,\r\n  breaklines=true,\r\n  postbreak=\\mbox{\\textcolor{red}{$\\hookrightarrow$}\\space},\r\n}\r\n" +

      "%\\newcommand{\\bluefont}{\\color{darkblue}}\r\n" +
      "\\newcommand{\\mh}[1]{\\large\\textbf{\\textcolor{darkblue}{#1}}}\r\n\r\n\r\n" +

      "\\setcounter{secnumdepth}{0} \r\n" +
      "\\setlength\\parindent{0pt} \r\n" +
      "\\begin{document}";
    return header
  }

  private writeFooter() {
    const footer = "\\end{document}";
    return footer
  }

  private translate2LaTeX(inputString: string): string {
    let out: string = '';
    const jsdom = require("jsdom");
    const {JSDOM} = jsdom;
    let dom = new JSDOM('<!DOCTYPE html>' + inputString + "");
    let element = dom.window.document.querySelector("body");
    let treeObject = {};
    if ((this.currentDataSnippet.linkType == "comment") || (this.currentDataSnippet.linkType == "quote")) {
      let tag = this.translateHTMLTags(this.currentDataSnippet.linkType);
      out += tag.header;
      out += this.unpackHTML(element, treeObject);
      out += tag.footer;

    } else {
      out += this.unpackHTML(element, treeObject);
    }

    return out;
  }

  private unpackHTML(element: any, object: any): string {
    var nodeList = element.childNodes;
    var content = ""
    if (nodeList != null) {
      if (nodeList.length) {
        object[element.nodeName] = []; // IMPT: empty [] array for parent node to push non-text recursivable elements (see below)

        for (var i = 0; i < nodeList.length; i++) {
          console.log("nodeName", nodeList[i].className);
          let nodeTag = this.translateHTMLTags(nodeList[i].nodeName, nodeList[i]);
          this.checkTableCounter(nodeList[i].nodeName);
          let tmpContent = "";
          if (nodeList[i].nodeType == 3) { // if child node is **final base-case** text node
            // console.log("nodeValue", nodeList[i].nodeValue);
            tmpContent = nodeList[i].nodeValue.replace(/_/g, "\\_");
            tmpContent = tmpContent.replace(/#/g, "\\#");
            // content += tmpContent;
          } else {
            object[element.nodeName].push({}); // push {} into empty [] array where {} for recursivable elements
            tmpContent = this.unpackHTML(nodeList[i], object[element.nodeName][object[element.nodeName].length - 1]);
          }
          if (nodeTag.waitUntilRead) {
            // recalculate nodeTag before appending the content
            this.updateFileCounter = false;
            nodeTag = this.translateHTMLTags(nodeList[i].nodeName, nodeList[i]);
            this.updateFileCounter = true;
          }
          content += nodeTag.header;
          content += tmpContent;
          content = this.appendContent(content, nodeTag.footer, nodeTag);
        }
      }
    }
    return content;
  }

  private checkTableCounter(tagName: string) {
    switch (tagName) {
      case "TR":
        this.tableColumnsCounter = 0;
        break;
      case "TD":
        this.tableColumnsCounter++;
        break;
    }
  }

  private appendContent(content: string, data: string, nodeTag: LateXTag): string {
    if (nodeTag.position < 0) {
      // console.log("oldContent:", content);
      content = content.slice(0, nodeTag.position);
      // console.log("newContent:", content);
      return content += data;
    } else {
      return content += data;
    }
  }

  private translateHTMLTags(nodeName: string, node: any = null): LateXTag {
    let out: LateXTag = {
      header: "",
      footer: "",
      waitUntilRead: false,
      position: 0
    };

    switch (nodeName) {
      case "H1":
      // H1 headers are mapped to H2 in CKeditor...
      case "H2":
        out.header = "\\section\{";
        out.footer = "\}\r\n";
        break;
      case "H3":
        out.header = "\\subsection\{";
        out.footer = "\}\r\n";
        break;
      case "H4":
        out.header = "\\subsubsection\{";
        out.footer = "\}\r\n";
        break;
      case "P":
        out.header = "";
        out.footer = "\\\\\r\n";
        break;
      case "FIGURE":
        //FIXME: images within tables are currently not supported. They should get a \begin{minipage}{.3\textwidth} instead of \begin{figure}
        if ((this.currentDataSnippet.files[this.fileCounter]?.className) && (this.currentDataSnippet.files[this.fileCounter].className.includes("image"))) {
          out.header = "\\begin{figure}[H]\r\n\\begin{center}\r\n";
          out.footer = "\\end{center}\r\n\\end{figure}\r\n";
        } else {
          out.header = "\\begin{center}\r\n";
          out.footer = "\\end{center}\r\n";
        }

        break;
      case "IMG":
        // FIXME: multiple files per snippet are currently not supported
        // console.log("line 244:", this.currentDataSnippet);
        console.log("fileCounter:", this.fileCounter);
        // console.log(this.currentDataSnippet.files[this.fileCounter].style.width);
        let width: string;
        let currentFile = this.currentDataSnippet.files.find((file: any) => {
          return (file.fileHash == node.title)
        });
        if (typeof currentFile == 'undefined') {
          break
        }
        if (currentFile.style.width) {
          width = (parseFloat(currentFile.style.width) / 100).toFixed(2);
        } else {
          width = "0.6";
        }
        let fileExt: string;
        fileExt = currentFile.fileExtension.split("/")[1];
        // console.log(fileExt);
        let filename = currentFile.fileId + "." + fileExt;
        if ((!this.pdfOnly) && this.updateFileCounter) {
          // copy files into current directory
          this.fs.copyFileSync(this.basePath + filename, this.imagePath + filename);
        }
        out.header = "\\includegraphics[width=" + width + "\\linewidth]{" + this.imagePathLaTeX + filename + "}\r\n"
        if (this.updateFileCounter) {
          this.fileCounter++;
        }
        break;
      case "STRONG":
        out.header = "\\textbf{";
        out.footer = "}";
        break;
      case "I":
        out.header = "\\textit{";
        out.footer = "}";
        break;
      case "OL":
        out.header = "\\begin{enumerate}\r\n";
        out.footer = "\\end{enumerate}\r\n";
        break;
      case "UL":
        out.header = "\\begin{itemize}\r\n";
        out.footer = "\\end{itemize}\r\n";
        break;
      case "LI":
        out.header = "\\item ";
        out.footer = "\r\n";
        break;
      case "TABLE":
        let tableOptions: string = "{|"
        for (let index = 0; index < this.tableColumnsCounter; index++) {
          tableOptions += "c|";
        }
        tableOptions += "}";
        out.header = "\\begin{tabular}" + tableOptions + "\r\n\\hline ";
        out.footer = "\\end{tabular}\r\n";
        out.waitUntilRead = true;
        // console.log(this.tableColumnsCounter);
        break;
      case "TBODY":
        break;
      case "TR":
        out.footer = "\\\\\\hline\r\n";
        out.position = -1;
        break;
      case "TD":
        out.footer = "\&";
        break;
      case "TH":
        break;
      case "#text":
        break;
      case "FIGCAPTION":
        out.header = "\\caption{";
        out.footer = "}\r\n";
        break;
      case "comment":
        out.header = "\\hfill\r\n\\colorbox{comment}{\\begin{minipage}{0.8\\textwidth}";
        out.footer = "\\end{minipage}}\\\\";
        break;
      case "quote":
        out.header = "\\hfill\r\n\\colorbox{quote}{\\begin{minipage}{\\textwidth}";
        out.footer = "\\end{minipage}}\\\\";
        break;
      case "MARK":
        if (node != null) {
          let color = node.className.split("-");
          if (color.length > 0) {
            out.header = "\\colorbox{" + color[1] + "}{"
            out.footer = "}"
          }
        }
        break;
      case "BR":
        out.footer = "\\\\";
        break;
      case "A":
        console.log(node.href);
        out.header = "\\href{" + node.href + "}{";
        out.footer = "}\r\n";
        break;
      case "U":
        out.header = "\\underline{";
        out.footer = "}";
        break;
      case "SUB":
        out.header = "\\textsubscript{";
        out.footer = "}";
        break;
      case "SUP":
        out.header = "\\textsuperscript{";
        out.footer = "}";
        break;
      case "S":
        out.header = "\\sout{";
        out.footer = "}";
        break;
      default:
        console.log("unknown tag:", nodeName);
        out.header = "\\begin{verbatim}\r\n";
        out.footer = "\\end{verbatim}\r\n";

    }
    return out;
  }


}
