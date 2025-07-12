'use server'

import { createClient } from '@/lib/supabase/server'

export interface Company {
  id: string
  name: string
  description?: string
  industry?: string
  priority?: number
  is_active?: boolean
  status?: string
}

export async function getActiveCompanies(): Promise<Company[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('main_companies')
      .select('id, name, description, industry, priority, is_active, status')
      .eq('is_active', true)
      .order('priority', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching companies:', error)
      throw new Error(`Failed to fetch companies: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('Error in getActiveCompanies:', error)
    throw error
  }
}
