
import React, { PureComponent } from 'react';
import { View, Modal, Button, Text } from 'react-native';
import { HTMLTable } from 'react-native-render-html-table-bridge';
import WebView from 'react-native-webview';

const tableConfig = {
  WebViewComponent: WebView
};

export default class ClickTable extends PureComponent<Props> {

  state = {
    modalVisible: false
  }

  render() {
    const { html, numOfRows, numOfColumns, numOfChars } = this.props
    // If table contains less then 100 chars or has less then 4 columns and 8 rows,
    // show table inline
    const shouldRenderTableInline = numOfChars < 400 || numOfColumns < 4 && numOfRows < 8
    const description = (
      <Text style={{ fontStyle: 'italic', fontSize: 11, textAlign: 'center' }}>
        This table has {numOfColumns} columns, {numOfRows} rows and contains {numOfChars} readable characters.
        {shouldRenderTableInline ? 'Therefore, it should be rendered inline.' : 'Therefore, it should be rendered in a modal.'}
      </Text>
    )
    if (shouldRenderTableInline) {
      return (
        <View>
          {description}
          <HTMLTable autoheight={true} {...this.props} {...tableConfig} />
        </View>
      )
    }
    // else, show a buton with modal
    return (
      <View>
        {description}
        <Button title="Show table" onPress={() => this.setState({ modalVisible: true })} />
        <Modal visible={this.state.modalVisible}>
          <View style={{ flex: 1, position: 'relative' }}>
            <HTMLTable autoHeight={false}
                       style={{ flex: 1 }}
                       {...this.props}
                       {...tableConfig} />
            <Button title="Close" onPress={() => this.setState({ modalVisible: false })} />
          </View>
        </Modal>
      </View>
    )
  }
}
