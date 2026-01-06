import { browser, defineBackground } from '#imports'
import { logger } from '@/utils/logger'
import { onMessage } from '@/utils/message'
import { ensureInitializedConfig } from './config'
import { setUpConfigBackup } from './config-backup'
import { initializeContextMenu, registerContextMenuListeners } from './context-menu'
import { cleanupAllTranslationCache, setUpDatabaseCleanup } from './db-cleanup'
import { handleTranslateStreamPort } from './firefox-stream'
import { setupIframeInjection } from './iframe-injection'
import { proxyFetch } from './proxy-fetch'
import { setUpRequestQueue } from './translation-queues'
import { translationMessage } from './translation-signal'

export default defineBackground({
  type: 'module',
  main: () => {
    logger.info('Hello background!', { id: browser.runtime.id })

    browser.runtime.onInstalled.addListener(async () => {
      await ensureInitializedConfig()
    })

    onMessage('openPage', async (message) => {
      const { url, active } = message.data
      logger.info('openPage', { url, active })
      await browser.tabs.create({ url, active: active ?? true })
    })

    onMessage('openOptionsPage', () => {
      logger.info('openOptionsPage')
      void browser.runtime.openOptionsPage()
    })

    browser.runtime.onConnect.addListener((port) => {
      if (port.name === 'translate-text-stream') {
        handleTranslateStreamPort(port)
      }
    })

    onMessage('clearAllTranslationRelatedCache', async () => {
      await cleanupAllTranslationCache()
    })

    translationMessage()

    // Register context menu listeners synchronously
    // This ensures listeners are registered before Chrome completes initialization
    registerContextMenuListeners()

    // Initialize context menu items asynchronously
    void initializeContextMenu()

    void setUpRequestQueue()
    void setUpDatabaseCleanup()
    setUpConfigBackup()

    proxyFetch()

    // Setup programmatic injection for iframes that Chrome's manifest-based all_frames misses
    setupIframeInjection()
  },
})
