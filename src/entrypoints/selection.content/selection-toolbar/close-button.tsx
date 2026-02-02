import { i18n } from '#imports'
import { Icon } from '@iconify/react'
import { useAtom } from 'jotai'
import { use, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn/dropdown-menu'
import { configFieldsAtomMap } from '@/utils/atoms/config'
import { ShadowWrapperContext } from '@/utils/react-shadow-host/create-shadow-host'

export const DropEvent = 'rf-dropdown-change'

export function CloseButton() {
  const shadowWrapper = use(ShadowWrapperContext)
  const [selectionToolbar, setSelectionToolbar] = useAtom(configFieldsAtomMap.selectionToolbar)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <DropdownMenu
      open={isDropdownOpen}
      onOpenChange={(open) => {
        setIsDropdownOpen(open)
        window.dispatchEvent(new CustomEvent(DropEvent, { detail: { open } }))
      }}
    >
      <DropdownMenuTrigger asChild>
        <div
          title="Close selection toolbar"
          className={`border-border absolute -top-1 -right-1 cursor-pointer rounded-full border bg-neutral-100 dark:bg-neutral-900 ${isDropdownOpen ? 'block' : 'hidden group-hover:block'}`}
          onMouseDown={handleMouseDown}
        >
          <Icon icon="tabler:x" className="h-3 w-3 text-neutral-400 dark:text-neutral-600" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right" className="z-[2147483647]" container={shadowWrapper} hideWhenDetached>
        <DropdownMenuItem
          onMouseDown={handleMouseDown}
          onClick={() => {
            const currentDomain = window.location.hostname
            const currentPatterns = selectionToolbar.disabledSelectionToolbarPatterns || []
            void setSelectionToolbar({
              ...selectionToolbar,
              disabledSelectionToolbarPatterns: [...currentPatterns, currentDomain],
            })
          }}
        >
          {i18n.t('options.floatingButtonAndToolbar.selectionToolbar.closeMenu.disableForSite')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onMouseDown={handleMouseDown}
          onClick={() => {
            void setSelectionToolbar({ ...selectionToolbar, enabled: false })
          }}
        >
          {i18n.t('options.floatingButtonAndToolbar.selectionToolbar.closeMenu.disableGlobally')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
