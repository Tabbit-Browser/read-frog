import type { MigrationFunction } from './types'

/**
 * Migration v2 -> v3
 * Reset translate.node.enabled to false for existing users
 */
export const migrate: MigrationFunction = (oldConfig) => {
  return {
    ...oldConfig,
    translate: {
      ...oldConfig.translate,
      node: {
        ...oldConfig.translate?.node,
        enabled: false,
      },
    },
  }
}
