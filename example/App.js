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
  ScrollView,
  UIManager,
  Platform,
  Button,
} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import SimpleExample from './SimpleExample';
import CustomExample from './CustomExample';

const Stack = createStackNavigator();

function SimpleExampleDescription() {
  return (
    <Text style={styles.welcome}>
      This Table renderer was created with makeTableRenderer function, and will
      render HTML tables in the body of the HTML component.
    </Text>
  );
}

function CustomExampleDescription() {
  return (
    <Text style={styles.welcome}>
      This Table renderer was created with makeCustomTableRenderer function to
      register a custom component. Depending on the table complexity, it will
      display the HTLM table in the content or through an actionable modal.
    </Text>
  );
}

function CustomExampleScreen() {
  return (
    <ScrollView
      contentContainerStyle={styles.contentStyle}
      style={styles.scrollViewStyle}>
      <CustomExampleDescription />
      <View style={styles.example}>
        <CustomExample />
      </View>
    </ScrollView>
  );
}

function SimpleExampleScreen() {
  return (
    <ScrollView
      contentContainerStyle={styles.contentStyle}
      style={styles.scrollViewStyle}>
      <SimpleExampleDescription />
      <View style={styles.example}>
        <SimpleExample />
      </View>
    </ScrollView>
  );
}

function HomeScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.buttonsContainer}>
      <Button
        title="Open simple example"
        onPress={() => navigation.navigate('SimpleExample')}
      />
      <Button
        title="Open custom example"
        onPress={() => navigation.navigate('CustomExample')}
      />
    </View>
  );
}

export default class App extends Component {
  componentDidMount() {
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental &&
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            options={{
              title: '@native-html/table-plugin',
            }}
            name="Home"
            component={HomeScreen}
          />
          <Stack.Screen
            options={{
              title: 'Simple Example',
            }}
            name="SimpleExample"
            component={SimpleExampleScreen}
          />
          <Stack.Screen
            options={{
              title: 'Custom Example',
            }}
            name="CustomExample"
            component={CustomExampleScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  buttonsContainer: {
    justifyContent: 'space-between',
    alignItems: 'stretch',
    minHeight: 100,
    alignSelf: 'center',
    marginTop: 100,
  },
  welcome: {
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
