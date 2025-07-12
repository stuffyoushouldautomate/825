'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { getActiveCompanies, type Company } from '@/lib/actions/companies'
import { AlertCircle, Building2, ChevronDown, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

// Cache for companies data
const companiesCache = new Map<string, { data: Company[]; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function CompaniesDropdown() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const router = useRouter()

  const fetchCompanies = useCallback(
    async (forceRefresh = false) => {
      const cacheKey = 'active-companies'
      const cached = companiesCache.get(cacheKey)
      const now = Date.now()

      // Return cached data if it's still valid and not forcing refresh
      if (!forceRefresh && cached && now - cached.timestamp < CACHE_DURATION) {
        setCompanies(cached.data)
        setIsLoading(false)
        setError(null)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        console.log('Fetching companies using server action...')
        const companiesData = await getActiveCompanies()
        console.log('Companies fetched:', companiesData.length)

        // Cache the result
        companiesCache.set(cacheKey, { data: companiesData, timestamp: now })

        setCompanies(companiesData)
      } catch (error) {
        console.error('Error fetching companies:', error)
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'
        setError(errorMessage)

        // Retry logic for transient errors
        if (retryCount < 2) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1)
            fetchCompanies()
          }, 1000 * (retryCount + 1)) // Exponential backoff
        }
      } finally {
        setIsLoading(false)
      }
    },
    [retryCount]
  )

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  // Reset retry count when companies are successfully loaded
  useEffect(() => {
    if (companies.length > 0) {
      setRetryCount(0)
    }
  }, [companies])

  const handleCompanySelect = useCallback(
    (companyName: string) => {
      setIsOpen(false)
      // Navigate to search with the company name as the query
      router.push(`/search?q=${encodeURIComponent(companyName)}`)
    },
    [router]
  )

  // Memoize the companies list to prevent unnecessary re-renders
  const sortedCompanies = useMemo(() => {
    return [...companies].sort((a, b) => {
      // Sort by priority first (higher priority first), then by name
      if (a.priority && b.priority) {
        return b.priority - a.priority
      }
      if (a.priority) return -1
      if (b.priority) return 1
      return a.name.localeCompare(b.name)
    })
  }, [companies])

  const handleRefresh = useCallback(() => {
    setRetryCount(0)
    fetchCompanies(true)
  }, [fetchCompanies])

  if (isLoading) {
    return (
      <Button variant="outline" disabled className="w-full justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="size-4" />
          <span>Companies</span>
        </div>
        <Loader2 className="size-4 animate-spin" />
      </Button>
    )
  }

  if (error) {
    return (
      <div className="space-y-2">
        <Button variant="outline" disabled className="w-full justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="size-4" />
            <span>Companies</span>
          </div>
          <AlertCircle className="size-4 text-red-500" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          className="w-full text-xs"
        >
          Retry
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="size-4" />
            <span>Companies ({companies.length})</span>
          </div>
          <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 max-h-96 overflow-y-auto"
        align="start"
      >
        {companies.length === 0 ? (
          <DropdownMenuItem disabled>
            No active companies found
          </DropdownMenuItem>
        ) : (
          sortedCompanies.map(company => (
            <DropdownMenuItem
              key={company.id}
              onClick={() => handleCompanySelect(company.name)}
              className="cursor-pointer"
            >
              <div className="flex flex-col w-full">
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate">{company.name}</span>
                  {company.priority && (
                    <span className="text-xs text-muted-foreground ml-2">
                      P{company.priority}
                    </span>
                  )}
                </div>
                {company.status && (
                  <span className="text-xs text-muted-foreground">
                    {company.status}
                  </span>
                )}
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
