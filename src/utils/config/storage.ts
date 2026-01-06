import type { Config } from '@/types/config/config'
import { storage } from '#imports'
import { configSchema } from '@/types/config/config'
import { CONFIG_STORAGE_KEY, DEFAULT_CONFIG } from '../constants/config'
import { logger } from '../logger'

export async function getLocalConfig() {
  const config = await storage.getItem<Config>(`local:${CONFIG_STORAGE_KEY}`)
  if (!config) {
    logger.warn('No config found in storage')
    return null
  }
  const parsedConfig = configSchema.safeParse(config)
  if (!parsedConfig.success) {
    logger.error('Config is invalid, using default config')
    return DEFAULT_CONFIG
  }
  return parsedConfig.data
}
