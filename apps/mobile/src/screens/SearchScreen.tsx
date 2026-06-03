import { useState } from 'react';
import {
  View, Text, TextInput, FlatList,
  TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSearch } from '../hooks/useSearch';
import type { Drop } from '@fount/shared/types';

const BRAND = '#1D9E75';
const BG_SECONDARY = '#f5f4f0';
const TEXT_PRIMARY = '#18181a';
const TEXT_SECONDARY = '#6b6a67';
const TEXT_TERTIARY = '#9b9996';
const BORDER = 'rgba(0,0,0,0.09)';

export function SearchScreen() {
  const [query, setQuery] = useState('');
  const search = useSearch();

  function handleSearch() {
    if (query.trim()) search.mutate({ query });
  }

  return (
    <SafeAreaView style={s.container}>
      {/* Search bar */}
      <View style={s.searchRow}>
        <View style={s.searchBox}>
          <Text style={{ color: TEXT_TERTIARY }}>🔍</Text>
          <TextInput
            placeholder="Search anything..."
            placeholderTextColor={TEXT_TERTIARY}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            style={s.searchInput}
          />
          {search.isPending && <ActivityIndicator size="small" color={BRAND} />}
        </View>
      </View>

      {search.data && (
        <FlatList
          data={search.data.sources}
          keyExtractor={item => item.id}
          contentContainerStyle={s.list}
          ListHeaderComponent={
            <View style={s.answerCard}>
              <Text style={s.answerLabel}>Fount found</Text>
              <Text style={s.answerText}>{search.data.answer}</Text>
            </View>
          }
          renderItem={({ item }) => <SourceCard drop={item} />}
        />
      )}
    </SafeAreaView>
  );
}

function SourceCard({ drop }: { drop: Drop }) {
  return (
    <View style={s.sourceCard}>
      <Text style={s.sourceTitle} numberOfLines={1}>
        {drop.title ?? drop.url ?? 'Untitled'}
      </Text>
      {drop.aiSummary && (
        <Text style={s.sourceSummary} numberOfLines={2}>{drop.aiSummary}</Text>
      )}
      {(drop.tags?.length ?? 0) > 0 && (
        <View style={s.tags}>
          {drop.tags.slice(0, 3).map(tag => (
            <View key={tag} style={s.tag}>
              <Text style={s.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_SECONDARY },
  searchRow: { padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: BORDER },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: BG_SECONDARY, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: TEXT_PRIMARY },
  list: { padding: 12, gap: 10 },
  answerCard: {
    borderRadius: 16, padding: 16, marginBottom: 12,
    backgroundColor: BRAND,
  },
  answerLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginBottom: 6 },
  answerText: { color: '#fff', fontSize: 14, lineHeight: 20 },
  sourceCard: {
    backgroundColor: '#fff', borderRadius: 14,
    borderWidth: 1, borderColor: BORDER,
    padding: 14, marginBottom: 8,
  },
  sourceTitle: { fontSize: 14, fontWeight: '600', color: TEXT_PRIMARY },
  sourceSummary: { fontSize: 12, color: TEXT_SECONDARY, marginTop: 4 },
  tags: { flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  tag: { backgroundColor: BG_SECONDARY, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  tagText: { fontSize: 11, color: TEXT_TERTIARY },
});
