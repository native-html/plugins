import groupBy from 'ramda/src/groupBy';
import prop from 'ramda/src/prop';
import pipe from 'ramda/src/pipe';
import reduce from 'ramda/src/reduce';
import map from 'ramda/src/map';
import flatten from 'ramda/src/flatten';
import values from 'ramda/src/values';
import mapObjIndexed from 'ramda/src/mapObjIndexed';

import {
  CellProperties,
  TCellConstraints,
  TColumnConstraints
} from '../shared-types';

const getColumnMetrics = pipe<
  CellProperties[],
  TCellConstraints[],
  TColumnConstraints
>(
  map(prop('constraints')),
  reduce<TCellConstraints, TColumnConstraints>(
    (columnConstraints, cellConstraints) => {
      return {
        minWidth: Math.max(
          columnConstraints.minWidth,
          cellConstraints.minWidth
        ),
        contentDensity:
          columnConstraints.contentDensity + cellConstraints.contentDensity,
        spread: Math.max(
          columnConstraints.spread,
          cellConstraints.contentDensity
        )
      };
    },
    {
      minWidth: 0,
      spread: 0,
      contentDensity: 0
    }
  )
);

function splitColspanCells(cell: CellProperties) {
  if (cell.lenX > 1) {
    const cells: CellProperties[] = [];
    for (let i = 0; i < cell.lenX; i++) {
      cells[i] = {
        lenX: 1,
        lenY: cell.lenY,
        constraints: {
          minWidth: cell.constraints.minWidth / cell.lenX,
          contentDensity: cell.constraints.contentDensity / cell.lenX
        },
        x: cell.x + i,
        y: cell.y
      };
    }
    return cells;
  }
  return cell;
}

const reduceColumnConstraints = pipe(
  pipe(map(splitColspanCells), flatten),
  groupBy<CellProperties, string>(pipe(prop('x'), String)),
  mapObjIndexed(getColumnMetrics),
  values
);

export default reduceColumnConstraints;
