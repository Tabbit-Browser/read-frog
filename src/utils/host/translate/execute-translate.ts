import type { Config } from '@/types/config/config'
import { LANG_CODE_TO_EN_NAME } from '@/utils/constants/definitions'
import { streamCustomTranslate } from './custom-stream'

export async function executeTranslate(
  text: string,
  langConfig: Config['language'],
  options?: {
    forceBackgroundFetch?: boolean
    isBatch?: boolean
  },
) {
  const cleanText = text.replace(/\u200B/g, '').trim()
  if (cleanText === '') {
    return ''
  }

  // 使用 streamCustomTranslate 进行翻译
  const targetLangName = LANG_CODE_TO_EN_NAME[langConfig.targetCode]

  let translatedText = ''
  for await (const chunk of streamCustomTranslate({
    input: cleanText,
    target_lang: targetLangName,
    isBatch: options?.isBatch,
  })) {
    translatedText += chunk
  }

  return translatedText.trim()
}
