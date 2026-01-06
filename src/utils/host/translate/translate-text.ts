import type { Config } from '@/types/config/config'
import type { LangCodeISO6393 } from '@/utils/constants/definitions'
import { i18n } from '#imports'
import { franc } from 'franc-min'
import { toast } from 'sonner'
import { LANG_CODE_TO_LOCALE_NAME } from '@/utils/constants/definitions'
import { logger } from '@/utils/logger'
import { getLocalConfig } from '../../config/storage'
import { Sha256Hex } from '../../hash'
import { sendMessage } from '../../message'

const MIN_LENGTH_FOR_LANG_DETECTION = 50

export function buildHashComponents(
  text: string,
  partialLangConfig: { sourceCode: LangCodeISO6393 | 'auto', targetCode: LangCodeISO6393 },
): string[] {
  return [
    text,
    partialLangConfig.sourceCode,
    partialLangConfig.targetCode,
  ]
}

export async function translateText(text: string) {
  const config = await getLocalConfig()
  if (!config) {
    throw new Error('No global config when translate text')
  }

  const langConfig = config.language

  // Skip translation if text is already in target language
  if (text.length >= MIN_LENGTH_FOR_LANG_DETECTION) {
    const detectedLang = franc(text)
    if (detectedLang === langConfig.targetCode) {
      logger.info(`translateText: skipping translation because text is already in target language. text: ${text}`)
      return ''
    }
  }

  const hashComponents = buildHashComponents(
    text,
    { sourceCode: langConfig.sourceCode, targetCode: langConfig.targetCode },
  )

  return await sendMessage('enqueueTranslateRequest', {
    text,
    langConfig,
    scheduleAt: Date.now(),
    hash: Sha256Hex(...hashComponents),
  })
}

export function validateTranslationConfigAndToast(
  config: Pick<Config, 'translate' | 'language'>,
  detectedCode: LangCodeISO6393,
): boolean {
  const { language: languageConfig } = config

  if (languageConfig.sourceCode === languageConfig.targetCode) {
    toast.error(i18n.t('translation.sameLanguage'))
    logger.info('validateTranslationConfig: returning false (same language)')
    return false
  }
  else if (languageConfig.sourceCode === 'auto' && detectedCode === languageConfig.targetCode) {
    toast.warning(i18n.t('translation.autoModeSameLanguage', [
      LANG_CODE_TO_LOCALE_NAME[detectedCode] ?? detectedCode,
    ]))
  }

  return true
}
