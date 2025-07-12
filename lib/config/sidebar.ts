// Sidebar configuration and constants
export const SIDEBAR_CONFIG = {
  // Cache settings
  CACHE_DURATION: {
    COMPANIES: 5 * 60 * 1000, // 5 minutes
    CHAT_HISTORY: 2 * 60 * 1000, // 2 minutes
    DEFAULT: 5 * 60 * 1000 // 5 minutes
  },

  // Performance settings
  VIRTUAL_SCROLLING: {
    VISIBLE_ITEMS: 10,
    ITEM_HEIGHT: 60,
    LOAD_MORE_THRESHOLD: 0.1,
    ROOT_MARGIN: '100px'
  },

  // Retry settings
  RETRY: {
    MAX_ATTEMPTS: 2,
    BASE_DELAY: 1000,
    MAX_DELAY: 5000
  },

  // Quick research items
  QUICK_RESEARCH_ITEMS: [
    {
      href: '/search?q=OSHA violations',
      icon: 'Shield',
      label: 'Safety & OSHA',
      description: 'Search for safety violations and OSHA records'
    },
    {
      href: '/search?q=government contracts',
      icon: 'FileText',
      label: 'Government Contracts',
      description: 'Find government contract information'
    },
    {
      href: '/search?q=union status',
      icon: 'Users',
      label: 'Union Relations',
      description: 'Research union status and labor relations'
    },
    {
      href: '/search?q=company analysis',
      icon: 'Building2',
      label: 'Generate Company Report',
      description: 'Create comprehensive company analysis'
    }
  ],

  // Error messages
  ERRORS: {
    FETCH_COMPANIES: 'Failed to load companies',
    FETCH_CHAT_HISTORY: 'Failed to load chat history',
    FETCH_MORE_CHATS: 'Failed to load more chat history',
    GENERIC: 'An error occurred'
  },

  // Loading states
  LOADING: {
    COMPANIES: 'Loading companies...',
    CHAT_HISTORY: 'Loading chat history...',
    GENERIC: 'Loading...'
  },

  // Performance monitoring
  PERFORMANCE: {
    MEASURE_INTERVAL: 5000, // 5 seconds
    MEMORY_THRESHOLD: 50 * 1024 * 1024, // 50MB
    RENDER_TIME_THRESHOLD: 100 // 100ms
  }
} as const

// Sidebar feature flags
export const SIDEBAR_FEATURES = {
  ENABLE_CACHING: process.env.NODE_ENV === 'production' || true,
  ENABLE_VIRTUAL_SCROLLING: true,
  ENABLE_PERFORMANCE_MONITORING: process.env.NODE_ENV === 'development',
  ENABLE_ERROR_BOUNDARIES: true,
  ENABLE_RETRY_LOGIC: true
} as const

// Sidebar analytics events
export const SIDEBAR_EVENTS = {
  COMPONENT_LOADED: 'sidebar_component_loaded',
  CACHE_HIT: 'sidebar_cache_hit',
  CACHE_MISS: 'sidebar_cache_miss',
  ERROR_OCCURRED: 'sidebar_error_occurred',
  PERFORMANCE_ALERT: 'sidebar_performance_alert'
} as const

// Utility functions
export function getCacheKey(component: string, identifier?: string): string {
  return identifier ? `${component}-${identifier}` : component
}

export function shouldRetry(error: Error): boolean {
  // Don't retry on 4xx errors (client errors)
  if (error.message.includes('404') || error.message.includes('403')) {
    return false
  }
  return true
}

export function getRetryDelay(attempt: number): number {
  const { BASE_DELAY, MAX_DELAY } = SIDEBAR_CONFIG.RETRY
  return Math.min(BASE_DELAY * Math.pow(2, attempt), MAX_DELAY)
}

export function isPerformanceAcceptable(
  renderTime: number,
  memoryUsage: number
): boolean {
  const { RENDER_TIME_THRESHOLD, MEMORY_THRESHOLD } = SIDEBAR_CONFIG.PERFORMANCE
  return renderTime < RENDER_TIME_THRESHOLD && memoryUsage < MEMORY_THRESHOLD
}
