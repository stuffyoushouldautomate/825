"use client"

import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator
} from "@/components/ui/command"
import { getActiveCompanies, type Company } from '@/lib/actions/companies'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { useSession } from '@supabase/auth-helpers-react'

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [recent, setRecent] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const session = useSession()
  const userId = session?.user?.id

  // Keyboard shortcut handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Fetch companies
  useEffect(() => {
    getActiveCompanies().then(setCompanies).finally(() => setLoading(false))
  }, [])

  // Fetch user-specific recent searches from localStorage (or Supabase if you want DB persistence)
  useEffect(() => {
    if (!userId) return
    const key = `recent-searches-${userId}`
    const stored = localStorage.getItem(key)
    setRecent(stored ? JSON.parse(stored) : [])
  }, [userId])

  // Store recent search for user
  const addRecent = useCallback(
    (company: string) => {
      if (!userId) return
      const key = `recent-searches-${userId}`
      let updated = [company, ...recent.filter(r => r !== company)]
      if (updated.length > 5) updated = updated.slice(0, 5)
      setRecent(updated)
      localStorage.setItem(key, JSON.stringify(updated))
    },
    [recent, userId]
  )

  // Handle company select
  const handleSelect = (company: string) => {
    addRecent(company)
    setOpen(false)
    router.push(`/search?q=${encodeURIComponent(company)}`)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search companies" />
      <CommandList>
        <CommandEmpty>No companies found.</CommandEmpty>
        {recent.length > 0 && (
          <CommandGroup heading="Recent searches">
            {recent.map(r => (
              <CommandItem key={r} onSelect={() => handleSelect(r)}>
                {r}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        <CommandSeparator />
        <CommandGroup heading="Companies">
          {loading ? (
            <CommandItem disabled>Loading...</CommandItem>
          ) : (
            companies.map(c => (
              <CommandItem key={c.id} onSelect={() => handleSelect(c.name)}>
                {c.name}
                {c.priority && (
                  <span className="ml-2 text-xs text-muted-foreground">P{c.priority}</span>
                )}
                {c.status && (
                  <span className="ml-2 text-xs text-muted-foreground">{c.status}</span>
                )}
              </CommandItem>
            ))
          )}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
} 