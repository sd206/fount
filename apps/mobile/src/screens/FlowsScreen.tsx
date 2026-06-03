import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useFlows } from '../hooks/useFlows';
import type { Flow } from '@fount/shared/types';

const BRAND = '#1D9E75';
const BG_SECONDARY = '#f5f4f0';
const BG_TERTIARY = '#eceae3';
const TEXT_PRIMARY = '#18181a';
const TEXT_TERTIARY = '#9b9996';
const BORDER = 'rgba(0,0,0,0.09)';
const BORDER_SEC = 'rgba(0,0,0,0.18)';

export function FlowsScreen() {
  const { data, isLoading } = useFlows();
  const navigation = useNavigation<any>();
  const flows = data?.flows ?? [];

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Flows</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color={BRAND} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={flows}
          numColumns={2}
          keyExtractor={item => item.id}
          contentContainerStyle={s.grid}
          columnWrapperStyle={{ gap: 10 }}
          renderItem={({ item }) => (
            <FlowCard flow={item} onPress={() => navigation.navigate('FlowDetail', { flowId: item.id })} />
          )}
          ListFooterComponent={
            <TouchableOpacity
              style={s.newFlowCard}
              onPress={() => navigation.navigate('NewFlow')}
            >
              <Text style={{ fontSize: 24, color: TEXT_TERTIARY }}>+</Text>
              <Text style={s.newFlowText}>New Flow</Text>
            </TouchableOpacity>
          }
        />
      )}
    </SafeAreaView>
  );
}

function FlowCard({ flow, onPress }: { flow: Flow; onPress: () => void }) {
  return (
    <TouchableOpacity style={s.card} onPress={onPress}>
      <View style={s.cardIcon}>
        <Text>⊞</Text>
      </View>
      <Text style={s.cardName} numberOfLines={2}>{flow.name}</Text>
      <Text style={s.cardCount}>{flow.dropIds.length} drops</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_SECONDARY },
  header: { padding: 16, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '600', color: TEXT_PRIMARY },
  grid: { padding: 12, gap: 10 },
  card: {
    flex: 1, backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 1, borderColor: BORDER, padding: 14,
  },
  cardIcon: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: BG_TERTIARY,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  cardName: { fontSize: 14, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 4 },
  cardCount: { fontSize: 12, color: TEXT_TERTIARY },
  newFlowCard: {
    margin: 0, marginTop: 0, backgroundColor: 'transparent',
    borderWidth: 2, borderStyle: 'dashed', borderColor: BORDER_SEC,
    borderRadius: 16, padding: 14, alignItems: 'center', justifyContent: 'center',
    height: 120,
  },
  newFlowText: { fontSize: 13, color: TEXT_TERTIARY, marginTop: 4 },
});
