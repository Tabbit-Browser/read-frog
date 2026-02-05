import type { MigrationFunction } from './types'

/**
 * Migration v1 -> v2
 * Reset selectionToolbar.enabled to false for existing users
 */
export const migrate: MigrationFunction = (oldConfig) => {
  return {
    ...oldConfig,
    selectionToolbar: {
      ...oldConfig.selectionToolbar,
      enabled: false,
    },
  }
}
