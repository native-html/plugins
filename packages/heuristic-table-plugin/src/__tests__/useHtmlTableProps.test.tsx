import React from 'react';
import { render } from '@testing-library/react-native';
import RenderHTML, { CustomBlockRenderer } from '@native-html/render';
import renderers from '../index';
import HTMLTable from '../HTMLTable';
import TableLayout from '../TableLayout';
import useHtmlTableProps from '../useHtmlTableProps';

/**
 * Render `html` with a table renderer that passes `overrideContentWidth` for
 * the table of the given `id`, and return every layout by table id.
 *
 * @remarks
 * The option is only reachable through a consumer's own table renderer, so it
 * is exercised the way one would use it rather than by calling the hook bare.
 */
function layoutsFor(
  html: string,
  contentWidth: number,
  override?: { id: string; width: number }
) {
  const layouts = new Map<string, TableLayout>();
  const configs: unknown[] = [];
  const TableRenderer: CustomBlockRenderer = (props) => {
    const id = props.tnode.attributes.id!;
    const tableProps = useHtmlTableProps(
      props,
      override?.id === id ? { overrideContentWidth: override.width } : {}
    );
    layouts.set(id, tableProps.layout);
    configs.push(tableProps.config);
    return <HTMLTable {...tableProps} />;
  };
  render(
    <RenderHTML
      contentWidth={contentWidth}
      source={{ html }}
      renderers={{ ...renderers, table: TableRenderer }}
    />
  );
  return { layouts, configs };
}

const SINGLE = '<table id="only"><tr><td>A</td><td>B</td></tr></table>';
// The inner table sits in a cell, so a `CellContentWidthContext` is in scope
// for it and an override has something to take precedence over.
const NESTED = `<table id="outer"><tr>
  <td><table id="inner"><tr><td>A</td></tr></table></td><td>B</td>
</tr></table>`;

describe('useHtmlTableProps', () => {
  it('yields an empty config when the renderer is given no table props', () => {
    // `renderersProps.table` is optional, and `HTMLTable` reads `config`
    // unconditionally: handing it `undefined` would throw on the first lookup.
    const { configs } = layoutsFor(SINGLE, 400);
    expect(configs).toHaveLength(1);
    expect(configs[0]).toEqual({});
  });

  describe('overrideContentWidth', () => {
    it('lays out against the shared content width when absent', () => {
      const layout = layoutsFor(SINGLE, 400).layouts.get('only')!;
      expect(layout.availableWidth).toBe(400);
      expect(layout.totalWidth).toBeCloseTo(400);
    });

    it('replaces the shared content width when given', () => {
      const layout = layoutsFor(SINGLE, 400, {
        id: 'only',
        width: 250
      }).layouts.get('only')!;
      expect(layout.availableWidth).toBe(250);
      expect(layout.totalWidth).toBeCloseTo(250);
    });

    it('sizes a nested table from its cell when absent', () => {
      const { layouts } = layoutsFor(NESTED, 400);
      const cell = layouts.get('outer')!.cells[0]!;
      expect(layouts.get('inner')!.availableWidth).toBeLessThan(cell.width);
    });

    it('overrides the containing cell of a nested table when given', () => {
      // The option exists so a consumer may size a table against something
      // other than the box it sits in, so the cell content width — which is
      // narrower than the whole table — must not win over it here.
      const { layouts } = layoutsFor(NESTED, 400, { id: 'inner', width: 320 });
      expect(layouts.get('outer')!.cells[0]!.width).toBeLessThan(320);
      // The override replaces the content width the table starts from, not the
      // spacing its ancestors impose: the containing cell still charges the
      // 2px of user-agent padding it spends on each side.
      expect(layouts.get('inner')!.availableWidth).toBe(320 - 4);
      expect(layouts.get('inner')!.totalWidth).toBeCloseTo(316);
    });
  });
});
