import resolveAvailableWidth from '../resolveAvailableWidth';
import { createTableTNode } from './utils';

function availableWidthFor(html: string, contentWidth: number) {
  return resolveAvailableWidth(createTableTNode(html), contentWidth);
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
});
