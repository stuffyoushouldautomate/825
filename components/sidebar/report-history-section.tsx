'use client'

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu
} from '@/components/ui/sidebar'
import { getCompanyReports, type CompanyReport } from '@/lib/actions/reports'
import {
  AlertTriangle,
  Building2,
  CheckCircle,
  Clock,
  Download
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

interface ReportHistorySectionProps {
  onSelectReport: (report: CompanyReport) => void
}

export function ReportHistorySection({
  onSelectReport
}: ReportHistorySectionProps) {
  const [reports, setReports] = useState<CompanyReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReports = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await getCompanyReports()
      if (result.success && result.reports) {
        setReports(result.reports)
      } else {
        setError(result.error || 'Failed to load reports')
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
      setError('Failed to load reports')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case 'processing':
        return <Clock className="h-3 w-3 text-blue-500 animate-pulse" />
      case 'failed':
        return <AlertTriangle className="h-3 w-3 text-red-500" />
      default:
        return <Clock className="h-3 w-3 text-muted-foreground" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'processing':
        return 'Processing'
      case 'failed':
        return 'Failed'
      default:
        return 'Unknown'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleReportClick = (report: CompanyReport) => {
    onSelectReport(report)
  }

  const handleDownload = async (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: Implement PDF download
    toast.info('PDF download feature coming soon!')
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <SidebarGroup>
          <SidebarGroupLabel>Report History</SidebarGroupLabel>
        </SidebarGroup>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="flex items-center gap-2 p-2 rounded animate-pulse"
            >
              <div className="h-4 w-4 bg-muted rounded" />
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-muted rounded w-3/4" />
                <div className="h-2 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-2">
        <SidebarGroup>
          <SidebarGroupLabel>Report History</SidebarGroupLabel>
        </SidebarGroup>
        <div className="p-2 text-xs text-muted-foreground">
          Failed to load reports
        </div>
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <div className="space-y-2">
        <SidebarGroup>
          <SidebarGroupLabel>Report History</SidebarGroupLabel>
        </SidebarGroup>
        <div className="p-2 text-xs text-muted-foreground text-center">
          No reports generated yet
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <SidebarGroup>
        <SidebarGroupLabel>Report History ({reports.length})</SidebarGroupLabel>
      </SidebarGroup>
      <SidebarMenu>
        {reports.map(report => (
          <div
            key={report.id}
            className="flex items-center justify-between p-2 rounded hover:bg-accent cursor-pointer transition-colors"
            onClick={() => handleReportClick(report)}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Building2 className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {report.company_name}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {getStatusIcon(report.status)}
                  <span>{getStatusText(report.status)}</span>
                  <span>•</span>
                  <span>{formatDate(report.created_at)}</span>
                </div>
              </div>
            </div>
            {report.status === 'completed' && (
              <button
                onClick={e => handleDownload(report.id, e)}
                className="p-1 hover:bg-muted rounded transition-colors"
                title="Download PDF"
              >
                <Download className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>
        ))}
      </SidebarMenu>
    </div>
  )
}
