import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getOwnerUserId } from '@/lib/supabase/owner'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: plantId } = await params
    const supabase = createAdminClient()
    const userId = getOwnerUserId()

    const { data: plant, error: plantError } = await supabase
      .from('plants')
      .select('id, user_id, photo_url')
      .eq('id', plantId)
      .single()

    if (plantError || !plant) {
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 })
    }

    if (plant.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    if (file.size > 3 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 3MB)' }, { status: 400 })
    }

    // Delete old image if exists
    if (plant.photo_url) {
      const oldPath = extractPathFromUrl(plant.photo_url)
      if (oldPath) {
        await supabase.storage.from('plant-images').remove([oldPath])
      }
    }

    // Upload new image
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const extension = file.type === 'image/webp' ? 'webp' : 'jpg'
    const filePath = `${userId}/${plantId}/${timestamp}-${random}.${extension}`

    const buffer = await file.arrayBuffer()
    const { error: uploadError } = await supabase.storage
      .from('plant-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('plant-images')
      .getPublicUrl(filePath)

    const { error: updateError } = await supabase
      .from('plants')
      .update({ photo_url: publicUrl })
      .eq('id', plantId)

    if (updateError) {
      await supabase.storage.from('plant-images').remove([filePath])
      return NextResponse.json({ error: 'Failed to update plant' }, { status: 500 })
    }

    return NextResponse.json({ photo_url: publicUrl })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({
      error: `Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: plantId } = await params
    const supabase = createAdminClient()
    const userId = getOwnerUserId()

    const { data: plant, error: plantError } = await supabase
      .from('plants')
      .select('id, user_id, photo_url')
      .eq('id', plantId)
      .single()

    if (plantError || !plant) {
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 })
    }

    if (plant.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (plant.photo_url) {
      const path = extractPathFromUrl(plant.photo_url)
      if (path) {
        await supabase.storage.from('plant-images').remove([path])
      }
    }

    await supabase
      .from('plants')
      .update({ photo_url: null })
      .eq('id', plantId)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({
      error: `Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`
    }, { status: 500 })
  }
}

function extractPathFromUrl(url: string): string | null {
  try {
    const match = url.match(/\/plant-images\/(.+)$/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: plantId } = await params
    const supabase = createAdminClient()
    const userId = getOwnerUserId()

    const { data: plant, error: plantError } = await supabase
      .from('plants')
      .select('id, user_id')
      .eq('id', plantId)
      .single()

    if (plantError || !plant) {
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 })
    }

    if (plant.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { photo_url } = body as { photo_url: string }

    if (!photo_url) {
      return NextResponse.json({ error: 'photo_url is required' }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from('plants')
      .update({ photo_url })
      .eq('id', plantId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update plant' }, { status: 500 })
    }

    return NextResponse.json({ photo_url })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({
      error: `Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`
    }, { status: 500 })
  }
}
