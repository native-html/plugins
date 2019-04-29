"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defaultTableStylesSpecs = {
    defaultBackground: '#FFFFFF',
    defaultColor: '#333333',
    thBorderColor: '#3f5c7a',
    tdBorderColor: '#b5b5b5',
    thBackground: '#253546',
    thColor: '#FFFFFF',
    trOddBackground: '#e2e2e2',
    trOddColor: '#FFFFFF',
    trEvenBackground: '',
    trEvenColor: '#FFFFFF'
};
function cssStylesFromSpecs(specs = defaultTableStylesSpecs) {
    const { defaultBackground, defaultColor, tdBorderColor, thBorderColor, thBackground, thColor, trOddBackground, trOddColor, trEvenBackground, trEvenColor } = specs;
    return `
    :root {
      color: ${defaultColor};
      background-color: transparent;
    }
    body, html {
      margin: 0;
      background-color: 'transparent';
    }
    table {
      min-height: 100vh;
      min-width: 100vw;
      margin: 0;
      padding: 0;
      background-color: ${defaultBackground};
    }
    th, td {
      padding: 0.25em;
      text-align: center;
    }
    table, th, td {
      margin: 0;
    },
    table {
      margin: 'auto';
    }
    th {
      border-bottom: 0.25px solid ${thBorderColor};
      border-right: 0.25px solid ${thBorderColor};
    }
    td {
      border-bottom: 0.25px solid ${tdBorderColor};
      border-right: 0.25px solid ${tdBorderColor};
    }
    thead {
      background-color: ${thBackground};
    }
    th {
      background-color: ${thBackground};
      color: ${thColor};
    }
    tr:nth-child(odd) {
      background-color: ${trOddBackground};
      color: ${trOddColor}
    }
    tr:nth-child(even), tr:nth-child(1) {
      background-color: ${trEvenBackground};
      color: ${trEvenColor};
    }
    `;
}
exports.default = cssStylesFromSpecs;
