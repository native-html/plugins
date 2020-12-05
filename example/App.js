import React, { useCallback, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  UIManager,
  Platform,
  Button,
  useWindowDimensions
} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import {
  Snackbar,
  Portal,
  Provider as PaperProvider
} from 'react-native-paper';
import SimpleExample from './SimpleExample';
import CustomExample from './CustomExample';
import YoutubeExample from './YoutubeExample';

const Stack = createStackNavigator();

function SimpleExampleDescription() {
  return (
    <Text style={styles.welcome}>
      This Table renderer was created with extractHtmlProps function, and will
      render HTML tables in the body of the HTML component.
    </Text>
  );
}

function CustomExampleDescription() {
  return (
    <Text style={styles.welcome}>
      This Table renderer was created with extractHtmlTableProps function to
      register a custom component. Depending on the table complexity, it will
      display the HTLM table in the content or through an actionable modal.
    </Text>
  );
}

function YoutubeExampleDescription() {
  return (
    <Text style={styles.welcome}>
      This Iframe renderer has the autoscale option set to true (default). It
      will zoom down to a level that allows the whole viewport to be visible.
    </Text>
  );
}

function CustomExampleScreen({ onLinkPress, availableWidth }) {
  const [instance, setInstance] = useState(0);
  return (
    <ScrollView
      contentContainerStyle={styles.contentStyle}
      style={styles.scrollViewStyle}>
      <CustomExampleDescription />
      <Button title="reload" onPress={() => setInstance((i) => i + 1)} />
      <View style={styles.example}>
        <CustomExample
          availableWidth={availableWidth}
          onLinkPress={onLinkPress}
          instance={instance}
        />
      </View>
    </ScrollView>
  );
}

function SimpleExampleScreen({ onLinkPress, availableWidth }) {
  const [instance, setInstance] = useState(0);
  return (
    <ScrollView
      contentContainerStyle={styles.contentStyle}
      style={styles.scrollViewStyle}>
      <SimpleExampleDescription />
      <Button title="reload" onPress={() => setInstance((i) => i + 1)} />
      <View style={styles.example}>
        <SimpleExample
          availableWidth={availableWidth}
          onLinkPress={onLinkPress}
          instance={instance}
        />
      </View>
    </ScrollView>
  );
}

function YoutubeExampleScreen({ availableWidth }) {
  const [instance, setInstance] = useState(0);
  return (
    <ScrollView
      contentContainerStyle={styles.contentStyle}
      style={styles.scrollViewStyle}>
      <YoutubeExampleDescription />
      <Button title="reload" onPress={() => setInstance((i) => i + 1)} />
      <View style={styles.example}>
        <YoutubeExample availableWidth={availableWidth} instance={instance} />
      </View>
    </ScrollView>
  );
}

function HomeScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.buttonsContainer}>
      <View style={styles.button}>
        <Button
          title="Open simple table example"
          onPress={() => navigation.navigate('SimpleExample')}
          style={styles.button}
        />
      </View>
      <View style={styles.button}>
        <Button
          title="Open custom table example"
          onPress={() => navigation.navigate('CustomExample')}
        />
      </View>
      <Button
        title="Open Youtube iframe example"
        onPress={() => navigation.navigate('YoutubeExample')}
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
  const { width: windowWidth } = useWindowDimensions();
  const availableWidth = windowWidth - 40;
  const onLinkPress = useCallback((e, url) => {
    setUrl(url);
  }, []);
  React.useEffect(() => {
    url && setIsSnackVisible(true);
  }, [url]);
  return (
    <PaperProvider>
      <View style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              options={{
                title: '@native-html/plugins'
              }}
              name="Home"
              component={HomeScreen}
            />
            <Stack.Screen
              options={{
                title: 'Simple Table Example'
              }}
              name="SimpleExample">
              {() => (
                <SimpleExampleScreen
                  availableWidth={availableWidth}
                  onLinkPress={onLinkPress}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              options={{
                title: 'Custom Table Example'
              }}
              name="CustomExample">
              {() => (
                <CustomExampleScreen
                  availableWidth={availableWidth}
                  onLinkPress={onLinkPress}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="YoutubeExample"
              options={{ title: 'Youtube Example' }}>
              {() => <YoutubeExampleScreen availableWidth={availableWidth} />}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
        <Portal>
          <Snackbar
            visible={isSnackVisible}
            onDismiss={() => setIsSnackVisible(false)}
            duration={2800}
            style={{ zIndex: 10000, position: 'absolute', bottom: 0 }}
            action={{
              label: 'Browse',
              onPress: () => WebBrowser.openBrowserAsync(url)
            }}>
            {url}
          </Snackbar>
        </Portal>
        <StatusBar style="auto" />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  button: {
    marginBottom: 10
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
    marginTop: 10,
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
