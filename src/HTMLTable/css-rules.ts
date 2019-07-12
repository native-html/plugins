export interface TableStyleSpecs {
  selectableText: boolean
  fitContainer: boolean
  cellPaddingEm: number
  borderWidthPx: number
  linkColor: string
  fontFamily: string
  tdBorderColor: string
  thBorderColor: string
  thOddBackground: string
  thOddColor: string
  thEvenBackground: string
  thEvenColor: string
  trOddBackground: string
  trOddColor: string
  trEvenBackground: string
  trEvenColor: string
}

export const defaultTableStylesSpecs: TableStyleSpecs = {
  selectableText: false,
  fitContainer: false,
  cellPaddingEm: 0.25,
  borderWidthPx: 0.25,
  linkColor: '#3498DB',
  fontFamily: 'sans-serif',
  thBorderColor : '#3f5c7a',
  tdBorderColor : '#b5b5b5',
  thOddBackground : '#253546',
  thOddColor : '#FFFFFF',
  thEvenBackground: '#253546',
  thEvenColor: '#FFFFFF',
  trOddBackground : '#e2e2e2',
  trOddColor : '#333333',
  trEvenBackground : '#FFFFFF',
  trEvenColor : '#333333'
}

export default function cssRulesFromSpecs(specs: TableStyleSpecs = defaultTableStylesSpecs) {
  const {
        cellPaddingEm,
        borderWidthPx,
        selectableText,
        fitContainer,
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
    } = specs
  const selectTextRule = selectableText ? '' : `
    user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
  `
  const spanToContainerRule = fitContainer ? `
    min-height: 100vh;
    min-width: 100vw;
  ` : ''
  return `
    :root {
      font-family: ${fontFamily};
      background-color: transparent;
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
      ${spanToContainerRule}
      margin: 0;
      padding: 0;
    }
    th, td {
      padding: ${cellPaddingEm}em;
      text-align: center;
    }
    table, th, td {
      margin: 0;
    },
    table {
      margin: 'auto';
    }
    th {
      border-bottom: ${borderWidthPx}px solid ${thBorderColor};
      border-right: ${borderWidthPx}px solid ${thBorderColor};
    }
    tr:nth-child(odd) th {
      background-color: ${thOddBackground};
      color: ${thOddColor};
    }
    tr:nth-child(even) th {
      background-color: ${thEvenBackground};
      color: ${thEvenColor};
    }
    td {
      border-bottom: ${borderWidthPx}px solid ${tdBorderColor};
      border-right: ${borderWidthPx}px solid ${tdBorderColor};
    }
    thead {
      background-color: ${thOddBackground};
    }
    tr:nth-child(odd) {
      background-color: ${trOddBackground};
      color: ${trOddColor}
    }
    tr:nth-child(even) {
      background-color: ${trEvenBackground};
      color: ${trEvenColor};
    }
    `
}
