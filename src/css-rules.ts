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
  borderWidthPx: 0.25,
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
    borderWidthPx,
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
    th {
      border-bottom: ${borderWidthPx}px solid ${thBorderColor};
      border-right: ${borderWidthPx}px solid ${thBorderColor};
    }
    th:first-child {
      border-left: ${borderWidthPx}px solid ${thBorderColor};
    }
    tr:last-child th {
      border-bottom: ${borderWidthPx}px solid ${thBorderColor};
    }
    tr:nth-of-type(odd) th {
      background-color: ${thOddBackground};
      color: ${thOddColor};
    }
    tr:nth-of-type(even) th {
      background-color: ${thEvenBackground};
      color: ${thEvenColor};
    }
    td {
      border-bottom: ${borderWidthPx}px solid ${tdBorderColor};
      border-right: ${borderWidthPx}px solid ${tdBorderColor};
    }
    td:first-child {
      border-left: ${borderWidthPx}px solid ${tdBorderColor};
    }
    tr:last-child td {
      border-bottom: ${borderWidthPx}px solid ${tdBorderColor};
    }
    thead {
      background-color: ${thOddBackground};
    }
    tr:nth-of-type(odd) {
      background-color: ${trOddBackground};
      color: ${trOddColor}
    }
    tr:nth-of-type(even) {
      background-color: ${trEvenBackground};
      color: ${trEvenColor};
    }
    `;
}