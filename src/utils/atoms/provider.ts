import { atom } from 'jotai'

// Translation provider configuration is now managed internally
// and is no longer part of the user-facing config object.

export const translateProviderConfigAtom = atom(
  () => {
    return {
      id: 'hardcoded',
      name: 'Hardcoded AI',
      enabled: true,
      provider: 'openai', // Placeholder
    }
  },
  async () => {
    // No-op: user can no longer update provider config
  },
)
