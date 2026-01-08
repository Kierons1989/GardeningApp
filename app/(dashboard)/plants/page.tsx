import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PlantList from '@/components/plants/plant-list'

export default async function PlantsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: plants } = await supabase
    .from('plants')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <PlantList plants={plants || []} />
}
