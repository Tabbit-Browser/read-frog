import type { ChromeThemeColors } from '@/utils/tab-theme-api'
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

    // Handle theme color requests from content scripts
    onMessage('getTabThemeColors', async () => {
      // @ts-expect-error - tabThemeColor is a custom Chrome API
      if (typeof chrome === 'undefined' || !chrome.tabThemeColor) {
        logger.warn('[Background] tabThemeColor API not available')
        return null
      }

      return new Promise<ChromeThemeColors | null>((resolve) => {
        try {
          // @ts-expect-error - tabThemeColor is a custom Chrome API
          chrome.tabThemeColor.getUserColor((colors: ChromeThemeColors) => {
            logger.info('[Background] getUserColor result:', colors)
            // 这是一个不得已的骚操作，如果是灰色主题，强制转换成橙色的
            if (colors.user_color?.value === -6645094) {
              colors.user_color.value = -810932
            }
            resolve(colors)
          })
        }
        catch (error) {
          logger.error('[Background] getUserColor error:', error)
          resolve(null)
        }
      })
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
