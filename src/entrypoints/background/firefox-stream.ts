import { streamCustomTranslate } from '@/utils/host/translate/custom-stream'
import { logger } from '@/utils/logger'

export interface TranslateStreamParams {
  input: string
  targetLang: string
  model?: string
  isBatch?: boolean
}

export interface StreamOptions {
  signal?: AbortSignal
  onChunk?: (chunk: string, fullResponse: string) => void
}

interface StreamPortResponse {
  type: 'chunk' | 'done' | 'error'
  data?: string
  error?: string
}

interface ExtensionPort {
  name: string
  postMessage: (message: StreamPortResponse) => void
  disconnect: () => void
  onMessage: {
    addListener: (listener: (message: unknown) => void) => void
    removeListener: (listener: (message: unknown) => void) => void
  }
  onDisconnect: {
    addListener: (listener: () => void) => void
    removeListener: (listener: () => void) => void
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'Unexpected error occurred'
}

function createStreamPortHandler<TMessage, TPayload>(
  streamFn: (payload: TPayload, options: StreamOptions) => Promise<string>,
  messageValidator: (msg: unknown) => msg is TMessage & { payload: TPayload },
) {
  return (port: ExtensionPort) => {
    const abortController = new AbortController()
    let isActive = true
    let hasStarted = false
    let messageListener: ((rawMessage: unknown) => void) | undefined
    let disconnectListener: (() => void) | undefined

    const safePost = (response: StreamPortResponse) => {
      if (!isActive || abortController.signal.aborted) {
        return
      }
      try {
        port.postMessage(response)
      }
      catch (error) {
        logger.error('[Background] Stream port post failed', error)
      }
    }

    const cleanup = () => {
      if (!isActive) {
        return
      }
      isActive = false
      if (messageListener) {
        port.onMessage.removeListener(messageListener)
      }
      if (disconnectListener) {
        port.onDisconnect.removeListener(disconnectListener)
      }
    }

    disconnectListener = () => {
      abortController.abort()
      cleanup()
    }

    messageListener = async (rawMessage: unknown) => {
      if (hasStarted) {
        return
      }

      if (!messageValidator(rawMessage)) {
        return
      }

      hasStarted = true

      try {
        const result = await streamFn(rawMessage.payload, {
          signal: abortController.signal,
          onChunk: (_, fullResponse) => {
            safePost({ type: 'chunk', data: fullResponse })
          },
        })

        if (!abortController.signal.aborted) {
          safePost({ type: 'done', data: result })
        }
      }
      catch (error) {
        if (!abortController.signal.aborted) {
          safePost({ type: 'error', error: getErrorMessage(error) })
        }
      }
      finally {
        cleanup()
        try {
          port.disconnect()
        }
        catch {
          // Ignore disconnect errors in Firefox
        }
      }
    }

    port.onMessage.addListener(messageListener)
    port.onDisconnect.addListener(disconnectListener)
  }
}

export async function runTranslateLLMStream(
  params: TranslateStreamParams,
  options: StreamOptions = {},
) {
  const { input, targetLang, model, isBatch } = params
  const { signal, onChunk } = options

  logger.info('[Background] runTranslateLLMStream called', { input: input.slice(0, 50), targetLang })

  if (signal?.aborted) {
    throw new DOMException('stream aborted', 'AbortError')
  }

  const stream = streamCustomTranslate({
    input,
    target_lang: targetLang,
    model,
    abortSignal: signal,
    isBatch,
  })

  let fullText = ''

  for await (const chunk of stream) {
    if (signal?.aborted) {
      throw new DOMException('stream aborted', 'AbortError')
    }

    fullText += chunk
    onChunk?.(chunk, fullText)
  }

  return fullText
}

export const handleTranslateStreamPort = createStreamPortHandler<
  { type: 'start', payload: TranslateStreamParams },
  TranslateStreamParams
>(
  runTranslateLLMStream,
  (msg): msg is { type: 'start', payload: TranslateStreamParams } => {
    const message = msg as { type: 'start', payload: TranslateStreamParams }
    return message?.type === 'start' && !!message.payload
  },
)
