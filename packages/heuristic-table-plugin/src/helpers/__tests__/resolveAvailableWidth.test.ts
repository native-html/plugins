import resolveAvailableWidth from '../resolveAvailableWidth';
import { createTableTNode } from './utils';

function availableWidthFor(html: string, contentWidth: number, nth = 0) {
  return resolveAvailableWidth(createTableTNode(html, nth), contentWidth);
}

describe('resolveAvailableWidth', () => {
  it('should return contentWidth when no ancestor imposes spacing', () => {
    expect(availableWidthFor('<table><tr><td>A</td></tr></table>', 400)).toBe(
      400
    );
  });

  it('should subtract the padding of an ancestor', () => {
    expect(
      availableWidthFor(
        '<div style="padding: 20px"><table><tr><td>A</td></tr></table></div>',
        400
      )
    ).toBe(360);
  });

  it('should subtract the border and margin of an ancestor', () => {
    expect(
      availableWidthFor(
        `<div style="margin-left: 10px; margin-right: 6px; border: 2px solid black">
          <table><tr><td>A</td></tr></table>
        </div>`,
        400
      )
    ).toBe(400 - 16 - 4);
  });

  it('should accumulate the spacing of every ancestor', () => {
    expect(
      availableWidthFor(
        `<div style="padding: 20px">
          <blockquote style="padding-left: 15px; margin-right: 5px">
            <table><tr><td>A</td></tr></table>
          </blockquote>
        </div>`,
        400
      )
    ).toBe(400 - 40 - 15 - 5);
  });

  it('should treat an explicit ancestor width as a border box', () => {
    // `width` in React Native already contains padding and border, so only the
    // padding may be taken out of it — subtracting the margins too would
    // shrink the table below the box its ancestor actually occupies.
    expect(
      availableWidthFor(
        `<div style="width: 300px; padding: 10px; margin: 25px">
          <table><tr><td>A</td></tr></table>
        </div>`,
        400
      )
    ).toBe(280);
  });

  it('should resolve an ancestor percentage width against its own container', () => {
    expect(
      availableWidthFor(
        `<div style="padding: 10px">
          <div style="width: 50%"><table><tr><td>A</td></tr></table></div>
        </div>`,
        400
      )
    ).toBe(190);
  });

  it('should never report a negative width', () => {
    expect(
      availableWidthFor(
        '<div style="padding: 400px"><table><tr><td>A</td></tr></table></div>',
        300
      )
    ).toBe(0);
  });

  it('should cap an auto-width ancestor at its max-width', () => {
    expect(
      availableWidthFor(
        `<div style="max-width: 300px; padding: 10px">
          <table><tr><td>A</td></tr></table>
        </div>`,
        400
      )
    ).toBe(280);
  });

  it('should leave an ancestor alone when its max-width is not reached', () => {
    expect(
      availableWidthFor(
        '<div style="max-width: 800px"><table><tr><td>A</td></tr></table></div>',
        400
      )
    ).toBe(400);
  });

  it('should not let an ancestor min-width narrow the available width', () => {
    // `min-width` is a floor, not a width: an ancestor asking for *at least*
    // 100px still hands its children the whole 400px it was given. Reading it
    // as a declared width squeezed every descendant table to min-content.
    expect(
      availableWidthFor(
        '<div style="min-width: 100px"><table><tr><td>A</td></tr></table></div>',
        400
      )
    ).toBe(400);
  });

  it('should raise a narrow ancestor up to its min-width', () => {
    expect(
      availableWidthFor(
        `<div style="width: 50px; min-width: 100px">
          <table><tr><td>A</td></tr></table>
        </div>`,
        400
      )
    ).toBe(100);
  });

  // Legacy markup sizes a cell with a `width` attribute rather than CSS. It is
  // the lowest-priority width hint, but it is still a width: ignoring it handed
  // the nested table the whole 400px. Both spellings resolve to the same 200px
  // box here, less the user-agent pixel of cell padding per side.
  it.each([
    ['50%', 'as a fraction of the containing block'],
    ['200', 'as an absolute length']
  ])(
    'should resolve a presentational width attribute %s (%s)',
    (declaration) => {
      expect(
        availableWidthFor(
          `<table><tr><td width="${declaration}"><table><tr><td>A</td></tr></table></td></tr></table>`,
          400,
          1
        )
      ).toBe(198);
    }
  );

  describe('table cell ancestors', () => {
    // The user-agent `td, th { padding: 1px }` never reaches `nativeBlockRet`,
    // so a cell which declares nothing looks bare here while the renderer
    // still spends the padding. Measuring the declared insets handed a nested
    // table 2px more than its cell had left, once per level of nesting.
    const NESTED_TABLE = '<table><tr><td>A</td></tr></table>';

    it('should subtract the default padding of a bare cell', () => {
      expect(
        availableWidthFor(
          `<table><tr><td>${NESTED_TABLE}</td></tr></table>`,
          400,
          1
        )
      ).toBe(398);
    });

    it('should subtract a declared cell padding instead of the default', () => {
      expect(
        availableWidthFor(
          `<table><tr><td style="padding: 10px">${NESTED_TABLE}</td></tr></table>`,
          400,
          1
        )
      ).toBe(380);
    });

    it('should subtract nothing from a cell which zeroes its padding', () => {
      expect(
        availableWidthFor(
          `<table><tr><td style="padding: 0">${NESTED_TABLE}</td></tr></table>`,
          400,
          1
        )
      ).toBe(400);
    });

    it('should keep the default on the sides a cell leaves undeclared', () => {
      expect(
        availableWidthFor(
          `<table><tr><td style="padding-left: 10px">${NESTED_TABLE}</td></tr></table>`,
          400,
          1
        )
      ).toBe(400 - 10 - 1);
    });

    it('should not give the default padding to a non-cell ancestor', () => {
      // The counterpart of the cases above: the user-agent padding belongs to
      // `td`/`th` alone, so a plain wrapper must hand on everything it was
      // given. Widening `isTableCell` would silently shrink every nested block.
      expect(availableWidthFor(`<div>${NESTED_TABLE}</div>`, 400)).toBe(400);
    });
  });
});
