export const COLLECTIONS = {
  USERS: 'users',
  DROPS: 'drops',
  FLOWS: 'flows',
  TASKS: 'tasks',
  COMMENTARY: 'aiCommentary',
  EVENTS: 'calendarEvents',
} as const;

export const PINECONE_INDEX = 'fount-drops';
export const EMBEDDING_MODEL = 'text-embedding-3-small';
export const EMBEDDING_DIMENSIONS = 1536;

export const AI_TASKS = {
  TAG_SUGGEST: 'tag_suggest',
  EMBED: 'embed',
  COMMENTARY: 'commentary',
  GENERATE: 'generate',
  SEARCH: 'search',
  OCR: 'ocr',
} as const;

export const RATE_LIMITS = {
  SEARCH_PER_DAY: 20,
  GENERATE_PER_DAY: 10,
} as const;

export const FILE_SIZE_LIMITS = {
  voice: 50 * 1024 * 1024,    // 50 MB
  scan: 20 * 1024 * 1024,     // 20 MB
  file: 100 * 1024 * 1024,    // 100 MB
} as const;
