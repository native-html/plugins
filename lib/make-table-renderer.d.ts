import { RendererDeclaration } from "react-native-render-html";
import { TableProps } from "./HTMLTable";
import { Omit } from 'ramda';
export declare type TableRendererConfig = Omit<TableProps, 'rawHtml'>;
declare function makeTableRenderer(tableConfig: TableRendererConfig): RendererDeclaration;
export default makeTableRenderer;
