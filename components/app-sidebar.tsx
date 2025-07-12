'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger
} from '@/components/ui/sidebar'
import { type CompanyReport } from '@/lib/actions/reports'
import { Building2, FileText, Plus, Shield, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense, memo, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { CompaniesDropdown } from './companies-dropdown'
import { GenerateCompanyReport } from './generate-company-report'
import { ReportSidebar } from './report-sidebar'
import { ChatHistorySection } from './sidebar/chat-history-section'
import { ChatHistorySkeleton } from './sidebar/chat-history-skeleton'
import { SidebarPerformanceMonitor } from './sidebar/performance-monitor'
import { ReportHistorySection } from './sidebar/report-history-section'

// Memoized quick research links to prevent unnecessary re-renders
const QuickResearchLinks = memo(() => {
  const quickResearchItems = [
    {
      href: '/search?q=OSHA violations',
      icon: Shield,
      label: 'Safety & OSHA'
    },
    {
      href: '/search?q=government contracts',
      icon: FileText,
      label: 'Government Contracts'
    },
    {
      href: '/search?q=union status',
      icon: Users,
      label: 'Union Relations'
    },
    {
      href: '/search?q=company analysis',
      icon: Building2,
      label: 'Generate Company Report'
    }
  ]

  return (
    <div className="px-2 py-2">
      <h3 className="text-xs font-semibold text-muted-foreground mb-2">
        Quick Research
      </h3>
      <div className="space-y-1">
        {quickResearchItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2 p-2 text-sm rounded-md hover:bg-accent transition-colors"
          >
            <Icon className="size-4" />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
})
QuickResearchLinks.displayName = 'QuickResearchLinks'

// Error boundary component for sidebar sections
const SidebarErrorBoundary = ({
  children,
  fallback
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) => (
  <ErrorBoundary
    fallback={
      fallback || (
        <div className="px-2 py-2 text-xs text-muted-foreground">
          Failed to load component
        </div>
      )
    }
  >
    {children}
  </ErrorBoundary>
)

// Loading component for lazy-loaded sections
const SidebarSectionSkeleton = () => (
  <div className="px-2 py-2">
    <div className="h-10 bg-muted rounded-md animate-pulse" />
  </div>
)

export default function AppSidebar() {
  const [selectedReport, setSelectedReport] = useState<CompanyReport | null>(
    null
  )
  const [showReportSidebar, setShowReportSidebar] = useState(false)

  const handleReportSelect = (report: CompanyReport) => {
    setSelectedReport(report)
    setShowReportSidebar(true)
  }

  const handleAskQuestion = (question: string) => {
    const reportContext = selectedReport
      ? `Based on the ${selectedReport.company_name} report: `
      : ''
    const fullQuestion = reportContext + question
    window.open(`/search?q=${encodeURIComponent(fullQuestion)}`, '_blank')
  }

  const handleDownload = (reportId: string) => {
    // TODO: Implement PDF generation and download
    console.log('Download report:', reportId)
  }

  return (
    <>
      <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
        <SidebarHeader className="flex flex-row justify-between items-center">
          <Link href="/" className="flex items-center gap-2 px-2 py-3">
            <Image
              src="/images/local825-logo.png"
              alt="Local 825 Logo"
              width={32}
              height={32}
              className="rounded-md"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-sm">Bulldozer Search</span>
              <span className="text-xs text-muted-foreground">Local 825</span>
            </div>
          </Link>
          <SidebarTrigger />
        </SidebarHeader>

        <SidebarContent className="flex flex-col px-2 py-4 h-full">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/" className="flex items-center gap-2">
                  <Plus className="size-4" />
                  <span>New Research</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          {/* Companies Section with Error Boundary */}
          <SidebarErrorBoundary>
            <Suspense fallback={<SidebarSectionSkeleton />}>
              <div className="px-2 py-2">
                <CompaniesDropdown />
              </div>
            </Suspense>
          </SidebarErrorBoundary>

          {/* Generate Company Report with Error Boundary */}
          <SidebarErrorBoundary>
            <Suspense fallback={<SidebarSectionSkeleton />}>
              <div className="px-2 py-2">
                <GenerateCompanyReport />
              </div>
            </Suspense>
          </SidebarErrorBoundary>

          {/* Quick Research Categories - Memoized */}
          <QuickResearchLinks />

          {/* Report History Section */}
          <div className="flex-1 overflow-y-auto">
            <SidebarErrorBoundary>
              <Suspense fallback={<ChatHistorySkeleton />}>
                <ReportHistorySection onSelectReport={handleReportSelect} />
              </Suspense>
            </SidebarErrorBoundary>
          </div>

          {/* Chat History with Error Boundary */}
          <div className="flex-1 overflow-y-auto">
            <SidebarErrorBoundary>
              <Suspense fallback={<ChatHistorySkeleton />}>
                <ChatHistorySection />
              </Suspense>
            </SidebarErrorBoundary>
          </div>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>

      {/* Report Sidebar */}
      <ReportSidebar
        report={selectedReport}
        isOpen={showReportSidebar}
        onClose={() => setShowReportSidebar(false)}
        onAskQuestion={handleAskQuestion}
        onDownload={handleDownload}
      />

      {/* Performance Monitor (development only) */}
      <SidebarPerformanceMonitor />
    </>
  )
}
