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

    // First try to get the current user to check authentication
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.log('No authenticated user, returning sample companies')
      // Return sample companies for unauthenticated users
      return [
        {
          id: '1',
          name: 'Skanska',
          description: 'Major construction contractor',
          industry: 'Construction',
          priority: 1,
          is_active: true,
          status: 'Active'
        },
        {
          id: '2',
          name: 'Esposito Construction',
          description: 'Regional construction company',
          industry: 'Construction',
          priority: 2,
          is_active: true,
          status: 'Active'
        },
        {
          id: '3',
          name: 'Insituform',
          description: 'Trenchless pipe rehabilitation',
          industry: 'Infrastructure',
          priority: 3,
          is_active: true,
          status: 'Active'
        }
      ]
    }

    const { data, error } = await supabase
      .from('main_companies')
      .select('id, name, description, industry, priority, is_active, status')
      .eq('is_active', true)
      .order('priority', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching companies:', error)
      // Return empty array instead of throwing error for now
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getActiveCompanies:', error)
    // Return empty array instead of throwing error for now
    return []
  }
}
