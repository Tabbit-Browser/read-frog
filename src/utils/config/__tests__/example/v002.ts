import type { TestSeriesObject } from './types'

export const description = 'Reset selectionToolbar.enabled to false'

export const configExample = {
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
      range: 'main',
      autoTranslatePatterns: [],
      autoTranslateLanguages: [],
      shortcut: ['alt', 'e'],
      preload: {
        margin: 1000,
        threshold: 0,
      },
    },
    requestQueueConfig: {
      capacity: 60,
      rate: 8,
    },
    batchQueueConfig: {
      maxCharactersPerBatch: 5000,
      maxItemsPerBatch: 10,
    },
    translationNodeStyle: {
      preset: 'textColor',
      isCustom: false,
      customCSS: null,
    },
  },
  selectionToolbar: {
    enabled: false, // Changed from true to false
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

export const testSeries: TestSeriesObject = {
  'default': {
    description: 'Standard v2 config with selectionToolbar disabled',
    config: configExample,
  },
  'with-disabled-patterns': {
    description: 'Config with custom disabled patterns preserved',
    config: {
      ...configExample,
      selectionToolbar: {
        enabled: false, // Reset to false
        disabledSelectionToolbarPatterns: ['example.com', '*.test.org'], // Preserved
      },
    },
  },
}
