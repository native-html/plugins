import { TNode } from '@native-html/render';
import TCellConstraintsComputer, {
  DEFAULT_FONT_WEIGHT_COEFFS,
  FontWeightCoefficients
} from '../TCellConstraintsComputer';
import { TCellConstraints } from '../../shared-types';
import { createTableTNode } from './utils';

function findFirstCell(tnode: TNode): TNode | null {
  if (tnode.tagName === 'td' || tnode.tagName === 'th') {
    return tnode;
  }
  for (const child of tnode.children) {
    const found = findFirstCell(child);
    if (found) {
      return found;
    }
  }
  return null;
}

/**
 * Pinned here so that the break-opportunity assertions below test the segment
 * a string breaks into, and not whatever character-width estimate the computer
 * happens to default to.
 */
const BASE_FONT_COEFF = 0.65;

function constraintsFor(
  cellMarkup: string,
  contentWidth = 400,
  fontWeightCoeffs?: FontWeightCoefficients
): TCellConstraints {
  const table = createTableTNode(`<table><tr>${cellMarkup}</tr></table>`);
  const cell = findFirstCell(table);
  expect(cell).not.toBeNull();
  return new TCellConstraintsComputer({
    contentWidth,
    baseFontCoeff: BASE_FONT_COEFF,
    fontWeightCoeffs
  }).computeCellConstraints(cell as TNode);
}

describe('TCellConstraintsComputer', () => {
  describe('font weight coefficients', () => {
    it('should widen bold text by the default coefficient', () => {
      const { minWidth } = constraintsFor(
        '<td style="font-weight: bold">Method</td>'
      );

      expect(minWidth).toBeCloseTo(
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
      expect(minWidth).toBeCloseTo(6 * 14 * BASE_FONT_COEFF);
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
        6 * 14 * BASE_FONT_COEFF * (DEFAULT_FONT_WEIGHT_COEFFS['300'] as number)
      );
    });
  });

  describe('text break opportunities', () => {
    it('should allow a line break after a hyphen', () => {
      const { minWidth } = constraintsFor('<td>Medium-High</td>');

      // The longest unbreakable segment is "Medium-" (7 characters), not the
      // full 11-character string.
      expect(minWidth).toBeCloseTo(7 * 14 * BASE_FONT_COEFF);
    });

    it('should retain a non-breaking hyphen in one segment', () => {
      const { minWidth } = constraintsFor('<td>Medium&#8209;High</td>');

      expect(minWidth).toBeCloseTo(11 * 14 * BASE_FONT_COEFF);
    });

    it('should not break a hyphen between two digits', () => {
      // UAX #14 LB25 forbids it, and a date column that wraps mid-value is
      // worse than a wide one.
      const { minWidth } = constraintsFor('<td>2026-09-03</td>');

      expect(minWidth).toBeCloseTo(10 * 14 * BASE_FONT_COEFF);
    });

    it('should still break a hyphen with a digit on only one side', () => {
      // "ISO-" is the longest segment; the digits stand alone after the break.
      const { minWidth } = constraintsFor('<td>ISO-2026</td>');

      expect(minWidth).toBeCloseTo(4 * 14 * BASE_FONT_COEFF);
    });

    it('should not break at a non-breaking space', () => {
      // A whole grouped number is one unbreakable run of nine characters.
      const { minWidth } = constraintsFor('<td>10&nbsp;000&nbsp;km</td>');

      expect(minWidth).toBeCloseTo(9 * 14 * BASE_FONT_COEFF);
    });

    it('should break at a regular space', () => {
      const { minWidth } = constraintsFor('<td>10 000 km</td>');

      expect(minWidth).toBeCloseTo(3 * 14 * BASE_FONT_COEFF);
    });
  });

  describe('width resolution', () => {
    it('should resolve a percentage width against the containing block', () => {
      // 50% of a 400px containing block, which a browser resolves against the
      // table — not discarded for want of being a number.
      const { minWidth } = constraintsFor('<td style="width:50%">a</td>');
      expect(minWidth).toBeGreaterThanOrEqual(200);
      expect(minWidth).toBeLessThan(220);
    });

    it('should not resolve a descendant percentage against the table', () => {
      const { minWidth } = constraintsFor(
        '<td><div style="width:100%">a</div></td>'
      );
      expect(minWidth).toBeLessThan(50);
    });

    it('should honour an absolute width', () => {
      const { minWidth } = constraintsFor('<td style="width:200px">a</td>');
      expect(minWidth).toBeGreaterThanOrEqual(200);
      expect(minWidth).toBeLessThan(220);
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
      expect(minWidth).toBeGreaterThanOrEqual(200);
      expect(minWidth).toBeLessThan(220);
    });

    it('should let a CSS width supersede the presentational attribute', () => {
      // The attribute is a hint of the lowest priority.
      const { minWidth } = constraintsFor(
        '<td width="300" style="width:100px">a</td>'
      );
      expect(minWidth).toBeGreaterThanOrEqual(100);
      expect(minWidth).toBeLessThan(120);
    });

    it('should ignore a width it cannot resolve', () => {
      const { minWidth } = constraintsFor('<td style="width:auto">a</td>');
      expect(minWidth).toBeLessThan(50);
    });

    it('should let CSS auto override the presentational width attribute', () => {
      const { minWidth } = constraintsFor(
        '<td width="300" style="width:auto">a</td>'
      );
      expect(minWidth).toBeLessThan(50);
    });
  });

  describe('CSS clamping order', () => {
    it('should raise a width up to min-width', () => {
      const { minWidth } = constraintsFor(
        '<td style="width:50px;min-width:300px">a</td>'
      );
      expect(minWidth).toBeGreaterThanOrEqual(300);
    });

    it('should cut a width down to max-width', () => {
      const { minWidth } = constraintsFor(
        '<td style="width:500px;max-width:100px">a</td>'
      );
      expect(minWidth).toBeGreaterThanOrEqual(100);
      expect(minWidth).toBeLessThan(150);
    });

    it('should let min-width win over a smaller max-width', () => {
      // CSS 2.1 §10.4: the minimum is applied last, so it wins the conflict.
      const { minWidth } = constraintsFor(
        '<td style="min-width:200px;max-width:100px">a</td>'
      );
      expect(minWidth).toBeGreaterThanOrEqual(200);
    });

    it('should apply min-width on its own, without a width', () => {
      const { minWidth } = constraintsFor('<td style="min-width:250px">a</td>');
      expect(minWidth).toBeGreaterThanOrEqual(250);
    });
  });

  describe('maximum cell width', () => {
    it('should cap the maximum width at max-width', () => {
      const { maxWidth } = constraintsFor(
        `<td style="max-width:100px">${'lorem ipsum '.repeat(20)}</td>`
      );
      expect(maxWidth).toBeLessThanOrEqual(100);
    });

    it('should never report a maximum below the minimum', () => {
      // A cap tighter than the longest word must not drive the cell below the
      // width it needs to hold that word.
      const { minWidth, maxWidth } = constraintsFor(
        '<td style="max-width:1px">antidisestablishmentarianism</td>'
      );
      expect(maxWidth).toBeGreaterThanOrEqual(minWidth);
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
