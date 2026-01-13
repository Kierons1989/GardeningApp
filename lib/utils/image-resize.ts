export interface ResizeOptions {
  maxWidth: number
  maxHeight: number
  quality: number
  outputType: 'image/jpeg' | 'image/webp'
}

const DEFAULT_OPTIONS: ResizeOptions = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.85,
  outputType: 'image/jpeg',
}

export async function resizeImage(
  file: File,
  options: Partial<ResizeOptions> = {}
): Promise<Blob> {
  const { maxWidth, maxHeight, quality, outputType } = {
    ...DEFAULT_OPTIONS,
    ...options,
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    img.onload = () => {
      URL.revokeObjectURL(img.src)

      let { width, height } = img

      // Calculate new dimensions maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      canvas.width = width
      canvas.height = height

      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      // Draw with high-quality settings
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create blob'))
          }
        },
        outputType,
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new Error('Failed to load image'))
    }

    img.src = URL.createObjectURL(file)
  })
}

const MAX_SIZE = 3 * 1024 * 1024 // 3MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Please upload a JPEG, PNG, or WebP image' }
  }

  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'Image must be under 3MB' }
  }

  return { valid: true }
}
