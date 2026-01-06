import { i18n } from '#imports'
import { PageLayout } from '../../components/page-layout'
import { ContextMenuTranslateToggle } from '../context-menu/context-menu-translate-toggle'
import { SelectionToolbarDisabledSites } from '../selection-toolbar/selection-toolbar-disabled-sites'
import { SelectionToolbarGlobalToggle } from '../selection-toolbar/selection-toolbar-global-toggle'
import TranslationConfig from './translation-config'

export function GeneralPage() {
  return (
    <PageLayout title={i18n.t('options.general.title')} innerClassName="*:border-b [&>*:last-child]:border-b-0">
      <TranslationConfig />
      <SelectionToolbarGlobalToggle />
      <SelectionToolbarDisabledSites />
      <ContextMenuTranslateToggle />
    </PageLayout>
  )
}
