import { getTabHost } from '@/utils/instance-manager'

export interface CustomTranslateParams {
  input: string
  target_lang: string
  model?: string
  abortSignal?: AbortSignal
  isBatch?: boolean
}

export interface CustomTranslateEvent {
  event: string
  data: any
}

export async function* streamCustomTranslate(params: CustomTranslateParams) {
  const { input, target_lang, model = 'gpt-4.1-nano', abortSignal, isBatch = false } = params
  const tabHost = await getTabHost()

  const response = await fetch(`https://${tabHost}/proxy/v0/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input,
      target_lang,
      is_multi: isBatch,
      model,
    }),
    signal: abortSignal,
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('Response body is null')
  }

  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done)
        break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      let currentEvent = ''
      for (const line of lines) {
        const trimmedLine = line.trim()
        if (!trimmedLine)
          continue

        if (trimmedLine.startsWith('event:')) {
          currentEvent = trimmedLine.slice(6).trim()
        }
        else if (trimmedLine.startsWith('data:')) {
          const dataStr = trimmedLine.slice(5).trim()
          try {
            const data = JSON.parse(dataStr)
            if (currentEvent === 'message_chunk' && data.content) {
              yield data.content
            }
            else if (currentEvent === 'finish') {
              return
            }
          }
          catch (e) {
            console.error('Error parsing SSE data', e)
          }
        }
      }
    }
  }
  finally {
    reader.releaseLock()
  }
}
