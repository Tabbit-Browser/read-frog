import { GeneralPage } from '../pages/general'
import { TranslationPage } from '../pages/translation'

export const ROUTE_CONFIG = [
  { path: '/', component: GeneralPage },
  { path: '/translation', component: TranslationPage },
] as const
