import { DarkTheme, DefaultTheme, Slot, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { Provider } from 'react-redux';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { store } from '@/store/store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Provider store={store}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Slot />
      </ThemeProvider>
    </Provider>
  );
}
