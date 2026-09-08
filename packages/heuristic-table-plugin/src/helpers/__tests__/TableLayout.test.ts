import TableLayout from '../../TableLayout';
import { shouldScrollTable } from '../../HTMLTable';
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

  it('should let CSS auto suppress a col HTML width attribute', () => {
    const { columnWidths } = layoutFor(
      `<table style="width: 300px">
        <colgroup><col width="250" style="width: auto" /><col /></colgroup>
        <tr><td>A</td><td>B</td></tr>
      </table>`,
      { contentWidth: 300, forceStretch: false }
    );
    expect(columnWidths).toEqual([150, 150]);
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
      // The character-width estimate is pinned so the premise of the test — a
      // column whose min-content exceeds its 20% share of 300px — holds
      // whatever the computer defaults to.
      { contentWidth: 300, forceStretch: false, baseFontCoeff: 0.65 }
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

  it('should ignore col declarations beyond the last column of the grid', () => {
    // A span of ten over two cells used to conjure eight columns nothing is
    // rendered into, widening the table to 600px and handing it a scroller.
    const { columnWidths, totalWidth } = layoutFor(
      `<table>
        <colgroup span="10" style="width: 60px" />
        <tr><td>A</td><td>B</td></tr>
      </table>`,
      { contentWidth: 400, forceStretch: false }
    );
    expect(columnWidths).toHaveLength(2);
    expect(totalWidth).toBeLessThanOrEqual(400);
  });

  it('should let a col width override the width of its colgroup', () => {
    // A `col` overrides its group rather than competing with it: taking the
    // greater of the two widened the very column that asked to be narrower.
    const { columnWidths } = layoutFor(
      `<table style="width: 400px">
        <colgroup style="width: 50%">
          <col style="width: 25%" />
          <col style="width: 75%" />
        </colgroup>
        <tr><td>A</td><td>B</td></tr>
      </table>`,
      { contentWidth: 400, forceStretch: false }
    );
    expect(columnWidths[0]).toBeCloseTo(100);
    expect(columnWidths[1]).toBeCloseTo(300);
  });

  it('should let an absolute col width override a percentage colgroup width', () => {
    // The two sizing classes used to be merged independently, so the group
    // percentage survived the absolute width the column declared instead of it.
    const { columnWidths } = layoutFor(
      `<table style="width: 400px">
        <colgroup style="width: 50%"><col style="width: 100px" /></colgroup>
        <tr><td>A</td><td>B</td></tr>
      </table>`,
      { contentWidth: 400, forceStretch: false }
    );
    expect(columnWidths[0]).toBeCloseTo(100);
  });

  it('should let a percentage col width override an absolute colgroup width', () => {
    const { columnWidths } = layoutFor(
      `<table style="width: 400px">
        <colgroup style="width: 300px"><col style="width: 25%" /></colgroup>
        <tr><td>A</td><td>B</td></tr>
      </table>`,
      { contentWidth: 400, forceStretch: false }
    );
    expect(columnWidths[0]).toBeCloseTo(100);
  });

  it('should keep a colgroup width when its col declares only a min-width', () => {
    // A `min-width` is a bound, not a declaration: it used to be stored in the
    // same field as a width and so discarded the width of the group entirely.
    const { columnWidths } = layoutFor(
      `<table style="width: 400px">
        <colgroup style="width: 200px"><col style="min-width: 50px" /></colgroup>
        <tr><td>A</td><td>B</td></tr>
      </table>`,
      { contentWidth: 400, forceStretch: false }
    );
    expect(columnWidths[0]).toBeCloseTo(200);
  });

  it('should cap a column that declares only a max-width', () => {
    // `max-width` on an auto-width column used to be dropped, letting the
    // column take the whole surplus of a stretched table.
    const { columnWidths, totalWidth } = layoutFor(
      `<table>
        <colgroup><col style="max-width: 50px" /><col /></colgroup>
        <tr><td>A</td><td>B</td></tr>
      </table>`,
      { contentWidth: 400, forceStretch: true }
    );
    expect(columnWidths[0]).toBeLessThanOrEqual(50);
    expect(totalWidth).toBeCloseTo(400);
  });

  it('should pass a surplus no auto column can take to its neighbours', () => {
    // Every auto column held at its own `max-width` used to drop the rest of
    // the stretch surplus, leaving the table short of the width it was told to
    // fill even though a neighbour had room to take it.
    const { columnWidths, totalWidth } = layoutFor(
      `<table>
        <colgroup>
          <col style="max-width: 50px" />
          <col style="width: 100px" />
        </colgroup>
        <tr><td>A</td><td>B</td></tr>
      </table>`,
      { contentWidth: 400, forceStretch: true }
    );
    expect(columnWidths[0]).toBeLessThanOrEqual(50);
    expect(totalWidth).toBeCloseTo(400);
  });

  it('should pass a surplus no auto column can take to a percentage column', () => {
    const { columnWidths, totalWidth } = layoutFor(
      `<table>
        <colgroup>
          <col style="max-width: 50px" />
          <col style="width: 50%" />
        </colgroup>
        <tr><td>A</td><td>B</td></tr>
      </table>`,
      { contentWidth: 400, forceStretch: true }
    );
    expect(columnWidths[0]).toBeLessThanOrEqual(50);
    expect(columnWidths[1]).toBeCloseTo(350);
    expect(totalWidth).toBeCloseTo(400);
  });

  it('should stay narrower than its width when every column is capped', () => {
    // Handing the surplus on stops at the last column that has room: none of
    // these may grow, so the table ends up narrower than the width it was
    // given rather than pushing a column past the ceiling it declared.
    const { totalWidth } = layoutFor(
      `<table>
        <colgroup>
          <col style="max-width: 50px" />
          <col style="max-width: 50px" />
        </colgroup>
        <tr><td>A</td><td>B</td></tr>
      </table>`,
      { contentWidth: 400, forceStretch: true }
    );
    expect(totalWidth).toBeCloseTo(100);
  });

  it('should cap a percentage column at its max-width in the min-width pass', () => {
    // The declared widths were resolved against the first guess at the table
    // width and reused verbatim once the `min-width` floor took over, so the
    // max-width cap was rescaled against a width it never applied to.
    const { columnWidths, totalWidth } = layoutFor(
      `<table style="min-width: 300px">
        <colgroup><col style="width: 80%; max-width: 100px" /><col /></colgroup>
        <tr><td>A</td><td>B</td></tr>
      </table>`,
      { contentWidth: 600, forceStretch: false }
    );
    expect(totalWidth).toBeCloseTo(300);
    expect(columnWidths[0]).toBeCloseTo(100);
  });

  it('should cap a percentage column at an absolute max-width', () => {
    const { columnWidths } = layoutFor(
      `<table style="width: 400px">
        <colgroup>
          <col style="width: 80%; max-width: 100px" />
          <col />
        </colgroup>
        <tr><td>A</td><td>B</td></tr>
      </table>`,
      { contentWidth: 400, forceStretch: false }
    );
    expect(columnWidths[0]).toBeCloseTo(100);
  });

  it('should cap an absolute column width at a percentage max-width', () => {
    // A percentage `max-width` was only ever compared with a percentage width,
    // so it was silently dropped on a column sized in pixels — the two sizing
    // classes disagreed on the very same declaration.
    const { columnWidths } = layoutFor(
      `<table style="width: 400px">
        <colgroup><col style="width: 300px; max-width: 25%" /><col /></colgroup>
        <tr><td>A</td><td>B</td></tr>
      </table>`,
      { contentWidth: 400, forceStretch: false }
    );
    expect(columnWidths[0]).toBeCloseTo(100);
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

    it('should stretch a table that only declares a min-width', () => {
      // `min-width` is a floor, not a declared width: reading it as one made
      // the table 200px wide inside a 600px container.
      const { totalWidth } = layoutFor(
        `<table style="min-width: 200px">${rows}</table>`,
        { contentWidth: 600 }
      );
      expect(totalWidth).toBeCloseTo(600);
    });

    it('should not stretch a table past its max-width', () => {
      const { totalWidth } = layoutFor(
        `<table style="max-width: 300px">${rows}</table>`,
        { contentWidth: 600 }
      );
      expect(totalWidth).toBeCloseTo(300);
    });

    it('should keep a shrink-to-fit table at its min-width', () => {
      // Shrinking to fit still may not cross the floor the table asked for.
      const { totalWidth } = layoutFor(
        `<table style="min-width: 300px">${rows}</table>`,
        { contentWidth: 600, forceStretch: false }
      );
      expect(totalWidth).toBeCloseTo(300);
    });

    it('should not narrow a table by raising its min-width', () => {
      // Laying the columns out against the floor resolves the percentage
      // column against a *smaller* width, and the capped auto column cannot
      // take up the slack. A floor may only widen the table.
      const cols = `<colgroup>
        <col style="width: 40%; max-width: 300px" />
        <col style="max-width: 20px" />
      </colgroup>`;
      const body = `${cols}<tr><td>A</td><td>B</td></tr>`;
      const { totalWidth: without } = layoutFor(
        `<table>${body}</table>`,
        { contentWidth: 600, forceStretch: false }
      );
      const { totalWidth: with400 } = layoutFor(
        `<table style="min-width: 400px">${body}</table>`,
        { contentWidth: 600, forceStretch: false }
      );
      expect(with400).toBeGreaterThanOrEqual(without);
    });

    it('should scroll the columns that overflow the table max-width', () => {
      // The cells demand 600px inside a table that paints only 300px, so the
      // surplus belongs to a horizontal scroller rather than spilling out.
      const { totalWidth, assignableWidth } = layoutFor(
        `<table style="max-width: 300px">
          <tr><td style="width: 300px">A</td><td style="width: 300px">B</td></tr>
        </table>`,
        { contentWidth: 600, forceStretch: false }
      );
      expect(assignableWidth).toBe(300);
      expect(totalWidth).toBeGreaterThanOrEqual(600);
      expect(shouldScrollTable(totalWidth, assignableWidth)).toBe(true);
    });

    it('should not paint a table wider than the room its container leaves', () => {
      // The insets were added back after the assignable width had been
      // floored at zero, so a table whose padding alone overflows its
      // container painted a box wider than the room it was given.
      const { usedWidth, assignableWidth } = layoutFor(
        `<div style="width: 30px">
          <table style="padding: 40px"><tr><td>A</td></tr></table>
        </div>`,
        { contentWidth: 400, forceStretch: true }
      );
      expect(assignableWidth).toBe(0);
      expect(usedWidth).toBe(30);
    });

    it('should not paint a table past its own max-width', () => {
      const { usedWidth } = layoutFor(
        '<table style="max-width: 10px; padding: 20px"><tr><td>A</td></tr></table>',
        { contentWidth: 400, forceStretch: true }
      );
      expect(usedWidth).toBe(10);
    });

    it('should shrink a table below its max-width when the content is narrow', () => {
      const { totalWidth } = layoutFor(
        `<table style="max-width: 300px">${rows}</table>`,
        { contentWidth: 600, forceStretch: false }
      );
      expect(totalWidth).toBeLessThan(300);
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
