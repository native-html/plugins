import React, { ComponentType } from 'react';
import { RendererDeclaration } from 'react-native-render-html';
import { HTMLTable } from './HTMLTable';
import { TableConfig, HTMLTableBaseProps } from './types';

/**
 * Create the table renderer.
 *
 * @param tableConfig - An object to customize the renderer.
 *
 * @public
 */
export function makeTableRenderer(
  tableConfig: TableConfig
): RendererDeclaration {
  return (attribs, _children, _css, { key, onLinkPress, renderersProps }) => {
    const handleOnLinkPress = (url: string) =>
      onLinkPress && onLinkPress({} as any, url, {});
    if (typeof attribs._rawHtml !== 'string') {
      throw new Error(
        "You must inject `alterNode' method from react-native-render-html-table-bdridge in `HTML' component."
      );
    }
    return (
      <HTMLTable
        key={key}
        {...tableConfig}
        numOfColumns={attribs._numOfColumns as number}
        numOfRows={attribs._numOfRows as number}
        numOfChars={attribs._numOfChars as number}
        html={attribs._rawHtml as string}
        renderersProps={renderersProps}
        onLinkPress={handleOnLinkPress}
      />
    );
  };
}

/**
 *
 * @param TableComponent - A component which will receive {@link HTMLTablePropsWithStats} props.
 *
 * @public
 */
export function makeCustomTableRenderer(
  TableComponent: ComponentType<HTMLTableBaseProps>
): RendererDeclaration {
  return (attribs, _children, _css, { key, onLinkPress, renderersProps }) => {
    const handleOnLinkPress = (url: string) =>
      onLinkPress && onLinkPress({} as any, url, {});
    if (typeof attribs._rawHtml !== 'string') {
      throw new Error(
        "You must inject `alterNode' method from react-native-render-html-table-bdridge in `HTML' component."
      );
    }
    return (
      <TableComponent
        key={key}
        numOfColumns={attribs._numOfColumns as number}
        numOfRows={attribs._numOfRows as number}
        numOfChars={attribs._numOfChars as number}
        html={attribs._rawHtml as string}
        renderersProps={renderersProps}
        onLinkPress={handleOnLinkPress}
      />
    );
  };
}
