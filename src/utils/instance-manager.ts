declare const chrome: any

// ================================
// 类型定义
// ================================

/**
 * 平台类型枚举
 */
export type Platform = 'win' | 'mac' | 'linux' | 'cros' | 'android' | 'ios'

/**
 * 屏幕分辨率信息
 */
export interface ScreenResolution {
  width: number
  height: number
}

/**
 * 设备信息
 */
export interface DeviceInfo {
  deviceId: string
  deviceName: string
  platform: Platform
  osVersion: string
  browserVersion: string
  userAgent: string
  screenResolution?: ScreenResolution
  timezone?: string
  language?: string
}

/**
 * 确认对话框配置
 */
export interface ConfirmDialogConfig {
  title: string
  description: string
  additionalOptionText?: string
}

/**
 * AI 功能开关配置及状态
 */
export interface SwitchConfigWithState {
  name: string
  displayName: string
  description: string
  currentState: boolean
  displayOrder: number
  confirmConfig?: ConfirmDialogConfig
}

// ================================
// Chrome TabInstance API 统一调用封装
// ================================

let deviceInfo: DeviceInfo | null = null

/**
 * 开关状态变化事件监听器类型
 */
export type SwitchStateChangeListener = (
  switchName: string,
  newState: boolean,
) => void

/**
 * 统一的 chrome.tabInstance API 调用封装
 * 在调用前会检查环境是否支持，并提供统一的错误处理
 */
export class TabInstanceAPI {
  private static instance: TabInstanceAPI
  private tabInstance: any
  private eventListenerAttached = false
  private switchStateChangeListeners: Set<SwitchStateChangeListener>
    = new Set()

  private constructor() {
    this.tabInstance = (chrome as any).tabInstance
  }

  public static getInstance(): TabInstanceAPI {
    if (!TabInstanceAPI.instance) {
      TabInstanceAPI.instance = new TabInstanceAPI()
    }
    return TabInstanceAPI.instance
  }

  /**
   * 公共方法：检查 tabInstance API 是否可用
   * @param silent 是否静默模式（不打印日志）
   */
  public isAvailable(silent = false): boolean {
    return this.checkAvailability(silent)
  }

  /**
   * 检查 tabInstance API 是否可用
   * @param silent 是否静默模式（不打印日志）
   */
  public checkAvailability(silent = false): boolean {
    if (!this.tabInstance) {
      if (!silent) {
        console.warn(
          'testStatus',
          'chrome.tabInstance API is not available. This API may not be fully implemented yet.',
        )
      }
      return false
    }

    // 检查必需的方法是否存在
    const requiredMethods = ['getDeviceInfo', 'getSwitchConfigsWithState']

    const missingMethods = requiredMethods.filter(
      method => !this.tabInstance[method],
    )

    if (missingMethods.length > 0) {
      if (!silent) {
        console.warn(
          'testStatus',
          `Missing methods: ${missingMethods.join(', ')}`,
        )
      }
      return false
    }

    return true
  }

  /**
   * 安全调用 tabInstance 方法（使用回调模式）
   * @param methodName 方法名
   * @param args 参数（最后一个参数应该是回调函数）
   * @returns Promise 结果
   */
  private safeCallWithCallback<T>(
    methodName: string,
    ...args: any[]
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.checkAvailability()) {
        reject(new Error('chrome.tabInstance API is not available'))
        return
      }

      const method = this.tabInstance[methodName]
      if (typeof method !== 'function') {
        console.warn(
          `Method ${methodName} is not available in chrome.tabInstance`,
        )
        reject(new Error(`Method ${methodName} is not available`))
        return
      }

      try {
        // 添加回调函数到参数列表
        const callback = (result: any) => {
          // 直接返回设备信息，不需要检查error_code结构
          resolve(result as T)
        }

        // 直接在 tabInstance 对象上调用方法，保持正确的上下文
        this.tabInstance[methodName](...args, callback)
      }
      catch (error) {
        console.error(`Error calling chrome.tabInstance.${methodName}:`, error)
        reject(
          new Error(`Error calling chrome.tabInstance.${methodName}, error: ${error}`),
        )
      }
    })
  }

  // ================================
  // TabInstance API 方法
  // ================================

  /**
   * 获取设备信息
   * @returns Promise<DeviceInfo> 设备信息
   */
  async getDeviceInfo(): Promise<DeviceInfo> {
    try {
      return await this.safeCallWithCallback<DeviceInfo>('getDeviceInfo')
    }
    catch (error) {
      console.error('[TIM] g dev info fl:', error)
      throw error
    }
  }

  /**
   * 获取所有 AI 功能开关配置及其当前状态
   * @returns Promise<SwitchConfigWithState[]> 开关配置数组
   */
  async getSwitchConfigsWithState(): Promise<SwitchConfigWithState[]> {
    try {
      return await this.safeCallWithCallback<SwitchConfigWithState[]>(
        'getSwitchConfigsWithState',
      )
    }
    catch (error) {
      console.error('[TIM] g swt cfg fl:', error)
      throw error
    }
  }

  /**
   * 检查浏览器是否运行在 tab 测试模式
   * @returns Promise<boolean> 如果浏览器在 tab 测试模式则返回 true，否则返回 false
   */
  async isTabTestMode(): Promise<boolean> {
    try {
      return await this.safeCallWithCallback<boolean>('isTabTestMode')
    }
    catch (error) {
      console.error('[TIM] chk test mode fl:', error)
      throw error
    }
  }

  /**
   * 获取当前 tab host 配置
   * @returns Promise<string> 当前 tab host 配置
   */
  async getTabHost(): Promise<string> {
    try {
      return await this.safeCallWithCallback<string>('getTabHost')
    }
    catch (error) {
      console.error('[TIM] g host cfg fl:', error)
      throw error
    }
  }

  /**
   * 获取当前 tab 协议方案（http 或 https）
   * @returns Promise<string> 当前 tab 协议方案（http 或 https）
   */
  async getTabScheme(): Promise<string> {
    try {
      return await this.safeCallWithCallback<string>('getTabScheme')
    }
    catch (error) {
      console.error('[TIM] g scheme cfg fl:', error)
      throw error
    }
  }

  /**
   * 附加事件监听器
   */
  public attachEventListeners(): void {
    if (this.eventListenerAttached || !this.tabInstance) {
      return
    }

    // 监听开关状态变化事件
    if (this.tabInstance.onSwitchStateChanged) {
      this.tabInstance.onSwitchStateChanged.addListener(
        (switchName: string, newState: boolean) => {
          this.notifySwitchStateChangeListeners(switchName, newState)
        },
      )
      this.eventListenerAttached = true
    }
  }

  /**
   * 添加开关状态变化监听器
   * @param listener 监听器函数
   */
  public addSwitchStateChangeListener(
    listener: SwitchStateChangeListener,
  ): void {
    this.switchStateChangeListeners.add(listener)
  }

  /**
   * 移除开关状态变化监听器
   * @param listener 监听器函数
   */
  public removeSwitchStateChangeListener(
    listener: SwitchStateChangeListener,
  ): void {
    this.switchStateChangeListeners.delete(listener)
  }

  /**
   * 通知所有监听器开关状态已变化
   * @param switchName 开关名称
   * @param newState 新状态
   */
  private notifySwitchStateChangeListeners(
    switchName: string,
    newState: boolean,
  ): void {
    this.switchStateChangeListeners.forEach((listener) => {
      try {
        listener(switchName, newState)
      }
      catch (error) {
        console.error(`[TIM] swt st chg lsnr e for ${switchName}:`, error)
      }
    })
  }
}

/**
 * 获取 TabInstance API 实例的便捷方法
 */
export const getTabInstanceAPI = () => TabInstanceAPI.getInstance()

// ================================
// 便捷方法
// ================================

/**
 * 获取设备信息的便捷方法
 * @returns Promise<DeviceInfo | null> 设备信息，失败时返回 null
 */
export async function getCurrentDeviceInfo(): Promise<DeviceInfo | null> {
  try {
    const api = getTabInstanceAPI()
    // 先检查 API 是否可用，避免不必要的错误日志
    if (!api.isAvailable(true)) {
      return null
    }
    const result = await api.getDeviceInfo()

    if (result) {
      deviceInfo = result
      return deviceInfo
    }
    return null
  }
  catch (error) {
    console.error('[TIM] g dev info e:', error)
    return null
  }
}

/**
 * 获取缓存的设备信息
 * @returns DeviceInfo | null 缓存的设备信息
 */
export function getCachedDeviceInfo(): DeviceInfo | null {
  return deviceInfo
}

/**
 * 设置缓存的设备信息
 * @param info 设备信息
 */
export function setCachedDeviceInfo(info: DeviceInfo | null): void {
  deviceInfo = info
}

/**
 * 清除缓存的设备信息
 */
export function clearDeviceInfoCache(): void {
  deviceInfo = null
}

/**
 * 获取所有 AI 功能开关配置及其当前状态的便捷方法
 * @returns Promise<SwitchConfigWithState[] | null> 开关配置数组，失败时返回 null
 */
export async function getSwitchConfigs(): Promise<
  SwitchConfigWithState[] | null
> {
  try {
    const api = getTabInstanceAPI()
    // 先检查 API 是否可用，避免不必要的错误日志
    if (!api.isAvailable(true)) {
      return null
    }
    const result = await api.getSwitchConfigsWithState()

    if (result) {
      // eslint-disable-next-line no-console
      console.info('getTabInstanceAPI:', result)
      return result
    }
    return null
  }
  catch (error) {
    console.error('[TIM] g swt cfg e:', error)
    return null
  }
}

/**
 * 检查云收藏夹是否开启
 * @returns Promise<boolean> 云收藏夹是否开启
 */
export async function getCloudBookmarksEnabled(): Promise<boolean> {
  try {
    const configs = await getSwitchConfigs()

    if (!configs) {
      console.warn('[TIM] cant g swt cfg')
      return false
    }

    // 查找云收藏夹配置（name 为 "cloud_bookmarks"）
    const cloudBookmarkConfig = configs.find(
      config => config.name === 'cloud_bookmarks',
    )

    if (!cloudBookmarkConfig) {
      console.warn('[TIM] cld bmk cfg not fnd')
      return false
    }

    return cloudBookmarkConfig.currentState
  }
  catch (error) {
    console.error('[TIM] chk cld bmk st fl:', error)
    return false
  }
}

/**
 * 检查浏览器是否运行在 tab 测试模式的便捷方法
 * @returns Promise<boolean | null> 如果浏览器在 tab 测试模式则返回 true，否则返回 false，失败时返回 null
 */
export async function checkTabTestMode(): Promise<boolean | null> {
  try {
    const api = getTabInstanceAPI()
    // 先检查 API 是否可用，避免不必要的错误日志
    if (!api.isAvailable(true)) {
      return null
    }
    const result = await api.isTabTestMode()
    return result
  }
  catch (error) {
    console.error('[TIM] chk test mode e:', error)
    return null
  }
}

/**
 * 获取当前 tab host 配置的便捷方法
 * @returns Promise<string | null> 当前 tab host 配置，失败时返回 null
 */
export async function getTabHost(): Promise<string | null> {
  try {
    const api = getTabInstanceAPI()
    // 先检查 API 是否可用，避免不必要的错误日志
    if (!api.isAvailable(true)) {
      return null
    }
    const result = await api.getTabHost()
    return result
  }
  catch (error) {
    console.error('[TIM] g host cfg e:', error)
    return null
  }
}

/**
 * 获取当前 tab 协议方案的便捷方法
 * @returns Promise<string | null> 当前 tab 协议方案（http 或 https），失败时返回 null
 */
export async function getTabScheme(): Promise<string | null> {
  try {
    const api = getTabInstanceAPI()
    // 先检查 API 是否可用，避免不必要的错误日志
    if (!api.isAvailable(true)) {
      return null
    }
    const result = await api.getTabScheme()
    return result
  }
  catch (error) {
    console.error('[TIM] g scheme cfg e:', error)
    return null
  }
}
