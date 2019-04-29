import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { TableProps } from './types';
export { IGNORED_TAGS, TABLE_TAGS } from './tags';
export { TableProps } from './types';
interface State {
    containerHeight: number;
}
export default class HTMLTable<WVP = any> extends PureComponent<TableProps<WVP>, State> {
    static defaultProps: {
        autoheight: boolean;
    };
    static propTypes: {
        rawHtml: PropTypes.Validator<string>;
        WebViewComponent: PropTypes.Validator<(...args: any[]) => any>;
        autoheight: PropTypes.Requireable<boolean>;
        defaultHeight: PropTypes.Requireable<number>;
        maxHeight: PropTypes.Requireable<number>;
        onLinkPress: PropTypes.Requireable<(...args: any[]) => any>;
        style: PropTypes.Requireable<any>;
        tableStyleSpecs: PropTypes.Requireable<PropTypes.InferProps<{
            linkColor: PropTypes.Validator<string>;
            fontFamily: PropTypes.Validator<string>;
            tdBorderColor: PropTypes.Validator<string>;
            thBorderColor: PropTypes.Validator<string>;
            thBackground: PropTypes.Validator<string>;
            thColor: PropTypes.Validator<string>;
            trOddBackground: PropTypes.Validator<string>;
            trOddColor: PropTypes.Validator<string>;
            trEvenBackground: PropTypes.Validator<string>;
            trEvenColor: PropTypes.Validator<string>;
        }>>;
        cssRules: PropTypes.Requireable<string>;
        webViewProps: PropTypes.Requireable<object>;
    };
    state: State;
    private handleOnMessage;
    private buildHTML;
    private findHeight;
    componentWillUpdate(_nextProps: TableProps, nextState: State): void;
    render(): JSX.Element;
}
