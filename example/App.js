/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  UIManager,
  Platform,
} from 'react-native';
import SimpleExample from './SimpleExample';
import CustomExample from './CustomExample';

export default class App extends Component {
  componentDidMount() {
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental &&
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.contentStyle}
          style={styles.scrollViewStyle}>
          <Text style={styles.welcome}>
            @native-html/table-plugin Simple Example
          </Text>
          <View style={styles.example}>
            <SimpleExample />
          </View>
          <Text style={styles.welcome}>
            @native-html/table-plugin Custom Example
          </Text>
          <View style={styles.example}>
            <CustomExample />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  example: {
    flex: 1,
    width: '100%',
  },
  contentStyle: {
    paddingHorizontal: 20,
  },
  scrollViewStyle: {
    backgroundColor: 'white',
    flex: 1,
  },
});
