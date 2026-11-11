import { createContext } from 'react';
import { TNode } from '@native-html/render';

/** The actual content box assigned to a rendered table cell. */
export interface CellContentBox {
  tnode: TNode;
  contentWidth: number;
}

export default createContext<CellContentBox | undefined>(undefined);
