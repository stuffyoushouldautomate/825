'use client'

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu
} from '@/components/ui/sidebar'
import { Chat } from '@/lib/types'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition
} from 'react'
import { toast } from 'sonner'
import { ChatHistorySkeleton } from './chat-history-skeleton'
import { ChatMenuItem } from './chat-menu-item'
import { ClearHistoryAction } from './clear-history-action'

interface ChatPageResponse {
  chats: Chat[]
  nextOffset: number | null
}

// Cache for chat history
const chatHistoryCache = new Map<string, { data: Chat[]; timestamp: number }>()
const CACHE_DURATION = 2 * 60 * 1000 // 2 minutes

// Virtual scrolling constants
const ITEM_HEIGHT = 60 // Approximate height of each chat item
const VISIBLE_ITEMS = 10 // Number of items to render at once

export function ChatHistoryClient() {
  const [chats, setChats] = useState<Chat[]>([])
  const [nextOffset, setNextOffset] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPending, startTransition] = useTransition()

  const fetchInitialChats = useCallback(
    async (forceRefresh = false) => {
      const cacheKey = 'chat-history'
      const cached = chatHistoryCache.get(cacheKey)
      const now = Date.now()

      // Return cached data if it's still valid and not forcing refresh
      if (!forceRefresh && cached && now - cached.timestamp < CACHE_DURATION) {
        setChats(cached.data)
        setIsLoading(false)
        setError(null)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/chats?offset=0&limit=20`)
        if (!response.ok) {
          throw new Error('Failed to fetch initial chat history')
        }
        const { chats: newChats, nextOffset: newNextOffset } =
          (await response.json()) as ChatPageResponse

        // Cache the result
        chatHistoryCache.set(cacheKey, { data: newChats, timestamp: now })

        setChats(newChats)
        setNextOffset(newNextOffset)
      } catch (error) {
        console.error('Failed to load initial chats:', error)
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'
        setError(errorMessage)

        // Retry logic for transient errors
        if (retryCount < 2) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1)
            fetchInitialChats()
          }, 1000 * (retryCount + 1)) // Exponential backoff
        }
      } finally {
        setIsLoading(false)
      }
    },
    [retryCount]
  )

  useEffect(() => {
    fetchInitialChats()
  }, [fetchInitialChats])

  // Reset retry count when chats are successfully loaded
  useEffect(() => {
    if (chats.length > 0) {
      setRetryCount(0)
    }
  }, [chats])

  useEffect(() => {
    const handleHistoryUpdate = () => {
      startTransition(() => {
        fetchInitialChats(true) // Force refresh on history update
      })
    }
    window.addEventListener('chat-history-updated', handleHistoryUpdate)
    return () => {
      window.removeEventListener('chat-history-updated', handleHistoryUpdate)
    }
  }, [fetchInitialChats])

  const fetchMoreChats = useCallback(async () => {
    if (isLoadingMore || nextOffset === null) return

    setIsLoadingMore(true)
    try {
      const response = await fetch(`/api/chats?offset=${nextOffset}&limit=20`)
      if (!response.ok) {
        throw new Error('Failed to fetch more chat history')
      }
      const { chats: newChats, nextOffset: newNextOffset } =
        (await response.json()) as ChatPageResponse

      setChats(prevChats => [...prevChats, ...newChats])
      setNextOffset(newNextOffset)
    } catch (error) {
      console.error('Failed to load more chats:', error)
      toast.error('Failed to load more chat history.')
      setNextOffset(null)
    } finally {
      setIsLoadingMore(false)
    }
  }, [nextOffset, isLoadingMore])

  // Optimized intersection observer for infinite scrolling
  useEffect(() => {
    const observerRefValue = loadMoreRef.current
    if (!observerRefValue || nextOffset === null || isPending) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoadingMore && !isPending) {
          fetchMoreChats()
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    observer.observe(observerRefValue)

    return () => {
      if (observerRefValue) {
        observer.unobserve(observerRefValue)
      }
    }
  }, [fetchMoreChats, nextOffset, isLoadingMore, isPending])

  // Memoize visible chats for virtual scrolling
  const visibleChats = useMemo(() => {
    if (chats.length <= VISIBLE_ITEMS) {
      return chats
    }

    // Simple virtual scrolling - show first VISIBLE_ITEMS
    // In a real implementation, you'd calculate based on scroll position
    return chats.slice(0, VISIBLE_ITEMS)
  }, [chats])

  const isHistoryEmpty = !isLoading && !chats.length && nextOffset === null

  const handleRefresh = useCallback(() => {
    setRetryCount(0)
    fetchInitialChats(true)
  }, [fetchInitialChats])

  if (error) {
    return (
      <div className="flex flex-col flex-1 h-full">
        <SidebarGroup>
          <div className="flex items-center justify-between w-full">
            <SidebarGroupLabel className="p-0">History</SidebarGroupLabel>
            <button
              onClick={handleRefresh}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Retry
            </button>
          </div>
        </SidebarGroup>
        <div className="px-2 text-foreground/30 text-sm text-center py-4">
          Failed to load chat history
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 h-full">
      <SidebarGroup>
        <div className="flex items-center justify-between w-full">
          <SidebarGroupLabel className="p-0">History</SidebarGroupLabel>
          <ClearHistoryAction empty={isHistoryEmpty} />
        </div>
      </SidebarGroup>
      <div className="flex-1 overflow-y-auto mb-2 relative" ref={containerRef}>
        {isHistoryEmpty && !isPending ? (
          <div className="px-2 text-foreground/30 text-sm text-center py-4">
            No search history
          </div>
        ) : (
          <SidebarMenu>
            {visibleChats.map(
              (chat: Chat) => chat && <ChatMenuItem key={chat.id} chat={chat} />
            )}
            {chats.length > VISIBLE_ITEMS && (
              <div className="px-2 py-2 text-xs text-muted-foreground text-center">
                +{chats.length - VISIBLE_ITEMS} more chats
              </div>
            )}
          </SidebarMenu>
        )}
        <div ref={loadMoreRef} style={{ height: '1px' }} />
        {(isLoadingMore || isPending) && (
          <div className="py-2">
            <ChatHistorySkeleton />
          </div>
        )}
      </div>
    </div>
  )
}
