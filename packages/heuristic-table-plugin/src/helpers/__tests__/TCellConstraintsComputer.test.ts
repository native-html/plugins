import TCellConstraintsComputer, {
  DEFAULT_FONT_WEIGHT_COEFFS,
  FontWeightCoefficients
} from '../TCellConstraintsComputer';
import { TCellConstraints } from '../../shared-types';
import { DEFAULT_CELL_PADDING } from '../tableStyles';
import { createCellTNode } from '../../__tests__/utils';

/**
 * Pinned here so that the break-opportunity assertions below test the segment
 * a string breaks into, and not whatever character-width estimate the computer
 * happens to default to.
 */
const BASE_FONT_COEFF = 0.65;

/**
 * The horizontal room a cell which declares no padding of its own still owes
 * to the user-agent stylesheet, and which every intrinsic width below
 * therefore carries on top of its text.
 */
const DEFAULT_HORIZONTAL_PADDING = 2 * DEFAULT_CELL_PADDING;

function constraintsFor(
  cellMarkup: string,
  contentWidth = 400,
  fontWeightCoeffs?: FontWeightCoefficients
): TCellConstraints {
  return new TCellConstraintsComputer({
    contentWidth,
    baseFontCoeff: BASE_FONT_COEFF,
    fontWeightCoeffs
  }).computeCellConstraints(
    createCellTNode(`<table><tr>${cellMarkup}</tr></table>`)
  );
}

describe('TCellConstraintsComputer', () => {
  describe('font weight coefficients', () => {
    it('should widen bold text by the default coefficient', () => {
      const { minWidth } = constraintsFor(
        '<td style="font-weight: bold">Method</td>'
      );

      expect(minWidth).toBeCloseTo(
        DEFAULT_HORIZONTAL_PADDING +
          6 * 14 * BASE_FONT_COEFF * (DEFAULT_FONT_WEIGHT_COEFFS.bold as number)
      );
    });

    it('should apply a coefficient supplied by the config', () => {
      const { minWidth } = constraintsFor(
        '<td style="font-weight: bold">Method</td>',
        400,
        { bold: 1 }
      );

      // A cell of bold text now measures exactly as one of regular text.
      expect(minWidth).toBeCloseTo(
        DEFAULT_HORIZONTAL_PADDING + 6 * 14 * BASE_FONT_COEFF
      );
    });

    it('should keep the defaults a partial config leaves untouched', () => {
      // Only `bold` is retuned, so a `font-weight: 300` cell must still use
      // the default 0.9 rather than falling back to 1.
      const { minWidth } = constraintsFor(
        '<td style="font-weight: 300">Method</td>',
        400,
        { bold: 1 }
      );

      expect(minWidth).toBeCloseTo(
        DEFAULT_HORIZONTAL_PADDING +
          6 *
            14 *
            BASE_FONT_COEFF *
            (DEFAULT_FONT_WEIGHT_COEFFS['300'] as number)
      );
    });
  });

  describe('text break opportunities', () => {
    it('should allow a line break after a hyphen', () => {
      const { minWidth } = constraintsFor('<td>Medium-High</td>');

      // The longest unbreakable segment is "Medium-" (7 characters), not the
      // full 11-character string.
      expect(minWidth).toBeCloseTo(
        DEFAULT_HORIZONTAL_PADDING + 7 * 14 * BASE_FONT_COEFF
      );
    });

    it('should retain a non-breaking hyphen in one segment', () => {
      const { minWidth } = constraintsFor('<td>Medium&#8209;High</td>');

      expect(minWidth).toBeCloseTo(
        DEFAULT_HORIZONTAL_PADDING + 11 * 14 * BASE_FONT_COEFF
      );
    });

    it('should not break a hyphen between two digits', () => {
      // UAX #14 LB25 forbids it, and a date column that wraps mid-value is
      // worse than a wide one.
      const { minWidth } = constraintsFor('<td>2026-09-03</td>');

      expect(minWidth).toBeCloseTo(
        DEFAULT_HORIZONTAL_PADDING + 10 * 14 * BASE_FONT_COEFF
      );
    });

    it('should use the plugin heuristic to break ISO-2026 into two segments', () => {
      // This heuristic differs from default UAX #14 LB25 (HY × NU).
      // Both "ISO-" and "2026" have four characters.
      const { minWidth } = constraintsFor('<td>ISO-2026</td>');

      expect(minWidth).toBeCloseTo(
        DEFAULT_HORIZONTAL_PADDING + 4 * 14 * BASE_FONT_COEFF
      );
    });

    it('should not break at a non-breaking space', () => {
      // A whole grouped number is one unbreakable run of nine characters.
      const { minWidth } = constraintsFor('<td>10&nbsp;000&nbsp;km</td>');

      expect(minWidth).toBeCloseTo(
        DEFAULT_HORIZONTAL_PADDING + 9 * 14 * BASE_FONT_COEFF
      );
    });

    it('should break at a regular space', () => {
      const { minWidth } = constraintsFor('<td>10 000 km</td>');

      expect(minWidth).toBeCloseTo(
        DEFAULT_HORIZONTAL_PADDING + 3 * 14 * BASE_FONT_COEFF
      );
    });
  });

  describe('words spanning inline nodes', () => {
    it.each([
      'fnej<span style="color: green">feaf</span>',
      '<span>fn<span style="color: green">ej</span></span><span>feaf</span>'
    ])('should measure %s as one eight-character word', (markup) => {
      const actual = constraintsFor(`<td>${markup}</td>`);
      const expected = constraintsFor('<td>fnejfeaf</td>');
      expect(actual.minWidth).toBeCloseTo(expected.minWidth);
      expect(actual.maxWidth).toBeCloseTo(expected.maxWidth);
    });

    it('should sum the widths of differently styled word fragments', () => {
      const { minWidth, maxWidth } = constraintsFor(
        '<td>fnej<span style="font-size:20px;font-weight:bold">feaf</span></td>'
      );
      const width =
        DEFAULT_HORIZONTAL_PADDING +
        4 * BASE_FONT_COEFF * (14 + 20 * DEFAULT_FONT_WEIGHT_COEFFS.bold!);
      expect(minWidth).toBeCloseTo(width);
      expect(maxWidth).toBeCloseTo(width);
    });

    it.each([
      ['fnej<span> feaf</span>', 'fnej feaf'],
      ['fnej <span>feaf</span>', 'fnej feaf'],
      ['10<span>&nbsp;000</span>&nbsp;km', '10&nbsp;000&nbsp;km'],
      ['2026<span>-</span>09-03', '2026-09-03'],
      ['Medium<span>-</span>High', 'Medium-High']
    ])('should preserve break opportunities in %s', (markup, plain) => {
      const actual = constraintsFor(`<td>${markup}</td>`);
      const expected = constraintsFor(`<td>${plain}</td>`);
      expect(actual.minWidth).toBeCloseTo(expected.minWidth);
      expect(actual.maxWidth).toBeCloseTo(expected.maxWidth);
    });

    it.each([
      'fnej<br>feaf',
      'fnej<div>feaf</div>abcd',
      '<div>fnej</div><div>feaf</div>'
    ])('should keep separate lines from joining in %s', (markup) => {
      expect(constraintsFor(`<td>${markup}</td>`).minWidth).toBeCloseTo(
        DEFAULT_HORIZONTAL_PADDING + 4 * 14 * BASE_FONT_COEFF
      );
    });

    it('should keep max-width from clipping a word spanning nodes', () => {
      const { minWidth, maxWidth } = constraintsFor(
        '<td style="max-width:1px">fnej<span>feaf</span></td>'
      );
      expect(minWidth).toBeCloseTo(
        DEFAULT_HORIZONTAL_PADDING + 8 * 14 * BASE_FONT_COEFF
      );
      expect(maxWidth).toBe(minWidth);
    });
  });

  describe('default cell padding', () => {
    it('should reserve the padding a bare cell gets from the user agent', () => {
      const bare = constraintsFor('<td>Method</td>');
      const unpadded = constraintsFor('<td style="padding:0">Method</td>');

      expect(bare.minWidth - unpadded.minWidth).toBeCloseTo(
        DEFAULT_HORIZONTAL_PADDING
      );
      expect(bare.maxWidth - unpadded.maxWidth).toBeCloseTo(
        DEFAULT_HORIZONTAL_PADDING
      );
    });

    it('should let a declared padding replace the default, not join it', () => {
      // 8px on each side, so 16px of spacing — never 18px.
      const declared = constraintsFor('<td style="padding:8px">Method</td>');
      const unpadded = constraintsFor('<td style="padding:0">Method</td>');

      expect(declared.minWidth - unpadded.minWidth).toBeCloseTo(16);
    });

    it('should ignore a margin the cell renderer zeroes', () => {
      // `useHtmlTableCellProps` unconditionally zeroes all four margins, so
      // width reserved for one here only widens the column by a gap nothing
      // ever paints.
      const withMargin = constraintsFor(
        '<td style="margin-left:40px;margin-right:20px">Method</td>'
      );
      const bare = constraintsFor('<td>Method</td>');
      expect(withMargin.minWidth).toBe(bare.minWidth);
      expect(withMargin.maxWidth).toBe(bare.maxWidth);
    });

    it('should reserve the default beside a padding declared on one side', () => {
      const oneSided = constraintsFor(
        '<td style="padding-left:8px">Method</td>'
      );
      const unpadded = constraintsFor('<td style="padding:0">Method</td>');

      // The right side keeps the user-agent pixel it was never given a
      // declaration for.
      expect(oneSided.minWidth - unpadded.minWidth).toBeCloseTo(
        8 + DEFAULT_CELL_PADDING
      );
    });
  });

  describe('width resolution', () => {
    it('should keep a percentage width as a preference, not an intrinsic floor', () => {
      const { minWidth, percentWidth } = constraintsFor(
        '<td style="width:50%">a</td>'
      );
      expect(percentWidth).toBe(0.5);
      expect(minWidth).toBeCloseTo(
        DEFAULT_HORIZONTAL_PADDING + 14 * BASE_FONT_COEFF
      );
    });

    it('should not resolve a descendant percentage against the table', () => {
      const { minWidth } = constraintsFor(
        '<td><div style="width:100%">a</div></td>'
      );
      expect(minWidth).toBeCloseTo(
        DEFAULT_HORIZONTAL_PADDING + 14 * BASE_FONT_COEFF
      );
    });

    it('should treat a declared cell width as a border-box one', () => {
      // React Native lays out with `box-sizing: border-box`, and so does CSS
      // for a table cell: the padding sits inside the 200px, it does not
      // widen the column to 216px.
      const { minWidth, maxWidth } = constraintsFor(
        '<td style="width:200px;padding:8px">a</td>'
      );
      expect(minWidth).toBe(200);
      expect(maxWidth).toBe(200);
    });

    it('should still add cell spacing to a descendant width', () => {
      // A block inside the cell is content-box against it, so the cell has to
      // grow by its own padding to hold the 200px the block asked for.
      const { minWidth } = constraintsFor(
        '<td style="padding:8px"><div style="width:200px"></div></td>'
      );
      expect(minWidth).toBe(216);
    });

    it('should read the presentational width attribute', () => {
      const { minWidth } = constraintsFor('<td width="200">a</td>');
      expect(minWidth).toBe(200);
    });

    it('should let a CSS width supersede the presentational attribute', () => {
      // The attribute is a hint of the lowest priority.
      const { minWidth } = constraintsFor(
        '<td width="300" style="width:100px">a</td>'
      );
      expect(minWidth).toBe(100);
    });

    it('should let CSS auto override the presentational width attribute', () => {
      const { minWidth } = constraintsFor(
        '<td width="300" style="width:auto">a</td>'
      );
      expect(minWidth).toBeCloseTo(
        DEFAULT_HORIZONTAL_PADDING + 14 * BASE_FONT_COEFF
      );
    });
  });

  describe('CSS clamping order', () => {
    it('should raise a width up to min-width', () => {
      const { minWidth } = constraintsFor(
        '<td style="width:50px;min-width:300px">a</td>'
      );
      expect(minWidth).toBe(300);
    });

    it('should cut a width down to max-width', () => {
      const { minWidth } = constraintsFor(
        '<td style="width:500px;max-width:100px">a</td>'
      );
      expect(minWidth).toBe(100);
    });

    it('should let min-width win over a smaller max-width', () => {
      // CSS 2.1 §10.4: the minimum is applied last, so it wins the conflict.
      const { minWidth } = constraintsFor(
        '<td style="min-width:200px;max-width:100px">a</td>'
      );
      expect(minWidth).toBe(200);
    });

    it('should apply min-width on its own, without a width', () => {
      const { minWidth } = constraintsFor('<td style="min-width:250px">a</td>');
      expect(minWidth).toBe(250);
    });
  });

  describe('maximum cell width', () => {
    it.each([
      'AA<br>BBBB BBBB',
      'BBBB BBBB<br>AA',
      '<div>AA</div><div>BBBB BBBB</div>',
      '<div>BBBB BBBB</div><div>AA</div>',
      'AA<div>BBBB BBBB</div>',
      'BBBB BBBB<div>AA</div>'
    ])(
      'should use the widest forced line in %s without losing text density',
      (markup) => {
        const actual = constraintsFor(`<td>${markup}</td>`);
        // The wider line contains a space: its width exceeds the longest-word
        // minimum, which would otherwise mask a broken maximum calculation.
        expect(actual.maxWidth).toBeCloseTo(
          DEFAULT_HORIZONTAL_PADDING + 9 * 14 * BASE_FONT_COEFF
        );
        expect(actual.contentDensity).toBeCloseTo(11 * 14 * BASE_FONT_COEFF);
      }
    );

    it.each([
      'AB<span style="font-size:20px"> CD</span><br>E',
      'E<br>AB<span style="font-size:20px"> CD</span>'
    ])('should sum styled fragments in the widest line of %s', (markup) => {
      const actual = constraintsFor(`<td>${markup}</td>`);
      expect(actual.maxWidth).toBeCloseTo(
        DEFAULT_HORIZONTAL_PADDING + BASE_FONT_COEFF * (2 * 14 + 3 * 20)
      );
    });

    it('should cap the maximum width at max-width', () => {
      const { maxWidth } = constraintsFor(
        `<td style="max-width:100px">${'lorem ipsum '.repeat(20)}</td>`
      );
      expect(maxWidth).toBe(100);
    });

    it('should preserve the full unbreakable word when max-width is smaller', () => {
      // A cap tighter than the longest word must not drive the cell below the
      // width it needs to hold that word.
      const { minWidth, maxWidth } = constraintsFor(
        '<td style="max-width:1px">antidisestablishmentarianism</td>'
      );
      expect(minWidth).toBeCloseTo(
        DEFAULT_HORIZONTAL_PADDING +
          'antidisestablishmentarianism'.length * 14 * BASE_FONT_COEFF
      );
      expect(maxWidth).toBe(minWidth);
    });

    it('should keep an explicitly sized block from collapsing the cell', () => {
      // A cell holding only an image has no text, so its maximum has to come
      // from the block width or the column would vanish.
      const { maxWidth } = constraintsFor(
        '<td><img src="a.png" style="width:120px" /></td>'
      );
      expect(maxWidth).toBeGreaterThanOrEqual(120);
    });
  });
});
