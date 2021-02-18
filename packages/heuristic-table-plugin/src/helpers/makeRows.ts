import groupBy from 'ramda/src/groupBy';
import values from 'ramda/src/values';
import pipe from 'ramda/src/pipe';
import prop from 'ramda/src/prop';
import { TableCell } from '../shared-types';

const makeRows = pipe(
  groupBy<TableCell, string>(pipe(prop('y'), String)),
  values
);

export default makeRows;
