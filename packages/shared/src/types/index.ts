import { Timestamp } from 'firebase-admin/firestore';

// ─── User ────────────────────────────────────────────────────────────────────

export type StorageProvider = 'fount' | 'gdrive' | 'icloud';
export type AiPreference = 'auto' | 'claude' | 'openai' | 'gemini';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  storageProvider: StorageProvider;
  storageToken?: string;
  aiPreference: AiPreference;
  tagVocabulary: string[];        // grows as user confirms tags
  createdAt: Timestamp;
  lastActiveAt: Timestamp;
}

// ─── Drop ────────────────────────────────────────────────────────────────────

export type DropType = 'note' | 'link' | 'file' | 'voice' | 'scan';

export interface Drop {
  id: string;
  userId: string;
  type: DropType;
  title?: string;
  body?: string;
  url?: string;
  fileRef?: string;
  fileMimeType?: string;
  aiSummary?: string;
  tags: string[];
  suggestedTags: string[];
  flowIds: string[];
  sourceUrl?: string;
  deletedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateDropInput = Pick<Drop,
  'type' | 'title' | 'body' | 'url' | 'fileRef' | 'fileMimeType' | 'sourceUrl'
>;

export type UpdateDropInput = Partial<Pick<Drop, 'title' | 'body' | 'tags'>>;

// ─── Flow ────────────────────────────────────────────────────────────────────

export type GenerateType = 'summary' | 'report' | 'action_plan' | 'study_guide';

export interface GeneratedContent {
  type: GenerateType;
  content: string;
  generatedAt: Timestamp;
  provider: string;
}

export interface Flow {
  id: string;
  userId: string;
  name: string;
  description?: string;
  dropIds: string[];
  generatedContent?: GeneratedContent;
  coverDropId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateFlowInput = { name: string; dropIds: string[]; description?: string };
export type UpdateFlowInput = Partial<Pick<Flow, 'name' | 'description' | 'dropIds' | 'coverDropId'>>;

// ─── Task ────────────────────────────────────────────────────────────────────

export type TaskStatus = 'pending' | 'completed' | 'skipped';
export type TaskSource = 'user' | 'ai' | 'calendar_ocr';

export interface Task {
  id: string;
  userId: string;
  title: string;
  dueDate?: Timestamp;
  completedAt?: Timestamp;
  linkedDropIds: string[];
  status: TaskStatus;
  source: TaskSource;
  createdAt: Timestamp;
}

// ─── AI Commentary ───────────────────────────────────────────────────────────

export type CommentaryType =
  | 'missed_activity'
  | 'suggestion'
  | 'conflict'
  | 'grouping_nudge'
  | 'proactive_tip';

export type CommentaryActionType =
  | 'open_flow'
  | 'open_drop'
  | 'create_flow'
  | 'dismiss'
  | 'snooze';

export interface CommentaryAction {
  label: string;
  actionType: CommentaryActionType;
  payload?: Record<string, string>;
}

export interface AiCommentary {
  id: string;
  userId: string;
  type: CommentaryType;
  message: string;
  actions: CommentaryAction[];
  dismissed: boolean;
  snoozedUntil?: Timestamp;
  relatedDropIds: string[];
  relatedFlowIds: string[];
  generatedAt: Timestamp;
}

// ─── Search ──────────────────────────────────────────────────────────────────

export interface SearchResult {
  answer: string;
  sources: Drop[];
  confidence: number;
}

// ─── Calendar ────────────────────────────────────────────────────────────────

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  startAt: Timestamp;
  endAt?: Timestamp;
  location?: string;
  notes?: string;
  source: 'user' | 'ocr';
  linkedDropId?: string;
  createdAt: Timestamp;
}

export interface OcrScanResult {
  events: Omit<CalendarEvent, 'id' | 'userId' | 'createdAt'>[];
  rawText: string;
}
