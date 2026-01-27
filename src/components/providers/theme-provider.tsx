import { createContext, use, useEffect, useMemo, useState } from 'react'
import { logger } from '@/utils/logger'
import { sendMessage } from '@/utils/message'
import { applyThemeColorsToElement } from '@/utils/tab-theme-api'
import { isDarkMode } from '@/utils/theme'

const TAG = '[ThemeProvider]'

export type Theme = 'light' | 'dark'

interface ThemeContextI {
  theme: Theme
}

export const ThemeContext = createContext<ThemeContextI | undefined>(undefined)

function getCurrentTheme(): Theme {
  return isDarkMode() ? 'dark' : 'light'
}

export function ThemeProvider({
  children,
  container,
}: {
  children: React.ReactNode
  container?: HTMLElement
}) {
  const [theme, setTheme] = useState<Theme>(() => getCurrentTheme())

  // Apply theme to document or shadow root container
  useEffect(() => {
    const target = container ?? document.documentElement
    target.classList.remove('light', 'dark')
    target.classList.add(theme)
    target.setAttribute('style', `color-scheme: ${theme}`)
  }, [theme, container])

  // Listen for system theme changes
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!mq)
      return
    const onChange = (e: MediaQueryListEvent) => setTheme(e.matches ? 'dark' : 'light')
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  // Apply browser theme colors (primary color from Chrome tab theme API)
  // 通过 background 获取主题色（chrome.tabThemeColor API 只能在扩展上下文中调用）
  useEffect(() => {
    const target = container ?? document.documentElement

    void sendMessage('getTabThemeColors', undefined).then((colors) => {
      logger.info(TAG, 'Got theme colors from background:', colors)
      if (colors) {
        applyThemeColorsToElement(target, colors)
      }
    }).catch((error) => {
      logger.warn(TAG, 'Failed to get theme colors:', error)
    })
  }, [container])

  const contextValue = useMemo(() => ({ theme }), [theme])

  return (
    <ThemeContext value={contextValue}>
      {children}
    </ThemeContext>
  )
}

export function useTheme(): ThemeContextI {
  const context = use(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
