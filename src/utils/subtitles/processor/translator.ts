import type { SubtitlesFragment } from '../types'
import type { Config } from '@/types/config/config'
import { getLocalConfig } from '@/utils/config/storage'
import { Sha256Hex } from '@/utils/hash'
import { buildHashComponents } from '@/utils/host/translate/translate-text'
import { sendMessage } from '@/utils/message'

async function translateSingleSubtitle(
  text: string,
  langConfig: Config['language'],
): Promise<string> {
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

export async function translateSubtitles(
  fragments: SubtitlesFragment[],
): Promise<SubtitlesFragment[]> {
  const config = await getLocalConfig()
  if (!config) {
    return fragments.map(f => ({ ...f, translation: '' }))
  }

  const langConfig = config.language

  const translationPromises = fragments.map(fragment =>
    translateSingleSubtitle(fragment.text, langConfig),
  )

  const translations = await Promise.all(translationPromises)

  return fragments.map((fragment, index) => ({
    ...fragment,
    translation: translations[index],
  }))
}
