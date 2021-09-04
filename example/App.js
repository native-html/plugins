/* eslint-disable react-native/no-inline-styles */
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
import HeuristicTableExample from './HeuristicTableExample';

const Stack = createStackNavigator();

function Monospace({ children }) {
  return (
    <Text
      style={{
        fontFamily: Platform.select({ default: 'monospace', ios: 'Menlo' }),
        fontWeight: 'bold'
      }}>
      {children}
    </Text>
  );
}

function SimpleExampleDescription() {
  return (
    <Text style={styles.welcome}>
      This <Monospace>TableRenderer</Monospace> is the default export of{' '}
      <Monospace>@native-html/table-plugin</Monospace>, and will render HTML
      tables in the body of the HTML component via a{' '}
      <Monospace>WebView</Monospace>.
    </Text>
  );
}

function CustomExampleDescription() {
  return (
    <Text style={styles.welcome}>
      This Table renderer was created with{' '}
      <Monospace>useHtmlTableProps</Monospace> hook to register a custom
      component. Depending on the table complexity, it will display the HTLM
      table in the content or through an actionable modal.
    </Text>
  );
}

function YoutubeExampleDescription({ scalesPageToFit }) {
  return (
    <Text style={styles.welcome}>
      This <Monospace>IframeRenderer</Monospace> has the{' '}
      <Monospace>scalesPageToFit</Monospace> option set to{' '}
      <Monospace children={scalesPageToFit + ''} />. When{' '}
      <Monospace>true</Monospace>, will zoom down to a level that allows the
      whole content to be visible. Default is <Monospace>false</Monospace>.
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

function YoutubeExampleScreen({ availableWidth, scalesPageToFit }) {
  const [instance, setInstance] = useState(0);
  return (
    <ScrollView
      contentContainerStyle={styles.contentStyle}
      style={styles.scrollViewStyle}>
      <YoutubeExampleDescription scalesPageToFit={scalesPageToFit} />
      <Button title="reload" onPress={() => setInstance((i) => i + 1)} />
      <View style={styles.example}>
        <YoutubeExample
          scalesPageToFit={scalesPageToFit}
          availableWidth={availableWidth}
          instance={instance}
        />
      </View>
    </ScrollView>
  );
}

function HeuristicTableScreen({ availableWidth, onLinkPress }) {
  const [instance, setInstance] = useState(0);
  return (
    <ScrollView
      contentContainerStyle={styles.contentStyle}
      style={styles.scrollViewStyle}>
      <Button title="reload" onPress={() => setInstance((i) => i + 1)} />
      <View style={styles.example}>
        <HeuristicTableExample
          availableWidth={availableWidth}
          onLinkPress={onLinkPress}
          instance={instance}
        />
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
          title="simple table example"
          onPress={() => navigation.navigate('SimpleExample')}
          style={styles.button}
        />
      </View>
      <View style={styles.button}>
        <Button
          title="custom table example"
          onPress={() => navigation.navigate('CustomExample')}
        />
      </View>
      <View style={styles.button}>
        <Button
          title="Youtube iframe example (scaling ON)"
          onPress={() => navigation.navigate('YoutubeExampleScaleOn')}
        />
      </View>
      <View style={styles.button}>
        <Button
          title="Youtube iframe example (scaling OFF)"
          onPress={() => navigation.navigate('YoutubeExampleScaleOff')}
        />
      </View>
      <View style={styles.button}>
        <Button
          title="heuristic table example"
          onPress={() => navigation.navigate('HeuristicTable')}
        />
      </View>
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
  const onLinkPress = useCallback((e, href) => {
    setUrl(href);
  }, []);
  React.useEffect(() => {
    url && setIsSnackVisible(true);
  }, [url]);
  return (
    <PaperProvider>
      <View style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ animationEnabled: false }}>
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
              name="YoutubeExampleScaleOn"
              options={{ title: 'Youtube Example', scalesPageToFit: true }}>
              {() => (
                <YoutubeExampleScreen
                  availableWidth={availableWidth}
                  scalesPageToFit={true}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="YoutubeExampleScaleOff"
              options={{ title: 'Youtube Example', scalesPageToFit: false }}>
              {() => (
                <YoutubeExampleScreen
                  availableWidth={availableWidth}
                  scalesPageToFit={false}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="HeuristicTable"
              options={{ title: 'Heuristic Table' }}>
              {() => (
                <HeuristicTableScreen
                  onLinkPress={onLinkPress}
                  availableWidth={availableWidth}
                />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
        <Portal>
          <Snackbar
            visible={isSnackVisible}
            onDismiss={() => setIsSnackVisible(false)}
            duration={2800}
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
