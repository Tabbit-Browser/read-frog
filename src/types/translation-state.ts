import { z } from 'zod'

export const translationStateSchema = z.object({
  enabled: z.boolean(),
  url: z.string().optional(),
})

export type TranslationState = z.infer<typeof translationStateSchema>
