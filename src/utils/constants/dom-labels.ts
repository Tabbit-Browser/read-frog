export const CONTENT_WRAPPER_CLASS = 'tab-translation-translated-content-wrapper'
export const INLINE_CONTENT_CLASS = 'tab-translation-translated-inline-content'
export const BLOCK_CONTENT_CLASS = 'tab-translation-translated-block-content'

export const WALKED_ATTRIBUTE = 'data-tab-translation-walked'
// paragraph means you need to trigger translation on this element (i.e. we have inline children in it)
export const PARAGRAPH_ATTRIBUTE = 'data-tab-translation-paragraph'
export const BLOCK_ATTRIBUTE = 'data-tab-translation-block-node'
export const INLINE_ATTRIBUTE = 'data-tab-translation-inline-node'

export const TRANSLATION_MODE_ATTRIBUTE = 'data-tab-translation-translation-mode'

export const MARK_ATTRIBUTES = new Set([WALKED_ATTRIBUTE, PARAGRAPH_ATTRIBUTE, BLOCK_ATTRIBUTE, INLINE_ATTRIBUTE])

export const NOTRANSLATE_CLASS = 'notranslate'

export const REACT_SHADOW_HOST_CLASS = 'tab-translation-react-shadow-host'

export const TRANSLATION_ERROR_CONTAINER_CLASS = 'tab-translation-translation-error-container'
