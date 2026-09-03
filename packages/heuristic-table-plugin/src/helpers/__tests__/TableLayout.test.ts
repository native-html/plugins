import TableLayout from '../../TableLayout';
import { Settings } from '../../shared-types';
import { createTableTNode } from './utils';

function layoutFor(html: string, settings: Settings): TableLayout {
  return new TableLayout(createTableTNode(html), settings);
}

describe('TableLayout', () => {
  it('should honour an explicit cell width end to end', () => {
    // The column was previously clamped against a maximum derived from text
    // alone, which ignored the declared width and collapsed this column to the
    // width of the word "Hi".
    const { columnWidths } = layoutFor(
      `<table>
        <tr><td style="width:200px">Hi</td><td>Hi</td></tr>
      </table>`,
      { contentWidth: 400, forceStretch: false }
    );
    expect(columnWidths[0]).toBeGreaterThanOrEqual(200);
  });

  it('should honour percentage widths declared by col elements', () => {
    const { columnWidths } = layoutFor(
      `<table style="width: 400px">
        <colgroup>
          <col style="width: 40%" />
          <col style="width: 20%" />
          <col style="width: 25%" />
          <col style="width: 15%" />
        </colgroup>
        <tr><td>A</td><td>B</td><td>C</td><td>D</td></tr>
      </table>`,
      { contentWidth: 600, forceStretch: false }
    );
    expect(columnWidths[0]).toBeCloseTo(160);
    expect(columnWidths[1]).toBeCloseTo(80);
    expect(columnWidths[2]).toBeCloseTo(100);
    expect(columnWidths[3]).toBeCloseTo(60);
  });

  it('should resolve column percentages against the declared table width', () => {
    const { columnWidths, totalWidth } = layoutFor(
      `<table style="width: 50%">
        <colgroup><col style="width: 50%" /><col style="width: 50%" /></colgroup>
        <tr><td>A</td><td>B</td></tr>
      </table>`,
      { contentWidth: 600, forceStretch: false }
    );
    expect(columnWidths).toEqual([150, 150]);
    expect(totalWidth).toBe(300);
  });

  it('should expand col and colgroup span declarations', () => {
    const { columnWidths } = layoutFor(
      `<table style="width: 400px">
        <colgroup style="width: 25%">
          <col span="2" />
          <col style="width: 50%" />
        </colgroup>
        <tr><td>A</td><td>B</td><td>C</td></tr>
      </table>`,
      { contentWidth: 400, forceStretch: false }
    );
    expect(columnWidths).toEqual([100, 100, 200]);
  });

  it('should expand a colgroup span when it has no col children', () => {
    const { columnWidths } = layoutFor(
      `<table style="width: 300px">
        <colgroup span="3" style="width: 100px" />
        <tr><td>A</td><td>B</td><td>C</td></tr>
      </table>`,
      { contentWidth: 400, forceStretch: false }
    );
    expect(columnWidths).toEqual([100, 100, 100]);
  });

  it('should prefer a CSS col width over its HTML width attribute', () => {
    const { columnWidths } = layoutFor(
      `<table style="width: 300px">
        <colgroup><col width="50" style="width: 100px" /><col /></colgroup>
        <tr><td>A</td><td>B</td></tr>
      </table>`,
      { contentWidth: 300, forceStretch: false }
    );
    expect(columnWidths[0]).toBe(100);
  });

  it('should let cell content make a declared column wider', () => {
    const { columnWidths } = layoutFor(
      `<table>
        <colgroup><col style="width: 20px" /><col /></colgroup>
        <tr><td>averyveryverylongword</td><td>B</td></tr>
      </table>`,
      { contentWidth: 400, forceStretch: false }
    );
    expect(columnWidths[0]).toBeGreaterThan(20);
  });

  it('should reconcile percent columns with min-content inside the table width', () => {
    const { columnWidths, totalWidth } = layoutFor(
      `<table style="width: 300px">
        <colgroup><col style="width: 80%" /><col style="width: 20%" /></colgroup>
        <tr><td>A</td><td>longword</td></tr>
      </table>`,
      { contentWidth: 300, forceStretch: false }
    );
    expect(columnWidths[1]).toBeGreaterThan(60);
    expect(totalWidth).toBeCloseTo(300);
  });

  it('should cap accumulated intrinsic column percentages at 100%', () => {
    const { columnWidths, totalWidth } = layoutFor(
      `<table style="width: 300px">
        <colgroup>
          <col style="width: 60%" />
          <col style="width: 60%" />
        </colgroup>
        <tr><td>A</td><td>B</td></tr>
      </table>`,
      { contentWidth: 300, forceStretch: false }
    );
    expect(columnWidths[0]).toBeCloseTo(180);
    expect(columnWidths[1]).toBeCloseTo(120);
    expect(totalWidth).toBeCloseTo(300);
  });

  it('should keep a column holding only an image', () => {
    // An image contributes no text, so a text-derived maximum of zero used to
    // clamp this column away entirely.
    const { columnWidths } = layoutFor(
      `<table>
        <tr><td><img src="a.png" style="width:120px" /></td><td>Hi</td></tr>
      </table>`,
      { contentWidth: 400, forceStretch: false }
    );
    expect(columnWidths[0]).toBeGreaterThanOrEqual(120);
  });

  it('should fill the container when forceStretch is set and columns match', () => {
    const { totalWidth } = layoutFor(
      `<table>
        <tr><td>AA</td><td>BB</td></tr>
      </table>`,
      { contentWidth: 400, forceStretch: true }
    );
    expect(totalWidth).toBeCloseTo(400);
  });

  it('should give every column a share of the surplus', () => {
    // The narrowest column used to be pinned at its minimum, because the
    // weights were taken relative to the least dense column.
    const { columnWidths } = layoutFor(
      `<table>
        <tr>
          <td>1</td>
          <td>a somewhat longer cell of text</td>
          <td>an even longer cell of text than the one before it</td>
        </tr>
      </table>`,
      { contentWidth: 600, forceStretch: false }
    );
    const [first, second, third] = columnWidths as [number, number, number];
    expect(first).toBeGreaterThan(0);
    expect(second).toBeGreaterThan(first);
    expect(third).toBeGreaterThan(second);
  });

  it('should never exceed the container width when it fits', () => {
    const { totalWidth } = layoutFor(
      `<table>
        <tr><td>alpha</td><td>beta</td><td>gamma</td></tr>
        <tr><td>delta</td><td>epsilon</td><td>zeta</td></tr>
      </table>`,
      { contentWidth: 500, forceStretch: false }
    );
    expect(totalWidth).toBeLessThanOrEqual(500);
  });

  it('should place a cell after a rowspan+colspan rectangle end to end', () => {
    const { display } = layoutFor(
      `<table>
        <tr><td colspan="2" rowspan="2">A</td><td>B</td></tr>
        <tr><td>C</td></tr>
      </table>`,
      { contentWidth: 400, forceStretch: false }
    );
    expect(display.cells).toMatchObject([
      { x: 0, y: 0, lenX: 2, lenY: 2 },
      { x: 2, y: 0 },
      { x: 2, y: 1 }
    ]);
  });

  describe('containing block', () => {
    const rows = '<tr><td>alpha</td><td>beta</td></tr>';

    it('should lay out against the width left by a padded ancestor', () => {
      const { assignableWidth, availableWidth, totalWidth } = layoutFor(
        `<div style="padding: 30px"><table>${rows}</table></div>`,
        { contentWidth: 400, forceStretch: true }
      );
      expect(availableWidth).toBe(340);
      expect(assignableWidth).toBe(340);
      expect(totalWidth).toBeCloseTo(340);
    });

    it('should resolve a percentage table width against the padded ancestor', () => {
      const { totalWidth } = layoutFor(
        `<div style="padding: 20px"><table style="width: 50%">${rows}</table></div>`,
        { contentWidth: 400, forceStretch: false }
      );
      expect(totalWidth).toBeCloseTo(180);
    });

    it('should keep the columns inside the table own padding and border', () => {
      // `width` is a border box in React Native, so padding and border eat into
      // the space the columns may use rather than adding to the table width.
      const { assignableWidth, availableWidth, totalWidth } = layoutFor(
        `<table style="padding: 10px; border: 1px solid black">${rows}</table>`,
        { contentWidth: 400, forceStretch: true }
      );
      expect(availableWidth).toBe(400);
      expect(assignableWidth).toBe(378);
      expect(totalWidth).toBeCloseTo(378);
    });

    it('should take the table own margins out of the width it may occupy', () => {
      const { assignableWidth, availableWidth } = layoutFor(
        `<table style="margin: 25px">${rows}</table>`,
        { contentWidth: 400, forceStretch: true }
      );
      expect(availableWidth).toBe(350);
      expect(assignableWidth).toBe(350);
    });

    it('should stretch to the available width by default', () => {
      const { totalWidth } = layoutFor(`<table>${rows}</table>`, {
        contentWidth: 400
      });
      expect(totalWidth).toBeCloseTo(400);
    });

    it('should shrink to fit when forceStretch is disabled', () => {
      const { totalWidth } = layoutFor(`<table>${rows}</table>`, {
        contentWidth: 400,
        forceStretch: false
      });
      expect(totalWidth).toBeLessThan(400);
    });

    it('should still overflow when the minimum widths do not fit', () => {
      const { totalWidth, assignableWidth } = layoutFor(
        `<div style="padding: 50px">
          <table><tr><td style="width: 300px">A</td><td style="width: 300px">B</td></tr></table>
        </div>`,
        { contentWidth: 400, forceStretch: true }
      );
      expect(assignableWidth).toBe(300);
      expect(totalWidth).toBeGreaterThanOrEqual(600);
    });
  });
});
