/* eslint-disable react-native/no-inline-styles */
import React, { PureComponent, useState } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import { Modal, Portal } from 'react-native-paper';
import { HTMLTable } from '@native-html/table-plugin';
import WebView from 'react-native-webview';
import {
  SafeAreaView,
  useSafeAreaInsets
} from 'react-native-safe-area-context';

const tableConfig = {
  WebView,
  animationType: 'animated'
};

const unconstrainedHeight = () => null;

export default function ClickTable(props) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { top } = useSafeAreaInsets();
  const { numOfRows, numOfColumns, numOfChars } = props;
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
          {...props}
          {...tableConfig}
        />
      </View>
    );
  }
  // else, show a buton with modal
  return (
    <View>
      {description}
      <Button title="Show table" onPress={() => setIsModalVisible(true)} />
      <Portal>
        <Modal
          dismissable
          visible={isModalVisible}
          contentContainerStyle={[
            styles.modalContainer,
            { paddingTop: top, zIndex: 1 },
            StyleSheet.absoluteFill
          ]}
          onDismiss={() => setIsModalVisible(false)}>
          <HTMLTable
            {...props}
            {...tableConfig}
            style={[props.style, { maxWidth: null }]}
            computeContainerHeight={unconstrainedHeight}
          />
          <Button title="Close" onPress={() => setIsModalVisible(false)} />
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  description: {
    fontStyle: 'italic',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 20
  },
  modalContainer: { flex: 1, position: 'relative', zIndex: 1 }
});
