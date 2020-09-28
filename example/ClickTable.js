import React, {PureComponent} from 'react';
import {View, Modal, Button, Text, StyleSheet} from 'react-native';
import {HTMLTable} from '@native-html/table-plugin';
import WebView from 'react-native-webview';

const tableConfig = {
  WebView,
  animationType: 'animated',
};

const unconstrainedHeight = () => null;

export default class ClickTable extends PureComponent {
  state = {
    modalVisible: false,
  };

  render() {
    const {numOfRows, numOfColumns, numOfChars} = this.props;
    // If table contains less then 100 chars or has less then 4 columns and 8 rows,
    // show table inline
    const shouldRenderTableInline =
      numOfChars < 400 || (numOfColumns < 4 && numOfRows < 8);
    const description = (
      <Text style={styles.description}>
        This table has {numOfColumns} columns, {numOfRows} rows and contains{' '}
        {numOfChars} readable characters.
        {shouldRenderTableInline
          ? 'Therefore, it should be rendered inline.'
          : 'Therefore, it should be rendered in a modal.'}
      </Text>
    );
    if (shouldRenderTableInline) {
      return (
        <View>
          {description}
          <HTMLTable
            computeHeuristicContentHeight={() => 1000}
            autoheight={true}
            {...this.props}
            {...tableConfig}
          />
        </View>
      );
    }
    // else, show a buton with modal
    return (
      <View>
        {description}
        <Button
          title="Show table"
          onPress={() => this.setState({modalVisible: true})}
        />
        <Modal visible={this.state.modalVisible}>
          <View style={styles.modalContainer}>
            <HTMLTable
              {...this.props}
              {...tableConfig}
              computeContainerHeight={unconstrainedHeight}
            />
            <Button
              title="Close"
              onPress={() => this.setState({modalVisible: false})}
            />
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  description: {
    fontStyle: 'italic',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalContainer: {flex: 1, position: 'relative'},
});
