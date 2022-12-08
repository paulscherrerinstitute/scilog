import {expect} from '@loopback/testlab';
import {Suite} from 'mocha';
import {ExportService} from '../../services/export-snippets.service';

describe('Utils unit tests', function (this: Suite) {
  const nodeTagVerbatim = {
    header: '\\begin{verbatim}\r\n',
    footer: '\\end{verbatim}\r\n',
    waitUntilRead: false,
    position: 1,
  };

  const genericNodeTag = {
    header: '\\begin{figure}\r\n',
    footer: '\\end{figure}\r\n',
    waitUntilRead: false,
    position: 1,
  };

  const nodeTagHref = {
    header: '\\href{h}\r\n{',
    footer: '}\r\n',
    waitUntilRead: false,
    position: 1,
  };

  const testCases = [
    {
      message: 'Adds content with verbatim',
      nodeTag: nodeTagVerbatim,
      baseContent: '',
      tmpContent: 'a',
      expected: '\\begin{verbatim}\r\na\\end{verbatim}\r\n',
    },
    {
      message: 'Does not add extra verbatim',
      nodeTag: nodeTagVerbatim,
      baseContent: '',
      tmpContent: '\\begin{verbatim}\r\na\\end{verbatim}\r\n',
      expected: '\\begin{verbatim}\r\na\\end{verbatim}\r\n',
    },
    {
      message: 'Appends to verbatim',
      nodeTag: nodeTagVerbatim,
      baseContent: '\\begin{verbatim}\r\na\\end{verbatim}\r\n',
      tmpContent: 'b',
      expected:
        '\\begin{verbatim}\r\na\\end{verbatim}\r\n\\begin{verbatim}\r\nb\\end{verbatim}\r\n',
    },
    {
      message: 'Appends to verbatim without adding extra verbatim',
      nodeTag: nodeTagVerbatim,
      baseContent: '\\begin{verbatim}\r\na\\end{verbatim}\r\n',
      tmpContent: '\\begin{verbatim}\r\nb\\end{verbatim}\r\n',
      expected:
        '\\begin{verbatim}\r\na\\end{verbatim}\r\n\\begin{verbatim}\r\nb\\end{verbatim}\r\n',
    },
    {
      message: 'Non verbatim outer node',
      nodeTag: genericNodeTag,
      baseContent: '',
      tmpContent: '\\begin{verbatim}\r\na\\end{verbatim}\r\n',
      expected:
        '\\begin{figure}\r\n\\begin{verbatim}\r\na\\end{verbatim}\r\n\\end{figure}\r\n',
    },
    {
      message: 'Non verbatim outer and inner node',
      nodeTag: genericNodeTag,
      baseContent: '',
      tmpContent: 'a',
      expected: '\\begin{figure}\r\na\\end{figure}\r\n',
    },
    {
      message: 'Href after non center',
      nodeTag: nodeTagHref,
      baseContent: '',
      tmpContent: 'someNonCenterContent',
      expected: '\\href{h}\r\n{someNonCenterContent}\r\n',
    },
    {
      message: 'Href after tmpContent starting with center',
      nodeTag: nodeTagHref,
      baseContent: '',
      tmpContent: '\\begin{center}\r\nsomeCenterContent\\end{center}\r\n',
      expected:
        '\\begin{center}\r\n\\href{h}\r\n{someCenterContent}\r\n\\end{center}\r\n',
    },
    {
      message: 'Href after tmpContent with center after another tag',
      nodeTag: nodeTagHref,
      baseContent: '',
      tmpContent:
        '\\begin{figure}\r\n\\begin{center}\r\nsomeCenterContent\\end{center}\r\n\\end{figure}\r\n',
      expected:
        '\\begin{figure}\r\n\\begin{center}\r\n\\href{h}\r\n{someCenterContent}\r\n\\end{center}\r\n\\end{figure}\r\n',
    },
    {
      message: 'Generic node after tmpContent with center',
      nodeTag: genericNodeTag,
      baseContent: '',
      tmpContent: '\\begin{center}\r\nsomeCenterContent\\end{center}\r\n',
      expected:
        '\\begin{figure}\r\n\\begin{center}\r\nsomeCenterContent\\end{center}\r\n\\end{figure}\r\n',
    },
  ];

  testCases.forEach(t => {
    it(t.message, () => {
      const content = ExportService.prototype['sumContents'](
        t.nodeTag,
        t.tmpContent,
        t.baseContent,
      );
      expect(content).to.be.eql(t.expected);
    });
  });

  it('Replace special', () => {
    const testWord =
      'a first # and a second _ and a third % and fourth % and a fifth # and a sixth _';
    const replaced = ExportService.prototype['replaceSpecial'](testWord);
    expect(replaced).to.be.eql(
      'a first \\# and a second \\_ and a third \\% and fourth \\% and a fifth \\# and a sixth \\_',
    );
  });
});
