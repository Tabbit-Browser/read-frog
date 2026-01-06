import { browser } from '#imports'
import { db } from '@/utils/db/dexie/db'
import { logger } from '@/utils/logger'

export const CHECK_INTERVAL_MINUTES = 24 * 60

export const TRANSLATION_CACHE_CLEANUP_ALARM = 'cache-cleanup'
export const TRANSLATION_CACHE_MAX_AGE_MINUTES = 7 * 24 * 60

export async function setUpDatabaseCleanup() {
  // Set up periodic alarms (only if they don't exist)
  const existingCacheAlarm = await browser.alarms.get(TRANSLATION_CACHE_CLEANUP_ALARM)
  if (!existingCacheAlarm) {
    void browser.alarms.create(TRANSLATION_CACHE_CLEANUP_ALARM, {
      delayInMinutes: 1,
      periodInMinutes: CHECK_INTERVAL_MINUTES,
    })
  }

  // Register the alarm listener
  browser.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === TRANSLATION_CACHE_CLEANUP_ALARM) {
      await cleanupOldTranslationCache()
    }
  })

  // Run cleanup immediately when background script starts
  cleanupOldTranslationCache().catch((error) => {
    logger.error('Failed to run initial cache cleanup:', error)
  })
}

async function cleanupOldTranslationCache() {
  try {
    const cutoffDate = new Date()
    cutoffDate.setTime(cutoffDate.getTime() - TRANSLATION_CACHE_MAX_AGE_MINUTES * 60 * 1000)

    // Delete all cache entries older than the cutoff date
    const deletedCount = await db.translationCache
      .where('createdAt')
      .below(cutoffDate)
      .delete()

    if (deletedCount > 0) {
      logger.info(`Cache cleanup: Deleted ${deletedCount} old translation cache entries`)
    }
  }
  catch (error) {
    logger.error('Failed to cleanup old cache:', error)
  }
}

export async function cleanupAllTranslationCache() {
  try {
    // Delete all translation cache entries
    await db.translationCache.clear()

    logger.info(`Cache cleanup: Deleted all translation cache entries`)
  }
  catch (error) {
    logger.error('Failed to cleanup all cache:', error)
    throw error
  }
}

export async function cleanupAllSummaryCache() {
  try {
    // Delete all article summary cache entries
    await db.articleSummaryCache.clear()

    logger.info(`Summary cache cleanup: Deleted all article summary cache entries`)
  }
  catch (error) {
    logger.error('Failed to cleanup all summary cache:', error)
    throw error
  }
}
