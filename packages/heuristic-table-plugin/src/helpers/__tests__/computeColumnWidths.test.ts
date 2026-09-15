import computeColumnWidths, {
  ColumnLayoutInput
} from '../computeColumnWidths';
import { DisplayCell, TCellConstraints } from '../../shared-types';

function makeDisplay(
  cells: Array<
    Pick<DisplayCell, 'x' | 'y'> & { constraints: TCellConstraints }
  >,
  { contentWidth, forceStretch }: { contentWidth: number; forceStretch?: boolean }
): ColumnLayoutInput {
  return {
    assignableWidth: contentWidth,
    forceStretch,
    cells: cells.map((cell) => ({
      lenX: 1,
      lenY: 1,
      tnode: null as never,
      ...cell
    }))
  };
}

describe('computeColumnWidths', () => {
  it('should preserve a fixed-width column beside a column with more content', () => {
    // An icon column: a single wide glyph (`width: 40px` plus 11px of padding
    // and borders) whose one character makes for a very low content density.
    // CSS 2.1 §17.5.2.2 raises both the column minimum and maximum by the
    // column `width`, so 51px is a floor the shrink-to-fit pass cannot cross.
    const widths = computeColumnWidths(
      makeDisplay(
        [
          {
            x: 0,
            y: 0,
            constraints: { minWidth: 51, maxWidth: 51, contentDensity: 30.42 }
          },
          {
            x: 1,
            y: 0,
            constraints: {
              minWidth: 141.13,
              maxWidth: 896.35,
              contentDensity: 896.35
            }
          }
        ],
        { contentWidth: 400, forceStretch: false }
      )
    );
    expect(widths[0]).toBe(51);
    expect(widths[1]).toBe(349);
  });

  it('should never deal a column more width than it can use', () => {
    // The surplus is shared over how much room each column has left to grow,
    // so no column is ever dealt more than its maximum in the first place.
    const constraints = [
      {
        x: 0,
        y: 0,
        constraints: { minWidth: 10, maxWidth: 30, contentDensity: 30 }
      },
      {
        x: 1,
        y: 0,
        constraints: { minWidth: 10, maxWidth: 40, contentDensity: 100 }
      },
      {
        x: 2,
        y: 0,
        constraints: { minWidth: 10, maxWidth: 400, contentDensity: 400 }
      }
    ];
    const widths = computeColumnWidths(
      makeDisplay(constraints, { contentWidth: 400, forceStretch: false })
    );
    widths.forEach((width, i) => {
      expect(width).toBeLessThanOrEqual(constraints[i]!.constraints.maxWidth);
      expect(width).toBeGreaterThanOrEqual(
        constraints[i]!.constraints.minWidth
      );
    });
    // The surplus is fully used: the table fills its container.
    expect(widths.reduce((a, b) => a + b, 0)).toBeCloseTo(400);
  });

  it('should shrink to fit when no column can use the whole surplus', () => {
    // Every column reaches its maximum and the table stays narrower than the
    // container, rather than stretching columns past any useful width.
    const widths = computeColumnWidths(
      makeDisplay(
        [
          {
            x: 0,
            y: 0,
            constraints: { minWidth: 10, maxWidth: 30, contentDensity: 30 }
          },
          {
            x: 1,
            y: 0,
            constraints: { minWidth: 10, maxWidth: 40, contentDensity: 100 }
          }
        ],
        { contentWidth: 600, forceStretch: false }
      )
    );
    expect(widths).toEqual([30, 40]);
  });

  it('should stretch columns of equal density to fill the container when forceStretch is set', () => {
    // Two identical columns have no relative preference between them, but
    // `forceStretch` still has to fill the container — historically this case
    // distributed nothing at all and left the table hugging its content.
    const cell = {
      constraints: { minWidth: 20, maxWidth: 20, contentDensity: 20 }
    };
    const widths = computeColumnWidths(
      makeDisplay(
        [
          { x: 0, y: 0, ...cell },
          { x: 1, y: 0, ...cell }
        ],
        { contentWidth: 400, forceStretch: true }
      )
    );
    expect(widths).toEqual([200, 200]);
  });
});
