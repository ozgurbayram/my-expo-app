import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

import '../global.css';
import '../translation';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

const queryClient = new QueryClient();

export default function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <Stack screenOptions={{}}>
          <Stack.Screen
            name="index"
            options={{
              headerShown: true,
              headerBackTitle: 'Back',
              headerTitleAlign: 'left',
            }}
          />
          <Stack.Screen name="details" options={{ headerShown: false }} />
          <Stack.Screen
            name="crop"
            options={{
              headerShown: true,
              headerTitleAlign: 'center',
            }}
          />
        </Stack>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
