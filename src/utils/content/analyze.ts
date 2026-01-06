import type { LangCodeISO6393 } from '@/utils/constants/definitions'
import { Readability } from '@mozilla/readability'
import { franc } from 'franc-min'
import { logger } from '../logger'
import { cleanText, removeDummyNodes } from './utils'

export type DetectionSource = 'franc' | 'fallback'

export async function getDocumentInfo(): Promise<{
  article: ReturnType<Readability<Node>['parse']>
  detectedCodeOrUnd: LangCodeISO6393 | 'und'
  detectionSource: DetectionSource
}> {
  const documentClone = document.cloneNode(true)
  await removeDummyNodes(documentClone as Document)
  const article = new Readability(documentClone as Document, {
    serializer: el => el,
  }).parse()

  logger.info('article', article)

  let detectedCodeOrUnd: LangCodeISO6393 | 'und' = 'und'
  let detectionSource: DetectionSource = 'fallback'

  // Use franc for language detection
  const francInput = cleanText(`${article?.title || ''} ${article?.textContent || ''}`, Infinity)
  if (francInput) {
    const francResult = franc(francInput)
    logger.info('franc result', francResult)

    detectedCodeOrUnd = francResult === 'und'
      ? 'und'
      : (francResult as LangCodeISO6393)
    detectionSource = francResult === 'und' ? 'fallback' : 'franc'
    logger.info(`Language detected by franc: ${francResult}`)
  }

  logger.info('final detectionSource', detectionSource)
  logger.info('final detectedCodeOrUnd', detectedCodeOrUnd)

  return {
    article,
    detectedCodeOrUnd,
    detectionSource,
  }
}
