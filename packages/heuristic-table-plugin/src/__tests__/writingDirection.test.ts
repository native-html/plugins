import { createTableTNode } from './utils';
import TableLayout from '../TableLayout';
import { getSourceBlockStyle } from '../helpers/cellPadding';

describe('authored writing direction', () => {
  it('is recovered from the flow styles, where the processor files it', () => {
    const table = createTableTNode(
      '<table style="direction:rtl"><tr><td>A</td></tr></table>'
    );
    // `direction` is the sole block-flow property, so it never appears in the
    // retained box styles every other pass reads.
    expect(table.styles.nativeBlockRet).not.toHaveProperty('direction');
    expect(getSourceBlockStyle(table)).toMatchObject({ direction: 'rtl' });
  });

  it('inherits to a cell that declares none of its own', () => {
    const table = createTableTNode(
      '<table style="direction:rtl"><tr><td>A</td></tr></table>'
    );
    const layout = new TableLayout(table, { contentWidth: 400 });
    expect(getSourceBlockStyle(layout.cells[0]!.tnode)).toMatchObject({
      direction: 'rtl'
    });
  });

  it.each([
    ['ltr', { borderLeftWidth: 7, borderRightWidth: 0 }],
    ['rtl', { borderLeftWidth: 0, borderRightWidth: 7 }]
  ] as const)(
    'resolves a configured logical border onto the physical side %s implies',
    (direction, expected) => {
      const layout = new TableLayout(
        createTableTNode(
          `<table style="direction:${direction};border-collapse:collapse">` +
            '<tr><td>A</td></tr></table>'
        ),
        {
          contentWidth: 400,
          // Logical edges only reach a cell through the config callback: the
          // CSS processor drops `border-inline-start` and friends entirely.
          getStyleForCell: () => ({
            borderStartWidth: 7,
            borderStartColor: 'red'
          })
        }
      );
      expect(layout.tableBorderStyle).toMatchObject(expected);
    }
  );
});
