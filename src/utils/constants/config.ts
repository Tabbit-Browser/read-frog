import type { Config } from '@/types/config/config'
import type { PageTranslateRange } from '@/types/config/translate'
import { DEFAULT_AUTO_TRANSLATE_SHORTCUT_KEY, DEFAULT_BATCH_CONFIG, DEFAULT_PRELOAD_MARGIN, DEFAULT_PRELOAD_THRESHOLD, DEFAULT_REQUEST_CAPACITY, DEFAULT_REQUEST_RATE } from './translate'
import { TRANSLATION_NODE_STYLE_ON_INSTALLED } from './translation-node-style'

export const CONFIG_STORAGE_KEY = 'config'
export const LAST_SYNCED_CONFIG_STORAGE_KEY = 'lastSyncedConfig'
export const GOOGLE_DRIVE_TOKEN_STORAGE_KEY = '__googleDriveToken'

export const DETECTED_CODE_STORAGE_KEY = 'detectedCode'
export const DEFAULT_DETECTED_CODE = 'eng' as const
export const CONFIG_SCHEMA_VERSION = 2

export const DEFAULT_CONFIG: Config = {
  language: {
    sourceCode: 'auto',
    targetCode: 'cmn',
    level: 'intermediate',
  },
  translate: {
    mode: 'bilingual',
    node: {
      enabled: true,
      hotkey: 'Control',
    },
    page: {
      // TODO: change this to "all" for users once our translation algorithm can handle most cases elegantly
      range: import.meta.env.DEV ? 'all' : 'main',
      autoTranslatePatterns: ['news.ycombinator.com'],
      autoTranslateLanguages: [],
      shortcut: DEFAULT_AUTO_TRANSLATE_SHORTCUT_KEY,
      preload: {
        margin: DEFAULT_PRELOAD_MARGIN,
        threshold: DEFAULT_PRELOAD_THRESHOLD,
      },
    },
    requestQueueConfig: {
      capacity: DEFAULT_REQUEST_CAPACITY,
      rate: DEFAULT_REQUEST_RATE,
    },
    batchQueueConfig: {
      maxCharactersPerBatch: DEFAULT_BATCH_CONFIG.maxCharactersPerBatch,
      maxItemsPerBatch: DEFAULT_BATCH_CONFIG.maxItemsPerBatch,
    },
    translationNodeStyle: {
      preset: TRANSLATION_NODE_STYLE_ON_INSTALLED,
      isCustom: false,
      customCSS: null,
    },
  },
  selectionToolbar: {
    enabled: false,
    disabledSelectionToolbarPatterns: [],
  },
  betaExperience: {
    enabled: false,
  },
  contextMenu: {
    enabled: true,
  },
  videoSubtitles: {
    enabled: false,
  },
}

export const PAGE_TRANSLATE_RANGE_ITEMS: Record<
  PageTranslateRange,
  { label: string }
> = {
  main: { label: 'Main' },
  all: { label: 'All' },
}
