'use client'

import { Button } from '@/components/ui/button'
import { type CompanyReport } from '@/lib/actions/reports'
import {
  AlertTriangle,
  Building2,
  CheckCircle,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  FileText,
  MessageSquare,
  User,
  X
} from 'lucide-react'
import { useState } from 'react'

interface ReportSidebarProps {
  report: CompanyReport | null
  isOpen: boolean
  onClose: () => void
  onAskQuestion: (question: string) => void
  onDownload: (reportId: string) => void
}

export function ReportSidebar({
  report,
  isOpen,
  onClose,
  onAskQuestion,
  onDownload
}: ReportSidebarProps) {
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [quickQuestion, setQuickQuestion] = useState('')

  if (!report || !isOpen) return null

  const sections = [
    { id: 'summary', title: 'Executive Summary', icon: FileText },
    { id: 'structure', title: 'Corporate Structure', icon: Building2 },
    { id: 'leadership', title: 'Leadership & Management', icon: User },
    { id: 'workforce', title: 'Workforce Analysis', icon: User },
    { id: 'labor', title: 'Labor Relations', icon: MessageSquare },
    { id: 'projects', title: 'Projects & Contracts', icon: FileText },
    { id: 'safety', title: 'Safety & Compliance', icon: AlertTriangle },
    { id: 'financial', title: 'Financial Profile', icon: FileText },
    { id: 'political', title: 'Political Connections', icon: Building2 },
    { id: 'market', title: 'Market Position', icon: Building2 },
    { id: 'pressure', title: 'Strategic Pressure Points', icon: AlertTriangle },
    { id: 'strategy', title: 'Organizing Strategy', icon: CheckCircle }
  ]

  const quickQuestions = [
    'What are the main safety concerns?',
    'How many employees do they have?',
    'What government contracts do they have?',
    'What is their union status?',
    'What are their financial vulnerabilities?',
    'Who are the key decision makers?'
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-background border-l shadow-lg z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-semibold text-sm">Company Report</h2>
            <p className="text-xs text-muted-foreground">
              {report.company_name}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Report Status */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          {report.status === 'completed' && (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          {report.status === 'processing' && (
            <Clock className="h-4 w-4 text-blue-500 animate-pulse" />
          )}
          {report.status === 'failed' && (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          )}
          <span className="text-sm font-medium capitalize">
            {report.status}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          Generated: {formatDate(report.created_at)}
          {report.processing_completed_at && (
            <span>
              {' '}
              • Completed: {formatDate(report.processing_completed_at)}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-b">
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onDownload(report.id)}
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              window.open(
                `/search?q=${encodeURIComponent(report.company_name)}`,
                '_blank'
              )
            }
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Report Sections */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="font-semibold text-sm mb-3">Report Sections</h3>
          <div className="space-y-1">
            {sections.map(section => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() =>
                    setSelectedSection(
                      selectedSection === section.id ? null : section.id
                    )
                  }
                  className="w-full flex items-center justify-between p-2 text-left text-sm rounded hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span>{section.title}</span>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${
                      selectedSection === section.id ? 'rotate-90' : ''
                    }`}
                  />
                </button>
              )
            })}
          </div>
        </div>

        {/* Quick Questions */}
        <div className="p-4 border-t">
          <h3 className="font-semibold text-sm mb-3">Quick Questions</h3>
          <div className="space-y-2">
            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs h-auto p-2"
                onClick={() => onAskQuestion(question)}
              >
                <MessageSquare className="h-3 w-3 mr-2" />
                {question}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Question */}
        <div className="p-4 border-t">
          <h3 className="font-semibold text-sm mb-3">Ask Custom Question</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask about this company..."
              value={quickQuestion}
              onChange={e => setQuickQuestion(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              onKeyPress={e => {
                if (e.key === 'Enter' && quickQuestion.trim()) {
                  onAskQuestion(quickQuestion.trim())
                  setQuickQuestion('')
                }
              }}
            />
            <Button
              size="sm"
              onClick={() => {
                if (quickQuestion.trim()) {
                  onAskQuestion(quickQuestion.trim())
                  setQuickQuestion('')
                }
              }}
            >
              Ask
            </Button>
          </div>
        </div>
      </div>

      {/* Report Summary */}
      {report.report_summary && (
        <div className="p-4 border-t bg-muted/50">
          <h3 className="font-semibold text-sm mb-2">Report Summary</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {report.report_summary}
          </p>
        </div>
      )}
    </div>
  )
}
