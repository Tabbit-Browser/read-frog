import { z } from 'zod'

import { langCodeISO6393Schema, langLevel } from '@/utils/constants/definitions'
import { translateConfigSchema } from './translate'
// Language schema
const languageSchema = z.object({
  sourceCode: langCodeISO6393Schema.or(z.literal('auto')),
  targetCode: langCodeISO6393Schema,
  level: langLevel,
})

// Text selection button schema
const selectionToolbarSchema = z.object({
  enabled: z.boolean(),
  disabledSelectionToolbarPatterns: z.array(z.string()),
})

// beta experience schema
const betaExperienceSchema = z.object({
  enabled: z.boolean(),
})

// context menu schema
const contextMenuSchema = z.object({
  enabled: z.boolean(),
})

// video subtitles schema
const videoSubtitlesSchema = z.object({
  enabled: z.boolean(),
})

// Complete config schema
export const configSchema = z.object({
  language: languageSchema,
  translate: translateConfigSchema,
  selectionToolbar: selectionToolbarSchema,
  betaExperience: betaExperienceSchema,
  contextMenu: contextMenuSchema,
  videoSubtitles: videoSubtitlesSchema,
})

export type Config = z.infer<typeof configSchema>
