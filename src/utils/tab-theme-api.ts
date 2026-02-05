import { logger } from './logger'

// ================================
// 类型定义
// ================================

/**
 * 主题颜色值
 */
export interface ThemeColorValue {
  /** 颜色值（ARGB 格式的整数） */
  value: number
}

/**
 * Chrome 主题颜色信息
 */
export interface ChromeThemeColors {
  /** 用户颜色 */
  user_color?: ThemeColorValue
  /** 是否为暗色模式 */
  is_dark_mode: boolean
}

const TAG = '[ThemeAPI]'

// ================================
// 颜色转换工具函数
// ================================

/**
 * 将 SkColor (ARGB 32位整数) 转换为 RGBA 对象
 * Chrome/Chromium 内部使用 SkColor 格式：0xAARRGGBB
 * - Bits 24-31: Alpha (0xFF = 不透明, 0x00 = 透明)
 * - Bits 16-23: Red
 * - Bits 8-15: Green
 * - Bits 0-7: Blue
 *
 * @param skColor SkColor 格式的整数值（ARGB）
 */
export function argbToRgba(skColor: number): { r: number, g: number, b: number, a: number } {
  // 使用 >>> 0 确保是无符号 32 位整数（处理负数情况）
  const color = skColor >>> 0
  return {
    a: ((color >> 24) & 0xFF) / 255,
    r: (color >> 16) & 0xFF,
    g: (color >> 8) & 0xFF,
    b: (color >> 0) & 0xFF,
  }
}

/**
 * 将 SkColor 转换为 CSS rgb() 或 rgba() 字符串
 * @param skColor SkColor 格式的整数值
 */
export function skColorToRgbString(skColor: number): string {
  const { r, g, b, a } = argbToRgba(skColor)

  if (a >= 1) {
    return `rgb(${r}, ${g}, ${b})`
  }
  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3).replace(/\.?0+$/, '')})`
}

/**
 * 将 SkColor 转换为 CSS 十六进制颜色字符串
 * @param skColor SkColor 格式的整数值
 */
export function skColorToHex(skColor: number): string {
  const { r, g, b, a } = argbToRgba(skColor)
  const toHex = (n: number) => n.toString(16).padStart(2, '0')

  if (a >= 1) {
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(Math.round(a * 255))}`
}

/**
 * 从主题颜色生成 CSS 变量值（使用 RGB 格式）
 * @param skColor SkColor 格式的主色值
 */
export function generatePrimaryCssVariables(skColor: number): Record<string, string> {
  const { r, g, b } = argbToRgba(skColor)

  // 使用 RGB 格式，更直接可靠
  const base = `rgb(${r}, ${g}, ${b})`

  return {
    '--primary': base,
    '--primary-fill': `rgba(${r}, ${g}, ${b}, 0.05)`,
    '--primary-weak': `rgba(${r}, ${g}, ${b}, 0.2)`,
    '--primary-strong': `rgba(${r}, ${g}, ${b}, 0.8)`,
  }
}

const THEME_STYLE_ID = 'tab-translation-theme-override'

/**
 * 解析颜色并记录日志
 */
function parseAndLogColor(colors: ChromeThemeColors | null): number | null {
  if (!colors?.user_color || typeof colors.user_color.value !== 'number') {
    logger.info(TAG, 'No valid user_color value, skipping')
    return null
  }

  const skColor = colors.user_color.value
  const rgba = argbToRgba(skColor)

  logger.info(TAG, 'Decoded SkColor:', {
    raw: skColor,
    hex: `0x${(skColor >>> 0).toString(16).padStart(8, '0').toUpperCase()}`,
    rgba,
    rgbString: skColorToRgbString(skColor),
    hexString: skColorToHex(skColor),
  })

  return skColor
}

/**
 * 注入全局主题主色到 :root（仅用于内容脚本）
 * @param colors 主题颜色
 */
export function injectGlobalThemePrimary(colors: ChromeThemeColors | null): void {
  const skColor = parseAndLogColor(colors)
  if (skColor === null)
    return

  const { r, g, b } = argbToRgba(skColor)
  const primaryColor = `rgb(${r}, ${g}, ${b})`

  let styleEl = document.getElementById(THEME_STYLE_ID) as HTMLStyleElement | null
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = THEME_STYLE_ID
    document.head.appendChild(styleEl)
  }

  styleEl.textContent = `:root { --tab-translation-primary: ${primaryColor}; }`
  logger.info(TAG, 'Injected global theme primary:', styleEl.textContent)
}

/**
 * 将主题颜色应用到指定的 HTML 元素
 * 用于 Shadow DOM 容器或扩展自身页面的 document.documentElement
 * @param element 目标元素
 * @param colors 主题颜色
 */
export function applyThemeColorsToElement(
  element: HTMLElement,
  colors: ChromeThemeColors | null,
): void {
  logger.info(TAG, 'applyThemeColorsToElement called with:', {
    element: element.tagName,
    hasUserColor: !!colors?.user_color?.value,
  })

  const skColor = parseAndLogColor(colors)
  if (skColor === null)
    return

  const cssVars = generatePrimaryCssVariables(skColor)
  logger.info(TAG, 'Generated CSS variables:', cssVars)

  Object.entries(cssVars).forEach(([prop, value]) => {
    element.style.setProperty(prop, value)
  })
}
