// Token names for prompt templates
export const TARGET_LANG = 'TARGET_LANG'
export const INPUT = 'INPUT'

// Batch translation separator
export const BATCH_SEPARATOR = '%%'

// Helper function to wrap token names in template syntax
export function getTokenCellText(token: string): string {
  return `{{${token}}}`
}

// Default system prompt for translation
export const DEFAULT_TRANSLATE_SYSTEM_PROMPT = `You are a professional translator. Translate the given text to {{TARGET_LANG}}.

Rules:
- Translate accurately and naturally, maintaining the original meaning
- Keep the original formatting (paragraphs, punctuation, etc.)
- Do NOT include any explanations or notes
- Return ONLY the translated text`

// Default user prompt for translation
export const DEFAULT_TRANSLATE_PROMPT = `{{INPUT}}`

// Additional instructions for batch translation mode
export const DEFAULT_BATCH_TRANSLATE_PROMPT = `Batch Translation Rules:
- The input contains multiple text segments separated by newlines
- Translate each segment separately
- Preserve the original line breaks and segment structure
- Return all translated segments in the same order`
