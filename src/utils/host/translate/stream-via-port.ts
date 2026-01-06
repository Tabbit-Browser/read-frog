import type { TranslateStreamParams } from '@/entrypoints/background/firefox-stream'
import { browser } from '#imports'
import { logger } from '@/utils/logger'

interface StreamPortResponse {
  type: 'chunk' | 'done' | 'error'
  data?: string
  error?: string
}

export interface StreamTranslateOptions {
  onChunk?: (chunk: string, fullText: string) => void
  signal?: AbortSignal
}

/**
 * Translate text via background port connection.
 * This is useful for Firefox where content scripts cannot directly fetch external APIs.
 */
export function translateTextViaPort(
  params: TranslateStreamParams,
  options: StreamTranslateOptions = {},
): Promise<string> {
  return new Promise((resolve, reject) => {
    const { onChunk, signal } = options

    logger.info('[translateTextViaPort] Starting translation via background port', params)

    if (signal?.aborted) {
      reject(new DOMException('stream aborted', 'AbortError'))
      return
    }

    // Connect to background port
    const port = browser.runtime.connect({ name: 'translate-text-stream' })
    logger.info('[translateTextViaPort] Connected to port')

    let fullText = ''

    // Handle abort
    const handleAbort = () => {
      port.disconnect()
      reject(new DOMException('stream aborted', 'AbortError'))
    }
    signal?.addEventListener('abort', handleAbort)

    const cleanup = () => {
      signal?.removeEventListener('abort', handleAbort)
    }

    // Handle disconnect
    port.onDisconnect.addListener(() => {
      cleanup()
    })

    // Listen for responses
    port.onMessage.addListener((response: StreamPortResponse) => {
      switch (response.type) {
        case 'chunk':
          if (response.data) {
            fullText = response.data
            onChunk?.(response.data, fullText)
          }
          break
        case 'done':
          cleanup()
          resolve(response.data ?? fullText)
          break
        case 'error':
          cleanup()
          reject(new Error(response.error ?? 'Unknown error'))
          break
      }
    })

    // Send start message
    port.postMessage({ type: 'start', payload: params })
  })
}
