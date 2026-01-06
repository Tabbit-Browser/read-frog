// Timing constants
export const NAVIGATION_HANDLER_DELAY = 1000
export const COMPLETED_STATE_HIDE_DELAY = 500
export const FETCH_CHECK_INTERVAL = 100
export const FETCH_SUBTITLES_TIMEOUT = 10_000
export const MAX_GAP_MS = 2000
export const PAUSE_TIMEOUT_MS = 1000

// Segmentation constants
export const MAX_WORDS = 15
export const SENTENCE_END_PATTERN = /[,.?!…\])]$/

// DOM IDs
export const TRANSLATE_BUTTON_CONTAINER_ID = 'tab-translation-subtitles-translate-button-container'
export const HIDE_NATIVE_CAPTIONS_STYLE_ID = 'tab-translation-hide-native-captions'

// Class names
export const SUBTITLES_VIEW_CLASS = 'tab-translation-subtitles-view'
export const STATE_MESSAGE_CLASS = 'tab-translation-subtitles-state-message'
export const TRANSLATE_BUTTON_CLASS = 'tab-translation-subtitles-translate-button'

// YouTube specific
export const YOUTUBE_WATCH_URL_PATTERN = 'youtube.com/watch'
export const YOUTUBE_NAVIGATE_EVENT = 'yt-navigate-finish'
export const SUBTITLE_INTERCEPT_MESSAGE_TYPE = 'WXT_YT_SUBTITLE_INTERCEPT'
export const YOUTUBE_NATIVE_SUBTITLES_CLASS = '.ytp-caption-window-container'
