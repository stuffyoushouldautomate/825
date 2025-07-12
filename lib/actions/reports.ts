'use server'

import { getCurrentUserId } from '@/lib/auth/get-current-user'
import { createClient } from '@/lib/supabase/server'

export interface CompanyReport {
  id: string
  user_id: string
  company_name: string
  report_title: string
  report_content: string
  report_summary: string
  status: 'processing' | 'completed' | 'failed'
  report_type: string
  metadata: any
  processing_started_at: string
  processing_completed_at?: string
  created_at: string
  updated_at: string
}

export interface CreateReportParams {
  companyName: string
  reportTitle?: string
  reportType?: string
  metadata?: any
}

export async function createCompanyReport(
  params: CreateReportParams
): Promise<{ success: boolean; reportId?: string; error?: string }> {
  try {
    const userId = await getCurrentUserId()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('company_reports')
      .insert({
        user_id: userId,
        company_name: params.companyName,
        report_title:
          params.reportTitle || `Company Analysis: ${params.companyName}`,
        report_content: '', // Will be populated when processing completes
        report_summary: '',
        status: 'processing',
        report_type: params.reportType || 'company_analysis',
        metadata: params.metadata || {},
        processing_started_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating company report:', error)
      return { success: false, error: error.message }
    }

    return { success: true, reportId: data.id }
  } catch (error) {
    console.error('Error creating company report:', error)
    return { success: false, error: 'Failed to create report' }
  }
}

export async function updateCompanyReport(
  reportId: string,
  updates: Partial<CompanyReport>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('company_reports')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId)

    if (error) {
      console.error('Error updating company report:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating company report:', error)
    return { success: false, error: 'Failed to update report' }
  }
}

export async function getCompanyReports(): Promise<{
  success: boolean
  reports?: CompanyReport[]
  error?: string
}> {
  try {
    const userId = await getCurrentUserId()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('company_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching company reports:', error)
      return { success: false, error: error.message }
    }

    return { success: true, reports: data || [] }
  } catch (error) {
    console.error('Error fetching company reports:', error)
    return { success: false, error: 'Failed to fetch reports' }
  }
}

export async function getCompanyReport(
  reportId: string
): Promise<{ success: boolean; report?: CompanyReport; error?: string }> {
  try {
    const userId = await getCurrentUserId()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('company_reports')
      .select('*')
      .eq('id', reportId)
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching company report:', error)
      return { success: false, error: error.message }
    }

    return { success: true, report: data }
  } catch (error) {
    console.error('Error fetching company report:', error)
    return { success: false, error: 'Failed to fetch report' }
  }
}

export async function deleteCompanyReport(
  reportId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId()
    const supabase = await createClient()

    const { error } = await supabase
      .from('company_reports')
      .delete()
      .eq('id', reportId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting company report:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting company report:', error)
    return { success: false, error: 'Failed to delete report' }
  }
}

export async function completeCompanyReport(
  reportId: string,
  reportContent: string,
  reportSummary: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('company_reports')
      .update({
        report_content: reportContent,
        report_summary: reportSummary,
        status: 'completed',
        processing_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId)

    if (error) {
      console.error('Error completing company report:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error completing company report:', error)
    return { success: false, error: 'Failed to complete report' }
  }
}

export async function createReportConversation(
  reportId: string
): Promise<{ success: boolean; conversationId?: string; error?: string }> {
  try {
    const userId = await getCurrentUserId()
    const supabase = await createClient()

    // Get the report to use its company name
    const { data: report, error: reportError } = await supabase
      .from('company_reports')
      .select('company_name, report_title')
      .eq('id', reportId)
      .single()

    if (reportError) {
      console.error('Error fetching report for conversation:', reportError)
      return { success: false, error: reportError.message }
    }

    // Create conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        title: `Report Discussion: ${report.company_name}`,
        report_type: 'company_report',
        report_id: reportId
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating report conversation:', error)
      return { success: false, error: error.message }
    }

    return { success: true, conversationId: data.id }
  } catch (error) {
    console.error('Error creating report conversation:', error)
    return { success: false, error: 'Failed to create conversation' }
  }
}
