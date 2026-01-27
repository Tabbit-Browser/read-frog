import { browser } from '#imports'
import { getTabHost } from '@/utils/instance-manager'

// 未登录错误，不应该重试
export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized: Please login first') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export interface CustomTranslateParams {
  input: string
  target_lang: string
  model?: string
  abortSignal?: AbortSignal
  isBatch?: boolean
}

// 用于防止并发打开多个登录页
let openingLoginPromise: Promise<void> | null = null

async function openLoginPageOnce(tabHost: string) {
  // 如果已有正在执行的请求，等待它完成即可
  if (openingLoginPromise) {
    return openingLoginPromise
  }

  openingLoginPromise = (async () => {
    const loginUrl = `https://${tabHost}/login?callback=close`

    // 查找是否已有该域名的标签页
    const existingTabs = await browser.tabs.query({ url: loginUrl })
    if (existingTabs.length > 0) {
      // 已有标签页，激活它
      await browser.tabs.update(existingTabs[0].id!, { active: true })
      return
    }

    // 没有则创建新的登录页
    await browser.tabs.create({ url: loginUrl, active: true })
  })()

  try {
    await openingLoginPromise
  }
  finally {
    openingLoginPromise = null
  }
}

export interface CustomTranslateEvent {
  event: string
  data: any
}

export async function* streamCustomTranslate(params: CustomTranslateParams) {
  // 如果正在打开登录页，直接失败，不发请求
  if (openingLoginPromise) {
    throw new UnauthorizedError()
  }

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
    if (response.status === 401) {
      await openLoginPageOnce(tabHost)
      throw new UnauthorizedError()
    }
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
