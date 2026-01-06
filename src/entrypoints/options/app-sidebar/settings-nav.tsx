import { i18n } from '#imports'
import { Icon } from '@iconify/react'
import { Link, useLocation } from 'react-router'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/shadcn/sidebar'

export function SettingsNav() {
  const { pathname } = useLocation()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{i18n.t('options.sidebar.settings')}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/'}>
              <Link to="/">
                <Icon icon="tabler:adjustments-horizontal" />
                <span>{i18n.t('options.general.title')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/translation'}>
              <Link to="/translation">
                <Icon icon="ri:translate" />
                <span>{i18n.t('options.translation.title')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
