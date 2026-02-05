import type { TestSeriesObject } from './types'

export const description = 'Initial config schema'

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
    enabled: true,
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
    description: 'Standard v1 config with selectionToolbar enabled',
    config: configExample,
  },
  'with-disabled-patterns': {
    description: 'Config with custom disabled patterns',
    config: {
      ...configExample,
      selectionToolbar: {
        enabled: true,
        disabledSelectionToolbarPatterns: ['example.com', '*.test.org'],
      },
    },
  },
}
