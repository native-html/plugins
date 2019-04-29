import { PureComponent, ComponentType } from "react";
import { TableStyleSpecs } from "./types";
import { StyleProp, ViewStyle } from "react-native";
export interface TableProps {
    rawHtml: string;
    WebViewComponent: ComponentType<any>;
    /**
     * Intercept links press.
     */
    onPressLink?: (url: string) => void;
    /**
     * Container style.
     */
    style?: StyleProp<ViewStyle>;
    /**
     * Specs to generate css rules.
     *
     * **Info**: ignored if `cssRules` are provided.
     */
    tableStyleSpecs?: TableStyleSpecs;
    /**
     * Override default CSS rules with this prop.
     */
    cssRules?: string;
}
export default class HTMLTable extends PureComponent<TableProps> {
    private handleOnShouldStartLoadWithRequest;
    render(): JSX.Element;
}
