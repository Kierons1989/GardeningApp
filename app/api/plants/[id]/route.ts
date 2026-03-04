import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getOwnerUserId } from '@/lib/supabase/owner'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: plantId } = await params
    const supabase = createAdminClient()
    const userId = getOwnerUserId()

    // Verify plant belongs to owner
    const { data: plant, error: fetchError } = await supabase
      .from('plants')
      .select('id, user_id, photo_url')
      .eq('id', plantId)
      .eq('user_id', userId)
      .single()

    if (fetchError || !plant) {
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 })
    }

    // Delete storage files if image exists
    if (plant.photo_url) {
      const { data: files } = await supabase.storage
        .from('plant-images')
        .list(`${userId}/${plantId}`)

      if (files && files.length > 0) {
        const paths = files.map(f => `${userId}/${plantId}/${f.name}`)
        await supabase.storage.from('plant-images').remove(paths)
      }
    }

    // Delete the plant
    const { error } = await supabase
      .from('plants')
      .delete()
      .eq('id', plantId)

    if (error) {
      console.error('Plant deletion error:', error)
      return NextResponse.json({ error: 'Failed to delete plant' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({
      error: `Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`
    }, { status: 500 })
  }
}
