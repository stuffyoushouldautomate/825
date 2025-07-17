import { Chat } from '@/components/chat'
import { getModels } from '@/lib/config/models'
import { createClient } from '@/lib/supabase/server'
import { generateId } from 'ai'
import { redirect } from 'next/navigation'

export default async function Page() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const id = generateId()
  const models = await getModels()
  return <Chat id={id} models={models} />
}
