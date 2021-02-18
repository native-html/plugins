import groupBy from 'ramda/src/groupBy';
import prop from 'ramda/src/prop';
import pipe from 'ramda/src/pipe';
import reduce from 'ramda/src/reduce';
import max from 'ramda/src/max';
import map from 'ramda/src/map';
import flatten from 'ramda/src/flatten';
import values from 'ramda/src/values';
import mapObjIndexed from 'ramda/src/mapObjIndexed';

import { CellProperties } from '../shared-types';

const getColumnMax = pipe<CellProperties[], number[], number>(
  map(prop('weight')),
  reduce<number, number>(max, 0)
);

function splitColspanCells(cell: CellProperties) {
  if (cell.lenX > 1) {
    const cells: CellProperties[] = [];
    for (let i = 0; i < cell.lenX; i++) {
      cells[i] = {
        lenX: 1,
        lenY: cell.lenY,
        weight: cell.weight / cell.lenX,
        x: cell.x + i,
        y: cell.y
      };
    }
    return cells;
  }
  return cell;
}

const getColumnWeights = pipe(
  pipe(map(splitColspanCells), flatten),
  groupBy<CellProperties, string>(pipe(prop('x'), String)),
  mapObjIndexed(getColumnMax),
  values
);

export default getColumnWeights;
