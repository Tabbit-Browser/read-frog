import type { ProxyResponse } from '@/types/proxy-fetch'
import { DEFAULT_PROXY_CACHE_TTL_MS } from '@/utils/constants/proxy-fetch'

import { logger } from '@/utils/logger'
import { onMessage } from '@/utils/message'
import { SessionCacheGroupRegistry } from '../../utils/session-cache/session-cache-group-registry'

export function proxyFetch() {
  // Simplified: No need for in-memory Map, CacheRegistry handles everything
  async function getSessionCache(groupKey: string) {
    return await SessionCacheGroupRegistry.getCacheGroup(groupKey)
  }

  // Global cache invalidation function
  async function invalidateAllCache() {
    logger.info('[ProxyFetch] Invalidating all cache')
    await SessionCacheGroupRegistry.clearAllCacheGroup()
  }

  // Proxy cross-origin fetches for content scripts and other contexts
  onMessage('backgroundFetch', async (message): Promise<ProxyResponse> => {
    logger.info('[ProxyFetch] Background fetch:', message.data)

    const { url, method, headers, body, credentials, cacheConfig } = message.data

    const {
      enabled: cacheEnabled = false,
      groupKey: cacheGroupKey = 'default',
      ttl: cacheTtl = DEFAULT_PROXY_CACHE_TTL_MS,
    } = cacheConfig ?? {}

    async function getCached(reqMethod: string, targetUrl: string): Promise<ProxyResponse | undefined> {
      if (!cacheEnabled)
        return undefined

      const sessionCache = await getSessionCache(cacheGroupKey)
      return await sessionCache.get(reqMethod, targetUrl, cacheTtl)
    }

    async function setCached(reqMethod: string, targetUrl: string, resp: ProxyResponse): Promise<void> {
      if (!cacheEnabled)
        return

      const sessionCache = await getSessionCache(cacheGroupKey)
      await sessionCache.set(reqMethod, targetUrl, resp)
    }

    async function invalidateCache(groupKey?: string): Promise<void> {
      logger.info('[ProxyFetch] Invalidate cache:', { groupKey })
      if (groupKey) {
        const sessionCache = await getSessionCache(groupKey)
        await sessionCache.clear()
      }
      else {
        await invalidateAllCache()
      }
    }

    const finalMethod = (method ?? 'GET').toUpperCase()

    // Check cache for GET requests
    if (finalMethod === 'GET' && cacheEnabled) {
      const cached = await getCached(finalMethod, url)
      if (cached)
        return cached
    }

    // Aggressive mode: pre-clear cache before mutations to avoid race with subsequent GETs
    if (finalMethod !== 'GET') {
      await invalidateCache(cacheGroupKey)
    }

    const response = await fetch(url, {
      method: finalMethod,
      headers: headers ? new Headers(headers) : undefined,
      body,
      credentials: credentials ?? 'include',
    })

    const responseHeaders: [string, string][] = Array.from(response.headers.entries())
    const textBody = await response.text()

    const result = {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: textBody,
    }

    logger.info('[ProxyFetch] Response without cache:', result)

    // Handle caching based on response
    if (cacheEnabled) {
      if (finalMethod === 'GET') {
        // For auth requests: 401/403 implies session invalid -> clear cache
        if (result.status === 401 || result.status === 403) {
          await invalidateCache(cacheGroupKey)
        }
        // Only cache successful GET responses
        else if (result.status >= 200 && result.status < 300) {
          await setCached(finalMethod, url, result)
        }
      }
      else {
        // For auth mutations: only invalidate cache if mutation succeeded
        if (result.status >= 200 && result.status < 300) {
          await invalidateCache(cacheGroupKey)
        }
      }
    }

    return result
  })
}
