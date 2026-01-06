import type { PageTranslateRange } from '@/types/config/translate'
import { i18n } from '#imports'
import { deepmerge } from 'deepmerge-ts'
import { useAtom } from 'jotai'
import { Field, FieldLabel } from '@/components/shadcn/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/select'
import { pageTranslateRangeSchema } from '@/types/config/translate'
import { configFieldsAtomMap } from '@/utils/atoms/config'
import { ConfigCard } from '../../components/config-card'

export default function TranslationConfig() {
  return (
    <ConfigCard title={i18n.t('options.general.translationConfig.title')} description={i18n.t('options.general.translationConfig.description')}>
      <div className="space-y-4">
        <RangeSelector />
      </div>
    </ConfigCard>
  )
}

function RangeSelector() {
  const [translateConfig, setTranslateConfig] = useAtom(configFieldsAtomMap.translate)
  return (
    <Field>
      <FieldLabel htmlFor="translateRange">
        {i18n.t('options.general.translationConfig.translateRange.title')}
      </FieldLabel>
      <Select
        value={translateConfig.page.range}
        onValueChange={(value: PageTranslateRange) =>
          setTranslateConfig(
            deepmerge(translateConfig, { page: { range: value } }),
          )}
      >
        <SelectTrigger className="w-full">
          <SelectValue asChild>
            <span id="translateRange">
              {i18n.t(
                `options.general.translationConfig.translateRange.range.${translateConfig.page.range}`,
              )}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {pageTranslateRangeSchema.options.map(range => (
              <SelectItem key={range} value={range}>
                {i18n.t(
                  `options.general.translationConfig.translateRange.range.${range}`,
                )}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  )
}
