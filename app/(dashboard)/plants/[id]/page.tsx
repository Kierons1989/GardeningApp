import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import PlantDetail from '@/components/plants/plant-detail'

interface PlantPageProps {
  params: Promise<{ id: string }>
}

export default async function PlantPage({ params }: PlantPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch plant
  const { data: plant, error } = await supabase
    .from('plants')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !plant) {
    notFound()
  }

  // Fetch task history for this plant
  const { data: taskHistory } = await supabase
    .from('task_history')
    .select('*')
    .eq('plant_id', id)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <PlantDetail
      plant={plant}
      taskHistory={taskHistory || []}
    />
  )
}
