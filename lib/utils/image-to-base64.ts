import { resizeImage } from './image-resize'
import type { ChatMessageImage } from '@/types/database'

const CHAT_IMAGE_OPTIONS = {
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 0.8,
  outputType: 'image/jpeg' as const,
}

export async function prepareImageForChat(file: File): Promise<ChatMessageImage> {
  const resizedBlob = await resizeImage(file, CHAT_IMAGE_OPTIONS)
  const base64 = await blobToBase64(resizedBlob)
  const mediaType = resizedBlob.type as ChatMessageImage['mediaType']

  return {
    base64,
    mediaType,
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export function createImagePreviewUrl(file: File): string {
  return URL.createObjectURL(file)
}

export function revokeImagePreviewUrl(url: string): void {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}
