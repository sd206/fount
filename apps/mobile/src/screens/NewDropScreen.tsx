import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useCreateDrop } from '../hooks/useDrops';
import type { DropType } from '@fount/shared/types';

const BRAND = '#1D9E75';
const BG_SECONDARY = '#f5f4f0';
const TEXT_PRIMARY = '#18181a';
const TEXT_TERTIARY = '#9b9996';
const BORDER = 'rgba(0,0,0,0.09)';

const TABS: { type: DropType; label: string }[] = [
  { type: 'note', label: 'Note' },
  { type: 'link', label: 'Link' },
  { type: 'file', label: 'File' },
  { type: 'voice', label: 'Voice' },
  { type: 'scan', label: 'Scan' },
];

export function NewDropScreen() {
  const [activeTab, setActiveTab] = useState<DropType>('note');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const navigation = useNavigation();
  const createDrop = useCreateDrop();

  async function handleSave() {
    await createDrop.mutateAsync({
      type: activeTab,
      title: title || undefined,
      body: activeTab === 'note' ? body : undefined,
      url: activeTab === 'link' ? url : undefined,
    });
    navigation.goBack();
  }

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.cancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Drop</Text>
          <TouchableOpacity onPress={handleSave} disabled={createDrop.isPending}>
            <Text style={[s.save, createDrop.isPending && { opacity: 0.5 }]}>
              {createDrop.isPending ? 'Saving…' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabs} contentContainerStyle={s.tabsContent}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.type}
              onPress={() => setActiveTab(tab.type)}
              style={[s.tab, activeTab === tab.type && s.tabActive]}
            >
              <Text style={[s.tabText, activeTab === tab.type && s.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content */}
        <View style={s.content}>
          <TextInput
            placeholder="Title (optional)"
            placeholderTextColor={TEXT_TERTIARY}
            value={title}
            onChangeText={setTitle}
            style={s.titleInput}
          />

          {activeTab === 'note' && (
            <TextInput
              placeholder="Write anything..."
              placeholderTextColor={TEXT_TERTIARY}
              value={body}
              onChangeText={setBody}
              multiline
              style={s.bodyInput}
              textAlignVertical="top"
            />
          )}

          {activeTab === 'link' && (
            <TextInput
              placeholder="Paste a URL..."
              placeholderTextColor={TEXT_TERTIARY}
              value={url}
              onChangeText={setUrl}
              keyboardType="url"
              autoCapitalize="none"
              style={s.bodyInput}
            />
          )}

          {(activeTab === 'file' || activeTab === 'scan' || activeTab === 'voice') && (
            <View style={s.uploadArea}>
              <Text style={{ fontSize: 32 }}>
                {activeTab === 'voice' ? '🎤' : activeTab === 'scan' ? '📷' : '📎'}
              </Text>
              <Text style={s.uploadText}>
                {activeTab === 'voice'
                  ? 'Tap to record'
                  : activeTab === 'scan'
                  ? 'Take a photo or upload'
                  : 'Choose a file'}
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_SECONDARY },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  headerTitle: { fontSize: 16, fontWeight: '600', color: TEXT_PRIMARY },
  cancel: { fontSize: 15, color: TEXT_TERTIARY },
  save: { fontSize: 15, fontWeight: '600', color: BRAND },
  tabs: { flexGrow: 0, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: BORDER },
  tabsContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 6 },
  tab: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, backgroundColor: BG_SECONDARY,
  },
  tabActive: { backgroundColor: BRAND },
  tabText: { fontSize: 13, color: TEXT_TERTIARY, fontWeight: '500' },
  tabTextActive: { color: '#fff' },
  content: {
    flex: 1, backgroundColor: '#fff', margin: 16, borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: BORDER,
  },
  titleInput: {
    fontSize: 15, fontWeight: '600', color: TEXT_PRIMARY,
    borderBottomWidth: 1, borderBottomColor: BORDER, paddingBottom: 12, marginBottom: 12,
  },
  bodyInput: { fontSize: 14, color: TEXT_PRIMARY, flex: 1 },
  uploadArea: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 2, borderStyle: 'dashed', borderColor: BORDER, borderRadius: 12,
  },
  uploadText: { fontSize: 14, color: TEXT_TERTIARY },
});
