import { useCallback, useRef, useState } from 'react'
import { translateTextViaPort } from '@/utils/host/translate/stream-via-port'

export function useCustomTranslate() {
  const [translatedText, setTranslatedText] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const translate = useCallback(async (input: string, targetLang: string) => {
    // Abort previous translation if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    setIsTranslating(true)
    setError(null)
    setTranslatedText('')

    try {
      await translateTextViaPort(
        {
          input,
          targetLang,
        },
        {
          signal: abortController.signal,
          onChunk: (_, fullText) => {
            setTranslatedText(fullText)
          },
        },
      )
    }
    catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      setError(err instanceof Error ? err : new Error('Translation failed'))
    }
    finally {
      if (abortControllerRef.current === abortController) {
        setIsTranslating(false)
        abortControllerRef.current = null
      }
    }
  }, [])

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsTranslating(false)
  }, [])

  return {
    translatedText,
    isTranslating,
    error,
    translate,
    cancel,
  }
}
