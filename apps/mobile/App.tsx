import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuthStore } from './src/store/auth';
import { TabNavigator } from './src/navigation/TabNavigator';
import { NewDropScreen } from './src/screens/NewDropScreen';

// Auth screens (lazy — only shown when logged out)
import { LoginScreen } from './src/screens/LoginScreen';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
});

export default function App() {
  const { user, loading, _init } = useAuthStore();

  useEffect(() => {
    const unsubscribe = _init();
    return unsubscribe;
  }, [_init]);

  if (loading) return null; // splash screen handles this

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
              <>
                <Stack.Screen name="Tabs" component={TabNavigator} />
                <Stack.Screen
                  name="NewDrop"
                  component={NewDropScreen}
                  options={{ presentation: 'modal' }}
                />
              </>
            ) : (
              <Stack.Screen name="Login" component={LoginScreen} />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
