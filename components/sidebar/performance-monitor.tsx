'use client'

import { getCacheStats } from '@/hooks/use-cached-data'
import { useEffect, useState } from 'react'

interface PerformanceMetrics {
  renderTime: number
  memoryUsage: number
  cacheSize: number
  cacheKeys: string[]
}

export function SidebarPerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') {
      return
    }

    const measurePerformance = () => {
      const startTime = performance.now()

      // Measure render time
      requestAnimationFrame(() => {
        const renderTime = performance.now() - startTime

        // Get memory usage (if available)
        const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0

        // Get cache stats
        const cacheStats = getCacheStats()

        setMetrics({
          renderTime,
          memoryUsage,
          cacheSize: cacheStats.size,
          cacheKeys: cacheStats.keys
        })
      })
    }

    // Measure on mount and periodically
    measurePerformance()
    const interval = setInterval(measurePerformance, 5000) // Every 5 seconds

    return () => clearInterval(interval)
  }, [])

  // Toggle visibility with keyboard shortcut (Ctrl/Cmd + Shift + P)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.shiftKey &&
        event.key === 'P'
      ) {
        event.preventDefault()
        setIsVisible(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!isVisible || process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-background border rounded-lg p-4 shadow-lg z-50 max-w-xs">
      <div className="text-xs font-mono space-y-1">
        <div className="font-semibold mb-2">Sidebar Performance</div>
        {metrics && (
          <>
            <div>Render: {metrics.renderTime.toFixed(2)}ms</div>
            <div>
              Memory: {(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB
            </div>
            <div>Cache: {metrics.cacheSize} items</div>
            {metrics.cacheKeys.length > 0 && (
              <div className="mt-2">
                <div className="font-semibold">Cache Keys:</div>
                <div className="text-xs opacity-75">
                  {metrics.cacheKeys.slice(0, 3).join(', ')}
                  {metrics.cacheKeys.length > 3 &&
                    ` +${metrics.cacheKeys.length - 3} more`}
                </div>
              </div>
            )}
          </>
        )}
        <div className="text-xs opacity-50 mt-2">
          Press Ctrl/Cmd + Shift + P to toggle
        </div>
      </div>
    </div>
  )
}
