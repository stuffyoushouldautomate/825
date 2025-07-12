import { useCallback, useEffect, useState } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
}

interface UseCachedDataOptions<T> {
  cacheKey: string
  cacheDuration?: number
  fetchFn: () => Promise<T>
  retryCount?: number
  retryDelay?: number
  onError?: (error: Error) => void
  onSuccess?: (data: T) => void
}

interface UseCachedDataReturn<T> {
  data: T | null
  isLoading: boolean
  error: string | null
  retry: () => void
  refresh: () => void
}

// Global cache for all components
const globalCache = new Map<string, CacheEntry<any>>()

export function useCachedData<T>({
  cacheKey,
  cacheDuration = 5 * 60 * 1000, // 5 minutes default
  fetchFn,
  retryCount = 2,
  retryDelay = 1000,
  onError,
  onSuccess
}: UseCachedDataOptions<T>): UseCachedDataReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentRetry, setCurrentRetry] = useState(0)

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      const cached = globalCache.get(cacheKey)
      const now = Date.now()

      // Return cached data if it's still valid and not forcing refresh
      if (!forceRefresh && cached && now - cached.timestamp < cacheDuration) {
        setData(cached.data)
        setIsLoading(false)
        setError(null)
        onSuccess?.(cached.data)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const result = await fetchFn()

        // Cache the result
        globalCache.set(cacheKey, { data: result, timestamp: now })

        setData(result)
        setCurrentRetry(0)
        onSuccess?.(result)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        console.error(`Error fetching data for ${cacheKey}:`, error)

        setError(error.message)
        onError?.(error)

        // Retry logic for transient errors
        if (currentRetry < retryCount) {
          setTimeout(() => {
            setCurrentRetry(prev => prev + 1)
            fetchData()
          }, retryDelay * (currentRetry + 1)) // Exponential backoff
        }
      } finally {
        setIsLoading(false)
      }
    },
    [
      cacheKey,
      cacheDuration,
      fetchFn,
      retryCount,
      retryDelay,
      currentRetry,
      onError,
      onSuccess
    ]
  )

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const retry = useCallback(() => {
    setCurrentRetry(0)
    fetchData(true)
  }, [fetchData])

  const refresh = useCallback(() => {
    fetchData(true)
  }, [fetchData])

  return {
    data,
    isLoading,
    error,
    retry,
    refresh
  }
}

// Utility function to clear cache
export function clearCache(cacheKey?: string) {
  if (cacheKey) {
    globalCache.delete(cacheKey)
  } else {
    globalCache.clear()
  }
}

// Utility function to get cache stats
export function getCacheStats() {
  return {
    size: globalCache.size,
    keys: Array.from(globalCache.keys())
  }
}
