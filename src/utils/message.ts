import type { Config } from '@/types/config/config'
import type { BatchQueueConfig, RequestQueueConfig } from '@/types/config/translate'
import type { ProxyRequest, ProxyResponse } from '@/types/proxy-fetch'
import type { LangCodeISO6393 } from '@/utils/constants/definitions'
import type { ChromeThemeColors } from '@/utils/tab-theme-api'
import { defineExtensionMessaging } from '@webext-core/messaging'

interface ProtocolMap {
  // navigation
  openPage: (data: { url: string, active?: boolean }) => void
  openOptionsPage: () => void
  // translation state
  getEnablePageTranslationByTabId: (data: { tabId: number }) => boolean | undefined
  getEnablePageTranslationFromContentScript: () => Promise<boolean>
  tryToSetEnablePageTranslationByTabId: (data: { tabId: number, enabled: boolean }) => void
  tryToSetEnablePageTranslationOnContentScript: (data: { enabled: boolean }) => void
  setAndNotifyPageTranslationStateChangedByManager: (data: { enabled: boolean }) => void
  notifyTranslationStateChanged: (data: { enabled: boolean }) => void
  // for auto start page translation
  checkAndAskAutoPageTranslation: (data: { url: string, detectedCodeOrUnd: LangCodeISO6393 | 'und' }) => void
  // ask host to start page translation
  askManagerToTogglePageTranslation: (data: { enabled: boolean }) => void
  // request
  enqueueTranslateRequest: (data: { text: string, langConfig: Config['language'], scheduleAt: number, hash: string }) => Promise<string>
  setTranslateRequestQueueConfig: (data: Partial<RequestQueueConfig>) => void
  setTranslateBatchQueueConfig: (data: Partial<BatchQueueConfig>) => void
  // network proxy
  backgroundFetch: (data: ProxyRequest) => Promise<ProxyResponse>
  // cache management
  clearAllTranslationRelatedCache: () => Promise<void>
  // theme colors (must be called from background)
  getTabThemeColors: () => ChromeThemeColors | null
}

export const { sendMessage, onMessage }
  = defineExtensionMessaging<ProtocolMap>()
