import { TableStyleSpecs } from './types';

/**
 * Default styles attributes.
 *
 * @remarks
 * Custom attributes will be shallow-merged.
 *
 * @public
 */
export const defaultTableStylesSpecs: TableStyleSpecs = {
  selectableText: false,
  fitContainerWidth: false,
  fitContainerHeight: false,
  cellPaddingEm: 0.25,
  outerBorderColor: '#b5b5b5',
  outerBorderWidthPx: 0,
  rowsBorderWidthPx: 1,
  columnsBorderWidthPx: 0,
  linkColor: '#3498DB',
  fontFamily: 'sans-serif',
  fontSizePx: null,
  thBorderColor: '#3f5c7a',
  tdBorderColor: '#b5b5b5',
  thOddBackground: '#253546',
  thOddColor: '#FFFFFF',
  thEvenBackground: '#253546',
  thEvenColor: '#FFFFFF',
  trOddBackground: '#e2e2e2',
  trOddColor: '#333333',
  trEvenBackground: '#FFFFFF',
  trEvenColor: '#333333'
};

/**
 * Create css rules from a specification object.
 *
 * @param specs - The specifications object.
 *
 * @public
 */
export function cssRulesFromSpecs(
  specs: TableStyleSpecs = defaultTableStylesSpecs
) {
  const {
    cellPaddingEm,
    rowsBorderWidthPx,
    columnsBorderWidthPx,
    outerBorderColor,
    outerBorderWidthPx,
    selectableText,
    fitContainerWidth,
    fitContainerHeight,
    fontSizePx,
    linkColor,
    fontFamily,
    tdBorderColor,
    thBorderColor,
    thOddBackground,
    thOddColor,
    thEvenBackground,
    thEvenColor,
    trOddBackground,
    trOddColor,
    trEvenBackground,
    trEvenColor
  } = specs;
  const selectTextRule = selectableText
    ? ''
    : `
    user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
  `;
  const spanToContainerWidthRule = fitContainerWidth ? 'min-width: 100vw;' : '';
  const spanToContainerHeightRule = fitContainerHeight
    ? 'min-height: 100vh;'
    : '';
  const fontSizeRule = fontSizePx ? `font-size: ${fontSizePx}px;` : '';
  return `
    :root {
      font-family: ${fontFamily};
      background-color: transparent;
      ${fontSizeRule}
    }
    body, html {
      margin: 0;
      background-color: transparent;
      ${selectTextRule}
    }
    a:link, a:visited {
      color: ${linkColor};
    }
    table {
      border: ${outerBorderWidthPx}px solid ${outerBorderColor};
      ${spanToContainerWidthRule}
      ${spanToContainerHeightRule}
      padding: 0;
    }
    th, td {
      padding: ${cellPaddingEm}em;
      text-align: center;
    }
    table, th, td {
      margin: 0;
    }
    thead {
      background-color: ${thOddBackground};
    }
    tr:nth-of-type(odd) th {
      background-color: ${thOddBackground};
      color: ${thOddColor};
    }
    tr:nth-of-type(even) th {
      background-color: ${thEvenBackground};
      color: ${thEvenColor};
    }
    tr:nth-of-type(odd) td {
      background-color: ${trOddBackground};
      color: ${trOddColor}
    }
    tr:nth-of-type(even) td {
      background-color: ${trEvenBackground};
      color: ${trEvenColor};
    }
    th {
      border-bottom: ${rowsBorderWidthPx}px solid ${thBorderColor};
      border-right: ${columnsBorderWidthPx}px solid ${thBorderColor};
    }
    td {
      border-bottom: ${rowsBorderWidthPx}px solid ${tdBorderColor};
      border-right: ${columnsBorderWidthPx}px solid ${tdBorderColor};
    }
    th:last-of-type, td:last-of-type {
      border-right: none;
    }
    td:last-of-type {
      border-right: none;
    }
    tr:last-of-type td {
      border-bottom: none;
    }
    `;
}
