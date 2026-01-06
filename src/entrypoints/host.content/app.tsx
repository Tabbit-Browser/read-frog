import TabTranslationToast from '@/components/tab-translation-toast'
import { NOTRANSLATE_CLASS } from '@/utils/constants/dom-labels'

export default function App() {
  return (
    <div className={NOTRANSLATE_CLASS}>
      <TabTranslationToast />
    </div>
  )
}
