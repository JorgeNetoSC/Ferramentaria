'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Camera, Upload, X, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PhotoUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  folder?: string
  label?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export function PhotoUpload({
  value,
  onChange,
  folder = 'uploads',
  label = 'Foto',
  required = false,
  disabled = false,
  className,
}: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Falha no upload')
      }

      const { url } = await response.json()
      onChange(url)
      toast.success('Foto enviada com sucesso')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar foto')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setIsCameraOpen(true)
    } catch (error) {
      console.error('Camera error:', error)
      toast.error('Não foi possível acessar a câmera')
    }
  }

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsCameraOpen(false)
  }

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
        closeCamera()
        await handleFileUpload(file)
      }
    }, 'image/jpeg', 0.8)
  }

  const removePhoto = () => {
    onChange(null)
  }

  if (isCameraOpen) {
    return (
      <div className={cn('space-y-3', className)}>
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={closeCamera}
            >
              <X className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              size="icon"
              onClick={capturePhoto}
              className="w-14 h-14 rounded-full"
            >
              <Camera className="h-6 w-6" />
            </Button>
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>

      {value ? (
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          <Image
            src={value}
            alt="Foto enviada"
            fill
            className="object-cover"
          />
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={removePhoto}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Spinner className="h-8 w-8" />
              <p className="text-sm text-muted-foreground">Enviando...</p>
            </div>
          ) : (
            <>
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Tire uma foto ou faça upload de um arquivo
              </p>
              <div className="flex justify-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={openCamera}
                  disabled={disabled}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Câmera
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
      />
    </div>
  )
}
