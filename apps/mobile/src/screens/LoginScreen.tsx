import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BRAND = '#1D9E75';
const BG_SECONDARY = '#f5f4f0';
const TEXT_PRIMARY = '#18181a';
const TEXT_SECONDARY = '#6b6a67';
const TEXT_TERTIARY = '#9b9996';
const BORDER_SEC = 'rgba(0,0,0,0.18)';

export function LoginScreen() {
  // NOTE: Firebase Google sign-in on mobile requires expo-auth-session
  // or react-native-google-signin. Wire that up here.
  function handleGoogleSignIn() {
    // TODO: implement with expo-auth-session
    console.log('sign in');
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.inner}>
        <View style={s.logo}>
          <Text style={s.logoText}>F</Text>
        </View>
        <Text style={s.title}>Welcome to Fount</Text>
        <Text style={s.subtitle}>Your personal knowledge companion</Text>

        <TouchableOpacity style={s.googleBtn} onPress={handleGoogleSignIn}>
          <Text style={s.googleBtnText}>Continue with Google</Text>
        </TouchableOpacity>

        <Text style={s.legal}>By continuing you agree to Fount's Terms and Privacy Policy</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_SECONDARY },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  logo: {
    width: 56, height: 56, borderRadius: 16, backgroundColor: BRAND,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  logoText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  title: { fontSize: 24, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 6 },
  subtitle: { fontSize: 14, color: TEXT_SECONDARY, marginBottom: 40 },
  googleBtn: {
    width: '100%', borderWidth: 1, borderColor: BORDER_SEC,
    borderRadius: 14, paddingVertical: 14, alignItems: 'center', backgroundColor: '#fff',
  },
  googleBtnText: { fontSize: 15, fontWeight: '500', color: TEXT_PRIMARY },
  legal: { fontSize: 11, color: TEXT_TERTIARY, textAlign: 'center', marginTop: 24 },
});
