import type { LanguageModel } from 'ai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'

// 写死的 API 配置
const HARDCODED_BASE_URL = 'https://api.example.com/v1'
const HARDCODED_API_KEY = ''

// 翻译使用较轻量的模型
const TRANSLATE_MODEL = 'gpt-4.1-nano'

// 创建固定的 provider 实例
const hardcodedProvider = createOpenAICompatible({
  name: 'sankuai',
  baseURL: HARDCODED_BASE_URL,
  apiKey: HARDCODED_API_KEY,
})

export async function getTranslateModelById(_providerId: string) {
  return hardcodedProvider.languageModel(TRANSLATE_MODEL) as LanguageModel
}
