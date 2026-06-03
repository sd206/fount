import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { DashboardScreen } from '../screens/DashboardScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { FlowsScreen } from '../screens/FlowsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const BRAND = '#1D9E75';
const TEXT_TERTIARY = '#9b9996';

export function TabNavigator() {
  const navigation = useNavigation<any>();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          borderTopColor: 'rgba(0,0,0,0.09)',
          backgroundColor: '#fff',
          height: 64,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: BRAND,
        tabBarInactiveTintColor: TEXT_TERTIARY,
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{ tabBarIcon: ({ color }) => <TabIcon name="home" color={color} /> }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ tabBarIcon: ({ color }) => <TabIcon name="search" color={color} /> }}
      />

      {/* Center Drop CTA — custom button */}
      <Tab.Screen
        name="Drop"
        component={DashboardScreen} // placeholder — navigator handles press
        options={{
          tabBarButton: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('NewDrop')}
              style={styles.dropCta}
            >
              <View style={styles.dropCtaInner}>
                {/* Plus icon using text, swap with @expo/vector-icons if preferred */}
                <View style={{ width: 22, height: 2, backgroundColor: '#fff', borderRadius: 1 }} />
                <View style={{ width: 2, height: 22, backgroundColor: '#fff', borderRadius: 1, position: 'absolute' }} />
              </View>
            </TouchableOpacity>
          ),
        }}
      />

      <Tab.Screen
        name="Flows"
        component={FlowsScreen}
        options={{ tabBarIcon: ({ color }) => <TabIcon name="stack" color={color} /> }}
      />
      <Tab.Screen
        name="Me"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ color }) => <TabIcon name="user" color={color} /> }}
      />
    </Tab.Navigator>
  );
}

/** Renders a Tabler icon name as text — replace with @expo/vector-icons/MaterialIcons for production */
function TabIcon({ name, color }: { name: string; color: string }) {
  const iconMap: Record<string, string> = {
    home: '⌂', search: '⌕', stack: '⊞', user: '◉',
  };
  return (
    <View style={{ alignItems: 'center' }}>
      {/* In a real app, use: <Ionicons name={...} size={24} color={color} /> */}
      <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
        {/* placeholder — integrate @expo/vector-icons */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dropCta: {
    top: -16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropCtaInner: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: BRAND,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});
