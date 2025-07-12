'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Company {
  id: string
  name: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerate: (companyName: string) => void
  onViewReport: (companyName: string, report: string) => void
}

export function GenerateCompanyReportModal({
  open,
  onOpenChange,
  onGenerate,
  onViewReport
}: Props) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [companyName, setCompanyName] = useState('')
  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [checking, setChecking] = useState(false)
  const [existingReport, setExistingReport] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setIsLoading(true)
    setError(null)
    setCompanies([])
    setCompanyName('')
    setSelectedCompany('')
    setExistingReport(null)
    const fetchCompanies = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('main_companies')
          .select('id, name')
          .order('name')
        if (error) throw error
        setCompanies(data || [])
      } catch (err: any) {
        setError('Failed to load companies')
      } finally {
        setIsLoading(false)
      }
    }
    fetchCompanies()
  }, [open])

  const handleCheckReport = async () => {
    setChecking(true)
    setExistingReport(null)
    setError(null)
    const name = selectedCompany || companyName
    if (!name) {
      setError('Please enter or select a company name.')
      setChecking(false)
      return
    }
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('company_research')
        .select('id, research_content')
        .eq('company_name', name)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      if (data && data.research_content) {
        setExistingReport(data.research_content)
      } else {
        setExistingReport(null)
      }
    } catch (err: any) {
      setError('Failed to check for existing report.')
    } finally {
      setChecking(false)
    }
  }

  const handleGenerate = () => {
    const name = selectedCompany || companyName
    if (!name) {
      setError('Please enter or select a company name.')
      return
    }
    onOpenChange(false)
    onGenerate(name)
  }

  const handleView = () => {
    const name = selectedCompany || companyName
    if (existingReport && name) {
      onOpenChange(false)
      onViewReport(name, existingReport)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Company Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Select a company</label>
          <select
            className="w-full border rounded-md px-2 py-2 text-sm"
            value={selectedCompany}
            onChange={e => {
              setSelectedCompany(e.target.value)
              setCompanyName('')
              setExistingReport(null)
            }}
            disabled={isLoading}
          >
            <option value="">-- Choose from tracked companies --</option>
            {companies.map(c => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              or enter a company name
            </span>
          </div>
          <Input
            placeholder="Enter company name"
            value={companyName}
            onChange={e => {
              setCompanyName(e.target.value)
              setSelectedCompany('')
              setExistingReport(null)
            }}
            disabled={isLoading}
          />
          <Button
            onClick={handleCheckReport}
            disabled={
              isLoading || checking || (!selectedCompany && !companyName)
            }
            variant="outline"
            className="w-full mt-2"
          >
            {checking ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
            Check for Existing Report
          </Button>
          {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
          {existingReport !== null && (
            <div className="bg-muted p-2 rounded text-xs mt-2">
              <div className="mb-2">
                A report already exists for this company.
              </div>
              <div className="flex gap-2">
                <Button onClick={handleView} variant="secondary" size="sm">
                  View Report
                </Button>
                <Button onClick={handleGenerate} variant="outline" size="sm">
                  Regenerate
                </Button>
              </div>
            </div>
          )}
          {existingReport === null &&
            !checking &&
            (selectedCompany || companyName) && (
              <Button onClick={handleGenerate} className="w-full mt-2">
                Generate New Report
              </Button>
            )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
