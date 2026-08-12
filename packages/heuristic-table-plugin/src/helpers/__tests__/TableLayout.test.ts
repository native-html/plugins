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
});
