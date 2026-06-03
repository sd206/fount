import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/auth';

const BRAND = '#1D9E75';
const BG_SECONDARY = '#f5f4f0';
const TEXT_PRIMARY = '#18181a';
const TEXT_SECONDARY = '#6b6a67';
const BORDER = 'rgba(0,0,0,0.09)';

export function ProfileScreen() {
  const { user, logout } = useAuthStore();

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>
            {user?.displayName?.[0]?.toUpperCase() ?? 'F'}
          </Text>
        </View>
        <Text style={s.name}>{user?.displayName ?? 'Fount user'}</Text>
        <Text style={s.email}>{user?.email}</Text>
      </View>

      <View style={s.section}>
        <TouchableOpacity style={s.row}>
          <Text style={s.rowLabel}>Storage</Text>
          <Text style={s.rowValue}>Fount Cloud ›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.row}>
          <Text style={s.rowLabel}>AI preference</Text>
          <Text style={s.rowValue}>Auto ›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.row}>
          <Text style={s.rowLabel}>Notifications</Text>
          <Text style={s.rowValue}>On ›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={s.logoutBtn} onPress={logout}>
        <Text style={s.logoutText}>Sign out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_SECONDARY },
  header: { alignItems: 'center', paddingVertical: 32 },
  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: BRAND,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '600' },
  name: { fontSize: 18, fontWeight: '600', color: TEXT_PRIMARY },
  email: { fontSize: 13, color: TEXT_SECONDARY, marginTop: 2 },
  section: {
    backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 16,
    borderWidth: 1, borderColor: BORDER, overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  rowLabel: { fontSize: 14, color: TEXT_PRIMARY },
  rowValue: { fontSize: 14, color: TEXT_SECONDARY },
  logoutBtn: { margin: 16, marginTop: 24, alignItems: 'center' },
  logoutText: { fontSize: 14, color: 'red' },
});
