import type { TranslationMode as TranslationModeType } from '@/types/config/translate'
import { i18n } from '#imports'
import { Icon } from '@iconify/react'
import { deepmerge } from 'deepmerge-ts'
import { useAtom } from 'jotai'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/shadcn/tooltip'
import { TRANSLATION_MODES } from '@/types/config/translate'
import { configFieldsAtomMap } from '@/utils/atoms/config'

export default function TranslationModeSelector() {
  const [translateConfig, setTranslateConfig] = useAtom(configFieldsAtomMap.translate)
  const currentMode = translateConfig.mode

  const handleModeChange = (mode: TranslationModeType) => {
    void setTranslateConfig(
      deepmerge(translateConfig, { mode }),
    )
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[13px] font-medium flex items-center gap-1.5">
        {i18n.t('options.translation.translationMode.title')}
        <Tooltip>
          <TooltipTrigger asChild>
            <Icon icon="tabler:help" className="size-3 text-blue-300 dark:text-blue-700/70" />
          </TooltipTrigger>
          <TooltipContent className="w-36">
            <p>
              {i18n.t('options.translation.translationMode.description')}
            </p>
          </TooltipContent>
        </Tooltip>
      </span>
      <Select
        value={currentMode}
        onValueChange={handleModeChange}
      >
        <SelectTrigger className="h-7! w-31 pr-1.5 pl-2.5">
          <SelectValue asChild>
            <span>
              {i18n.t(`options.translation.translationMode.mode.${currentMode}`)}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {TRANSLATION_MODES.map(mode => (
              <SelectItem key={mode} value={mode}>
                {i18n.t(`options.translation.translationMode.mode.${mode}`)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
