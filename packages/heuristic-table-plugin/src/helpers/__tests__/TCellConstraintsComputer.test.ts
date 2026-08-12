import { TNode } from '@native-html/render';
import TCellConstraintsComputer from '../TCellConstraintsComputer';
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

function constraintsFor(cellMarkup: string, contentWidth = 400): TCellConstraints {
  const table = createTableTNode(`<table><tr>${cellMarkup}</tr></table>`);
  const cell = findFirstCell(table);
  expect(cell).not.toBeNull();
  return new TCellConstraintsComputer({ contentWidth }).computeCellConstraints(
    cell as TNode
  );
}

describe('TCellConstraintsComputer', () => {
  describe('width resolution', () => {
    it('should resolve a percentage width against the containing block', () => {
      // 50% of a 400px containing block, which a browser resolves against the
      // table — not discarded for want of being a number.
      const { minWidth } = constraintsFor('<td style="width:50%">a</td>');
      expect(minWidth).toBeGreaterThanOrEqual(200);
      expect(minWidth).toBeLessThan(220);
    });

    it('should honour an absolute width', () => {
      const { minWidth } = constraintsFor('<td style="width:200px">a</td>');
      expect(minWidth).toBeGreaterThanOrEqual(200);
      expect(minWidth).toBeLessThan(220);
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
