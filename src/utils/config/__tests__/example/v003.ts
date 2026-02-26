import type { TestSeriesObject } from './types'

export const description = 'Reset translate.node.enabled to false'

export const configExample = {
  language: {
    sourceCode: 'auto',
    targetCode: 'cmn',
    level: 'intermediate',
  },
  translate: {
    mode: 'bilingual',
    node: {
      enabled: false, // Changed from true to false
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

export const testSeries: TestSeriesObject = {
  'default': {
    description: 'Standard v3 config with node translation disabled',
    config: configExample,
  },
  'with-disabled-patterns': {
    description: 'Config with custom disabled patterns preserved',
    config: {
      ...configExample,
      selectionToolbar: {
        enabled: false,
        disabledSelectionToolbarPatterns: ['example.com', '*.test.org'],
      },
    },
  },
}
