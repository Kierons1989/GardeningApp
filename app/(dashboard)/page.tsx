import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardContent from '@/components/dashboard/dashboard-content'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's plants with plant_types relation
  const { data: plants } = await supabase
    .from('plants')
    .select(`
      *,
      plant_types (
        id,
        top_level,
        middle_level,
        growth_habit,
        ai_care_profile
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch recent task history
  const { data: taskHistory } = await supabase
    .from('task_history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <DashboardContent
      plants={plants || []}
      taskHistory={taskHistory || []}
    />
  )
}
