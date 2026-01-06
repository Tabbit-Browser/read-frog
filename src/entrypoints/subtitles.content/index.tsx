import { defineContentScript } from '#imports'
import { getLocalConfig } from '@/utils/config/storage'
import { initYoutubeSubtitles } from './init-youtube-subtitles'

declare global {
  interface Window {
    __TAB_TRANSLATION_SUBTITLES_INJECTED__?: boolean
  }
}

export default defineContentScript({
  matches: ['*://*.youtube.com/*'],
  cssInjectionMode: 'manifest',
  async main() {
    if (window.__TAB_TRANSLATION_SUBTITLES_INJECTED__)
      return
    window.__TAB_TRANSLATION_SUBTITLES_INJECTED__ = true

    const config = await getLocalConfig()
    if (!config?.betaExperience.enabled || !config?.videoSubtitles?.enabled) {
      return
    }

    initYoutubeSubtitles()
  },
})
