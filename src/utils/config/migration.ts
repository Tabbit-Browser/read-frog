import type { MigrationFunction } from './migration-scripts/types'
import type { Config } from '@/types/config/config'
import { i18n } from '#imports'
import { configSchema } from '@/types/config/config'
import { CONFIG_SCHEMA_VERSION } from '../constants/config'
import { ConfigVersionTooNewError } from './errors'

export const LATEST_SCHEMA_VERSION = CONFIG_SCHEMA_VERSION

// when use `"type": "module"` to change the output format of background script to `esm`
// we can't use dynamic import here, so we have to use static import
// https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/basics
export const migrationScripts: Record<number, MigrationFunction> = {
}

export async function runMigration(version: number, config: any): Promise<any> {
  const migrationFn = migrationScripts[version]

  if (!migrationFn) {
    throw new Error(`Migration function for version ${version} not found`)
  }

  return migrationFn(config)
}

export async function migrateConfig(originalConfig: unknown, originalConfigSchemaVersion: number): Promise<Config> {
  if (originalConfigSchemaVersion > CONFIG_SCHEMA_VERSION) {
    throw new ConfigVersionTooNewError(i18n.t('options.config.sync.versionTooNew'))
  }

  if (originalConfigSchemaVersion < CONFIG_SCHEMA_VERSION) {
    let currentVersion = originalConfigSchemaVersion
    while (currentVersion < CONFIG_SCHEMA_VERSION) {
      const nextVersion = currentVersion + 1
      originalConfig = await runMigration(nextVersion, originalConfig)
      currentVersion = nextVersion
    }
  }

  const parseResult = configSchema.safeParse(originalConfig)
  if (!parseResult.success) {
    throw new Error(`${i18n.t('options.config.sync.validationError')}: ${parseResult.error.message}`)
  }

  return parseResult.data
}
