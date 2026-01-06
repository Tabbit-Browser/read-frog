import { i18n } from '#imports'
import { ConfigCard } from '../../components/config-card'

export function ReadConfig() {
  return (
    <ConfigCard title={i18n.t('options.general.readConfig.title')} description={i18n.t('options.general.readConfig.description')}>
      <div className="flex flex-col gap-4 text-sm text-muted-foreground">
        {/* 已使用固定的 API 配置 */}
        <p>使用内置 AI 服务</p>
      </div>
    </ConfigCard>
  )
}
