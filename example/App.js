import React, { Component, useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  UIManager,
  Platform,
  Button
} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import SnackBar from 'react-native-snackbar-component';
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

function CustomExampleScreen({ onLinkPress }) {
  const [instance, setInstance] = useState(0);
  return (
    <ScrollView
      contentContainerStyle={styles.contentStyle}
      style={styles.scrollViewStyle}>
      <CustomExampleDescription />
      <Button title="reload" onPress={() => setInstance((i) => i + 1)} />
      <View style={styles.example}>
        <CustomExample onLinkPress={onLinkPress} instance={instance} />
      </View>
    </ScrollView>
  );
}

function SimpleExampleScreen({ onLinkPress }) {
  const [instance, setInstance] = useState(0);
  return (
    <ScrollView
      contentContainerStyle={styles.contentStyle}
      style={styles.scrollViewStyle}>
      <SimpleExampleDescription />
      <Button title="reload" onPress={() => setInstance((i) => i + 1)} />
      <View style={styles.example}>
        <SimpleExample onLinkPress={onLinkPress} instance={instance} />
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

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function App() {
  const [url, setUrl] = useState(null);
  const [isSnackVisible, setIsSnackVisible] = useState(false);
  useEffect(() => {
    if (url) {
      setIsSnackVisible(true);
    }
    let timeout = setTimeout(setIsSnackVisible.bind(null, false), 3000);
    return clearTimeout.bind(null, timeout);
  }, [url])
  const onLinkPress = useCallback((e, url) => {
    setUrl(url);
  }, []);
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            options={{
              title: '@native-html/table-plugin'
            }}
            name="Home"
            component={HomeScreen}
          />
          <Stack.Screen
            options={{
              title: 'Simple Example'
            }}
            name="SimpleExample">
            {() => <SimpleExampleScreen onLinkPress={onLinkPress} />}
          </Stack.Screen>
          <Stack.Screen
            options={{
              title: 'Custom Example'
            }}
            name="CustomExample">
            {() => <CustomExampleScreen onLinkPress={onLinkPress} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
      <SnackBar
        visible={isSnackVisible}
        textMessage={url}
        autoHidingTime={3000}
        actionHandler={() => WebBrowser.openBrowserAsync(url)}
        actionText="Open in Browser"
      />
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  buttonsContainer: {
    justifyContent: 'space-between',
    alignItems: 'stretch',
    minHeight: 100,
    alignSelf: 'center',
    marginTop: 100
  },
  welcome: {
    margin: 10
  },
  example: {
    flex: 1,
    width: '100%'
  },
  contentStyle: {
    paddingHorizontal: 20
  },
  scrollViewStyle: {
    backgroundColor: 'white',
    flex: 1
  }
});
