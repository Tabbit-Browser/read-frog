import { Icon } from '@iconify/react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { useCustomTranslate } from '@/hooks/use-custom-translate'
import { configFieldsAtomMap } from '@/utils/atoms/config'
import { LANG_CODE_TO_EN_NAME } from '@/utils/constants/definitions'
import {
  isSelectionToolbarVisibleAtom,
  isTranslatePopoverVisibleAtom,
  mouseClickPositionAtom,
  selectionContentAtom,
} from './atom'
import { PopoverWrapper } from './components/popover-wrapper'

export function TranslateButton() {
  const setIsSelectionToolbarVisible = useSetAtom(isSelectionToolbarVisibleAtom)
  const setIsTranslatePopoverVisible = useSetAtom(isTranslatePopoverVisibleAtom)
  const setMousePosition = useSetAtom(mouseClickPositionAtom)

  const handleClick = async (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = rect.left
    const y = rect.top

    setMousePosition({ x, y })
    setIsSelectionToolbarVisible(false)
    setIsTranslatePopoverVisible(true)
  }

  return (
    <button
      type="button"
      className="size-6 flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-700 cursor-pointer"
      onClick={handleClick}
    >
      <Icon icon="ri:translate" strokeWidth={0.8} className="size-4" />
    </button>
  )
}

export function TranslatePopover() {
  const languageConfig = useAtomValue(configFieldsAtomMap.language)
  const selectionContent = useAtomValue(selectionContentAtom)
  const [isVisible, setIsVisible] = useAtom(isTranslatePopoverVisibleAtom)

  const {
    translatedText,
    isTranslating,
    error,
    translate,
    cancel,
  } = useCustomTranslate()

  const handleClose = useCallback(() => {
    cancel()
  }, [cancel])

  const handleCopy = useCallback(() => {
    if (translatedText) {
      void navigator.clipboard.writeText(translatedText)
      toast.success('Translation copied to clipboard!')
    }
  }, [translatedText])

  useEffect(() => {
    if (isVisible && selectionContent) {
      const cleanText = selectionContent.replace(/\u200B/g, '').trim()
      if (cleanText) {
        const targetLangName = LANG_CODE_TO_EN_NAME[languageConfig.targetCode]
        void translate(cleanText, targetLangName)
      }
    }
    else {
      cancel()
    }
  }, [isVisible, selectionContent, languageConfig.targetCode, translate, cancel])

  useEffect(() => {
    if (error) {
      console.error('Translation error:', error)
      toast.error('Translation failed')
    }
  }, [error])

  return (
    <PopoverWrapper
      title="Translation"
      icon="ri:translate"
      onClose={handleClose}
      isVisible={isVisible}
      setIsVisible={setIsVisible}
    >
      <div className="p-4 border-b">
        <div className="border-b pb-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{selectionContent}</p>
        </div>
        <div className="pt-4">
          <p className="text-sm">
            {isTranslating && !translatedText && <Icon icon="svg-spinners:3-dots-bounce" />}
            {translatedText}
            {isTranslating && translatedText && ' ●'}
          </p>
        </div>
      </div>
      <div className="p-4 flex justify-end items-center">
        <button
          type="button"
          onClick={handleCopy}
          className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded"
        >
          <Icon
            icon="tabler:copy"
            strokeWidth={1}
            className="size-4 text-zinc-600 dark:text-zinc-400"
          />
        </button>
      </div>
    </PopoverWrapper>
  )
}
