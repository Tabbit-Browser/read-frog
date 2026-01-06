import type { Config } from '@/types/config/config'
import type { ConfigMeta } from '@/types/config/meta'
import { storage } from '#imports'
import { configSchema } from '@/types/config/config'
import { CONFIG_SCHEMA_VERSION, CONFIG_STORAGE_KEY, DEFAULT_CONFIG } from '../constants/config'
import { logger } from '../logger'
import { runMigration } from './migration'

/**
 * Initialize the config, this function should only be called once in the background script
 * @returns The extension config
 */
export async function initializeConfig() {
  const [storedConfig, configMeta] = await Promise.all([
    storage.getItem<Config>(`local:${CONFIG_STORAGE_KEY}`),
    storage.getMeta<ConfigMeta>(`local:${CONFIG_STORAGE_KEY}`),
  ])

  let config: Config | null = storedConfig
  let currentVersion = configMeta?.schemaVersion ?? 1

  if (!config) {
    config = DEFAULT_CONFIG
    currentVersion = CONFIG_SCHEMA_VERSION
  }

  while (currentVersion < CONFIG_SCHEMA_VERSION) {
    const nextVersion = currentVersion + 1
    try {
      config = await runMigration(nextVersion, config)
      currentVersion = nextVersion
    }
    catch (error) {
      console.error(`Migration to version ${nextVersion} failed:`, error)
      currentVersion = nextVersion
    }
  }

  if (!configSchema.safeParse(config).success) {
    logger.warn('Config is invalid, using default config')
    config = DEFAULT_CONFIG
    currentVersion = CONFIG_SCHEMA_VERSION
  }

  // Save config and update meta with schemaVersion
  const updatedMeta = await storage.getMeta<Partial<ConfigMeta>>(`local:${CONFIG_STORAGE_KEY}`)
  await storage.setItem<Config>(`local:${CONFIG_STORAGE_KEY}`, config)
  await storage.setMeta<ConfigMeta>(`local:${CONFIG_STORAGE_KEY}`, {
    schemaVersion: currentVersion,
    lastModifiedAt: updatedMeta?.lastModifiedAt ?? Date.now(),
  })

  if (import.meta.env.DEV) {
    await enableBetaExperience()
  }
}

async function enableBetaExperience() {
  const config = await storage.getItem<Config>(`local:${CONFIG_STORAGE_KEY}`)
  if (!config) {
    return
  }
  config.betaExperience.enabled = true
  await storage.setItem(`local:${CONFIG_STORAGE_KEY}`, config)
}
