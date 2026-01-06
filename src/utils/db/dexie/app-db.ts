import type { EntityTable } from 'dexie'
import { upperCamelCase } from 'case-anything'
import Dexie from 'dexie'
import { APP_NAME } from '@/utils/constants/app'
import ArticleSummaryCache from './tables/article-summary-cache'
import TranslationCache from './tables/translation-cache'

export default class AppDB extends Dexie {
  translationCache!: EntityTable<
    TranslationCache,
    'key'
  >

  articleSummaryCache!: EntityTable<
    ArticleSummaryCache,
    'key'
  >

  constructor() {
    super(`${upperCamelCase(APP_NAME)}DB`)
    this.version(1).stores({
      translationCache: `
        key,
        translation,
        createdAt`,
    })
    this.version(2).stores({
      translationCache: `
        key,
        translation,
        createdAt`,
      batchRequestRecord: `
        key,
        createdAt,
        originalRequestCount,
        provider,
        model`,
    })
    this.version(3).stores({
      translationCache: `
        key,
        translation,
        createdAt`,
      batchRequestRecord: `
        key,
        createdAt,
        originalRequestCount,
        provider,
        model`,
      articleSummaryCache: `
        key,
        createdAt`,
    })
    this.translationCache.mapToClass(TranslationCache)
    this.articleSummaryCache.mapToClass(ArticleSummaryCache)
  }
}
