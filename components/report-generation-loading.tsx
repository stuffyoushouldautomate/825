'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Building2,
  CheckCircle,
  Clock,
  Database,
  Download,
  FileText,
  Search,
  Shield,
  Users
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface ReportGenerationLoadingProps {
  companyName: string
  onCancel: () => void
  onComplete: (reportId: string) => void
}

interface ProcessingStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
}

export function ReportGenerationLoading({
  companyName,
  onCancel,
  onComplete
}: ReportGenerationLoadingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [overallProgress, setOverallProgress] = useState(0)
  const [extractedData, setExtractedData] = useState<string[]>([])
  const [reportId, setReportId] = useState<string | null>(null)

  const steps: ProcessingStep[] = [
    {
      id: 'search',
      title: 'Searching Company Data',
      description: 'Gathering comprehensive information from multiple sources',
      icon: Search,
      status: 'pending',
      progress: 0
    },
    {
      id: 'government',
      title: 'Government Records',
      description: 'OSHA violations, NLRB cases, federal contracts',
      icon: Building2,
      status: 'pending',
      progress: 0
    },
    {
      id: 'safety',
      title: 'Safety & Compliance',
      description: 'OSHA violations, environmental permits, licensing',
      icon: Shield,
      status: 'pending',
      progress: 0
    },
    {
      id: 'union',
      title: 'Union Relations',
      description: 'Union status, labor relations, organizing history',
      icon: Users,
      status: 'pending',
      progress: 0
    },
    {
      id: 'financial',
      title: 'Financial Analysis',
      description: 'Revenue trends, contracts, banking relationships',
      icon: FileText,
      status: 'pending',
      progress: 0
    },
    {
      id: 'synthesis',
      title: 'Report Synthesis',
      description: 'Compiling comprehensive analysis and recommendations',
      icon: Database,
      status: 'pending',
      progress: 0
    }
  ]

  const [processingSteps, setProcessingSteps] =
    useState<ProcessingStep[]>(steps)

  // Simulate processing steps
  useEffect(() => {
    const interval = setInterval(() => {
      setOverallProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + Math.random() * 3
      })
    }, 200)

    return () => clearInterval(interval)
  }, [])

  // Simulate step progression
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= processingSteps.length - 1) {
          clearInterval(stepInterval)
          return prev
        }
        return prev + 1
      })
    }, 3000)

    return () => clearInterval(stepInterval)
  }, [processingSteps.length])

  // Update step status and progress
  useEffect(() => {
    setProcessingSteps(prev =>
      prev.map((step, index) => {
        if (index < currentStep) {
          return { ...step, status: 'completed' as const, progress: 100 }
        } else if (index === currentStep) {
          return {
            ...step,
            status: 'processing' as const,
            progress: Math.min(100, overallProgress - index * 16.67)
          }
        }
        return step
      })
    )
  }, [currentStep, overallProgress])

  // Simulate data extraction
  useEffect(() => {
    const dataInterval = setInterval(() => {
      const newData = [
        'OSHA violations found: 3 incidents in last 2 years',
        'Government contracts: $2.4M in federal contracts',
        'Union status: Non-union, previous organizing attempts in 2021',
        'Financial data: $15.2M annual revenue',
        'Safety record: 2 workplace injuries in 2023',
        'Political contributions: $12,500 to local candidates',
        'Environmental permits: 3 active permits',
        'Employee count: 127 full-time employees',
        'Contract history: 15 major projects completed',
        'Legal cases: 1 pending NLRB case'
      ]

      setExtractedData(prev => {
        if (prev.length >= newData.length) return prev
        return newData.slice(0, prev.length + 1)
      })
    }, 1500)

    return () => clearInterval(dataInterval)
  }, [])

  // Simulate completion
  useEffect(() => {
    if (overallProgress >= 100) {
      setTimeout(() => {
        const mockReportId = `report_${Date.now()}`
        setReportId(mockReportId)
        onComplete(mockReportId)
      }, 2000)
    }
  }, [overallProgress, onComplete])

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Generating Company Report
          </CardTitle>
          <p className="text-muted-foreground">
            Analyzing {companyName} - This may take a few minutes
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>

          {/* Processing Steps */}
          <div className="grid gap-4">
            <h3 className="font-semibold text-sm">Processing Steps</h3>
            {processingSteps.map((step, index) => (
              <div
                key={step.id}
                className="flex items-center gap-3 p-3 rounded-lg border"
              >
                <div className="flex-shrink-0">
                  {step.status === 'completed' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {step.status === 'processing' && (
                    <Clock className="h-5 w-5 text-blue-500 animate-pulse" />
                  )}
                  {step.status === 'pending' && (
                    <step.icon className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{step.title}</span>
                    {step.status === 'processing' && (
                      <span className="text-xs text-blue-500">
                        {Math.round(step.progress)}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                  {step.status === 'processing' && (
                    <Progress value={step.progress} className="h-1 mt-2" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Data Extraction */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data Extraction
            </h3>
            <div className="grid gap-2 max-h-40 overflow-y-auto">
              {extractedData.map((data, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-xs p-2 bg-muted rounded"
                >
                  <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                  <span>{data}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Estimated Time */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              Estimated time remaining:{' '}
              {Math.max(0, Math.round((100 - overallProgress) / 10))} minutes
            </span>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={overallProgress > 90}
            >
              Cancel
            </Button>
            {reportId && (
              <Button className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download Report
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
