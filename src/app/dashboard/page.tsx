import { redirect } from 'next/navigation'
import { createClient } from '../../utils/supabase/server' // Updated path
import BabyLogContent from '../components/BabyLogContent' // Updated path

export default async function BabyLogPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Authentication error:', error.message)
    redirect('/login')
  }

  if (!data?.user) {
    console.warn('No authenticated user found')
    redirect('/login')
  }

  return <BabyLogContent user={data.user} />
}
