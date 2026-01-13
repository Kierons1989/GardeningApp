'use client'

import { useState, useCallback, useRef, useImperativeHandle, forwardRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from '@/components/ui/icon'
import { resizeImage, validateImageFile } from '@/lib/utils/image-resize'
import { createClient } from '@/lib/supabase/client'

interface ImageUploadProps {
  plantId?: string
  userId: string
  currentImageUrl?: string | null
  onImageChange?: (url: string | null) => void
  onPendingImageChange?: (blob: Blob | null) => void
}

export interface ImageUploadRef {
  uploadPendingImage: (plantId: string) => Promise<string | null>
}

const ImageUpload = forwardRef<ImageUploadRef, ImageUploadProps>(function ImageUpload(
  { plantId, userId, currentImageUrl, onImageChange, onPendingImageChange },
  ref
) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const pendingBlobRef = useRef<Blob | null>(null)

  const uploadToStorage = useCallback(async (blob: Blob, targetUserId: string, targetPlantId: string): Promise<string> => {
    const supabase = createClient()
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const extension = blob.type === 'image/webp' ? 'webp' : 'jpg'
    const filePath = `${targetUserId}/${targetPlantId}/${timestamp}-${random}.${extension}`

    const { error: uploadError } = await supabase.storage
      .from('plant-images')
      .upload(filePath, blob, {
        contentType: blob.type,
        upsert: false,
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('plant-images')
      .getPublicUrl(filePath)

    return publicUrl
  }, [])

  useImperativeHandle(ref, () => ({
    uploadPendingImage: async (targetPlantId: string): Promise<string | null> => {
      if (!pendingBlobRef.current) return null

      setUploading(true)
      setProgress(50)

      try {
        const url = await uploadToStorage(pendingBlobRef.current, userId, targetPlantId)
        setProgress(100)
        pendingBlobRef.current = null
        return url
      } catch (err) {
        console.error('Upload error:', err)
        setError('Failed to upload image')
        return null
      } finally {
        setUploading(false)
      }
    }
  }), [userId, uploadToStorage])

  const handleFile = useCallback(async (file: File) => {
    setError(null)

    const validation = validateImageFile(file)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      return
    }

    try {
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)
      setProgress(10)

      const resizedBlob = await resizeImage(file)
      setProgress(30)

      if (plantId) {
        // Edit mode: upload immediately
        setUploading(true)
        setProgress(50)

        try {
          const url = await uploadToStorage(resizedBlob, userId, plantId)
          setProgress(100)
          onImageChange?.(url)
        } catch (err) {
          console.error('Upload error:', err)
          setError('Failed to upload image. Please try again.')
          setPreview(null)
        } finally {
          setUploading(false)
        }
      } else {
        // Create mode: store blob for later upload
        pendingBlobRef.current = resizedBlob
        onPendingImageChange?.(resizedBlob)
        setProgress(100)
      }
    } catch (err) {
      console.error('Image processing error:', err)
      setError('Failed to process image. Please try again.')
      setPreview(null)
    }
  }, [plantId, userId, onImageChange, onPendingImageChange, uploadToStorage])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [handleFile])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }, [handleFile])

  const handleRemove = useCallback(() => {
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview)
    }
    setPreview(null)
    pendingBlobRef.current = null
    if (inputRef.current) inputRef.current.value = ''
    onPendingImageChange?.(null)
    onImageChange?.(null)
  }, [preview, onImageChange, onPendingImageChange])

  return (
    <div className="space-y-3">
      <label className="label">Photo (optional)</label>

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative inline-block"
          >
            <div
              className="relative w-32 h-32 rounded-2xl overflow-hidden"
              style={{ background: 'var(--stone-100)' }}
            >
              <Image
                src={preview}
                alt="Plant preview"
                fill
                className="object-cover"
              />

              {uploading && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.9)' }}
                >
                  <div className="text-center">
                    <motion.div
                      className="w-10 h-10 rounded-full mx-auto mb-2"
                      style={{
                        border: '3px solid var(--sage-200)',
                        borderTopColor: 'var(--sage-600)',
                      }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {progress}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {!uploading && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                style={{
                  background: 'var(--error)',
                  color: 'white',
                }}
              >
                <Icon name="X" size={14} weight="bold" ariaLabel="Remove image" />
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all"
              style={{
                borderColor: dragActive ? 'var(--sage-500)' : 'var(--stone-300)',
                background: dragActive ? 'var(--sage-50)' : 'transparent',
              }}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleInputChange}
                className="hidden"
              />

              <div
                className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                style={{ background: 'var(--sage-100)' }}
              >
                <Icon
                  name="Camera"
                  size={24}
                  weight="light"
                  style={{ color: 'var(--sage-600)' }}
                  ariaLabel="Upload"
                />
              </div>

              <p className="font-medium mb-1 text-sm" style={{ color: 'var(--text-primary)' }}>
                {dragActive ? 'Drop image here' : 'Add a photo'}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Drag and drop or click to browse
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm"
            style={{ color: 'var(--error)' }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
})

export default ImageUpload
