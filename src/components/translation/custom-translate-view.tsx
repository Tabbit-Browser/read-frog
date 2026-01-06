import { Icon } from '@iconify/react'
import { useEffect, useState } from 'react'
import { streamCustomTranslate } from '@/utils/host/translate/custom-stream'

interface CustomTranslateViewProps {
  input: string
  targetLang: string
  className?: string
  onFinish?: (fullText: string) => void
}

export function CustomTranslateView({
  input,
  targetLang,
  className = '',
  onFinish,
}: CustomTranslateViewProps) {
  const [translatedText, setTranslatedText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const abortController = new AbortController()

    const translate = async () => {
      if (!input.trim())
        return

      setIsLoading(true)
      setError(null)
      setTranslatedText('')

      try {
        const stream = streamCustomTranslate({
          input,
          target_lang: targetLang,
          abortSignal: abortController.signal,
        })

        let fullText = ''
        for await (const chunk of stream) {
          if (!isMounted)
            break
          fullText += chunk
          setTranslatedText(fullText)
        }

        if (isMounted) {
          onFinish?.(fullText)
        }
      }
      catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
        if (isMounted) {
          console.error('Custom translate error:', err)
          setError(err instanceof Error ? err.message : 'Translation failed')
        }
      }
      finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void translate()

    return () => {
      isMounted = false
      abortController.abort()
    }
  }, [input, targetLang])

  if (error) {
    return (
      <div className={`text-red-500 text-sm p-2 ${className}`}>
        Error:
        {' '}
        {error}
      </div>
    )
  }

  return (
    <div className={className}>
      <p className="text-sm">
        {isLoading && !translatedText && (
          <Icon icon="svg-spinners:3-dots-bounce" className="inline-block" />
        )}
        {translatedText}
        {isLoading && translatedText && <span className="animate-pulse ml-1">●</span>}
      </p>
    </div>
  )
}
