import { DarkTheme, DefaultTheme, Slot, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Provider } from 'react-redux';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { hydrateStore, store } from '@/store/store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isStoreReady, setIsStoreReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void hydrateStore().then(() => {
      if (!cancelled) {
        setIsStoreReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        {isStoreReady ? <Slot /> : null}
      </ThemeProvider>
    </Provider>
  );
}
