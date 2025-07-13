'use client'

import { Button } from '@/components/ui/button'
import {
  createCompanyReport,
  getCompanyReports,
  type CompanyReport
} from '@/lib/actions/reports'
import { FileSearch } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { GenerateCompanyReportModal } from './generate-company-report-modal'
import { ReportGenerationLoading } from './report-generation-loading'
import { ReportSidebar } from './report-sidebar'

export function GenerateCompanyReport() {
  const [open, setOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentReport, setCurrentReport] = useState<CompanyReport | null>(null)
  const [showReportSidebar, setShowReportSidebar] = useState(false)
  const router = useRouter()

  // The prompt template for comprehensive company analysis
  const getPrompt = (
    companyName: string
  ) => `Generate a comprehensive company report for union organizing research on ${companyName}. Use these sources and structure:

SOURCES TO RESEARCH:
Government: OSHA violations, NLRB cases, federal/state contracts, court records, licensing, political contributions, environmental permits
Industry: IUOE database, ENR rankings, trade publications, bid services, equipment records
Corporate: Company website, press releases, job postings, LinkedIn, social media, employee reviews
Personal: Executive profiles, property records, news articles, alumni directories
Human Intel: Former employees, union networks, community contacts, supply chain

REPORT STRUCTURE (13 sections):
1. EXECUTIVE SUMMARY - Company overview, union status, organizing potential, key recommendations
2. CORPORATE STRUCTURE & OPERATIONS - History, ownership, subsidiaries, facilities, services, revenue, major clients
3. LEADERSHIP & MANAGEMENT - Key executives, board structure, management style, family connections, political activities
4. WORKFORCE ANALYSIS - Employee count/breakdown, union representation, demographics, compensation, working conditions
5. LABOR RELATIONS PROFILE - Union history, anti-union tactics, NLRB cases, collective bargaining, organizing attempts
6. PROJECTS & CONTRACTS - Current projects, government contracts, bidding patterns, PLAs, prevailing wage compliance
7. SAFETY & COMPLIANCE - OSHA violations, injuries/fatalities, environmental issues, litigation, licensing status
8. FINANCIAL PROFILE - Revenue trends, funding sources, banking relationships, UCC filings, real estate assets
9. POLITICAL & COMMUNITY CONNECTIONS - Political contributions, lobbying, industry associations, community reputation, charitable work
10. MARKET POSITION & COMPETITION - Market share, competitors, competitive advantages, expansion strategies, bidding approach
11. STRATEGIC PRESSURE POINTS - Client pressure opportunities, financial leverage, regulatory vulnerabilities, community pressure
12. ORGANIZING STRATEGY RECOMMENDATIONS - Priority targets, messaging approach, worker concerns, anticipated responses, legal strategy, timeline
13. APPENDICES - Facility locations, executive contacts, employee lists, OSHA details, legal cases, political contributions

Provide comprehensive factual analysis with strategic insights. Use markdown formatting with clear headings.`

  // Handle generating a new report
  const handleGenerate = async (companyName: string) => {
    setIsGenerating(true)
    setOpen(false)

    try {
      // Create report in database
      const result = await createCompanyReport({
        companyName,
        reportTitle: `Company Analysis: ${companyName}`,
        reportType: 'company_analysis'
      })

      if (!result.success || !result.reportId) {
        if (result.error === 'You must be logged in to create a report.') {
          toast.error('You must be logged in to generate a report.')
        } else {
          toast.error(result.error || 'Failed to create report')
        }
        setIsGenerating(false)
        return
      }

      // Show loading screen
      setCurrentReport({
        id: result.reportId,
        user_id: '',
        company_name: companyName,
        report_title: `Company Analysis: ${companyName}`,
        report_content: '',
        report_summary: '',
        status: 'processing',
        report_type: 'company_analysis',
        metadata: {},
        processing_started_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

      // Navigate to search with the comprehensive prompt
      const prompt = getPrompt(companyName)
      router.push(
        `/search?q=${encodeURIComponent(prompt)}&reportId=${result.reportId}`
      )
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate report. Please try again.')
      setIsGenerating(false)
    }
  }

  // Handle loading screen completion
  const handleLoadingComplete = async (reportId: string) => {
    setIsGenerating(false)

    // Fetch the completed report
    const reportsResult = await getCompanyReports()
    if (reportsResult.success && reportsResult.reports) {
      const completedReport = reportsResult.reports.find(r => r.id === reportId)
      if (completedReport) {
        setCurrentReport(completedReport)
        setShowReportSidebar(true)
      }
    } else if (
      reportsResult.error === 'You must be logged in to view reports.'
    ) {
      toast.error('You must be logged in to view reports.')
    }
  }

  // Handle asking follow-up questions
  const handleAskQuestion = (question: string) => {
    const reportContext = currentReport
      ? `Based on the ${currentReport.company_name} report: `
      : ''
    const fullQuestion = reportContext + question
    router.push(`/search?q=${encodeURIComponent(fullQuestion)}`)
  }

  // Handle downloading report
  const handleDownload = (reportId: string) => {
    // TODO: Implement PDF generation and download
    toast.info('PDF download feature coming soon!')
  }

  // Handle viewing an existing report
  const handleViewReport = async (
    companyName: string,
    reportContent: string
  ) => {
    try {
      const reportsResult = await getCompanyReports()
      if (reportsResult.success && reportsResult.reports) {
        const existingReport = reportsResult.reports.find(
          r => r.company_name.toLowerCase() === companyName.toLowerCase()
        )
        if (existingReport) {
          setCurrentReport(existingReport)
          setShowReportSidebar(true)
          return
        }
      }

      // If no existing report found, create a mock one for viewing
      setCurrentReport({
        id: `view_${Date.now()}`,
        user_id: '',
        company_name: companyName,
        report_title: `Company Analysis: ${companyName}`,
        report_content: reportContent,
        report_summary: 'Report content available for viewing',
        status: 'completed',
        report_type: 'company_analysis',
        metadata: {},
        processing_started_at: new Date().toISOString(),
        processing_completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      setShowReportSidebar(true)
    } catch (error) {
      console.error('Error viewing report:', error)
      toast.error('Failed to load report')
    }
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="w-full justify-start"
      >
        <FileSearch className="size-4 mr-2" />
        <span>Generate Company Report</span>
      </Button>

      <GenerateCompanyReportModal
        open={open}
        onOpenChange={setOpen}
        onGenerate={handleGenerate}
        onViewReport={handleViewReport}
      />

      {/* Loading Screen */}
      {isGenerating && currentReport && (
        <ReportGenerationLoading
          companyName={currentReport.company_name}
          onCancel={() => {
            setIsGenerating(false)
            setCurrentReport(null)
          }}
          onComplete={handleLoadingComplete}
        />
      )}

      {/* Report Sidebar */}
      <ReportSidebar
        report={currentReport}
        isOpen={showReportSidebar}
        onClose={() => setShowReportSidebar(false)}
        onAskQuestion={handleAskQuestion}
        onDownload={handleDownload}
      />
    </>
  )
}
