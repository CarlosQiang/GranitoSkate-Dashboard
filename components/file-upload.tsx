"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Loader2 } from "lucide-react"
import Image from "next/image"

interface FileUploadProps {
  assetType: string
  currentUrl: string | null
  onUploadComplete: (url: string) => void
  onDelete: () => void
  accept?: string
  maxSize?: number // en bytes
  className?: string
  aspectRatio?: "square" | "landscape" | "portrait"
  width?: number
  height?: number
}

export function FileUpload({
  assetType,
  currentUrl,
  onUploadComplete,
  onDelete,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB por defecto
  className = "",
  aspectRatio = "square",
  width = 200,
  height = 200,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamaño
    if (file.size > maxSize) {
      setError(`El archivo es demasiado grande. Máximo ${maxSize / (1024 * 1024)}MB`)
      return
    }

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten archivos de imagen")
      return
    }

    setError(null)
    setIsUploading(true)
    setUploadProgress(0)

    // Crear un objeto URL para la vista previa
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    // Simular progreso
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("assetType", assetType)

      const response = await fetch("/api/theme/assets", {
        method: "POST",
        body: formData,
      })

      clearInterval(interval)
      setUploadProgress(100)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Error desconocido" }))
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Limpiar la vista previa temporal y usar la URL real
      URL.revokeObjectURL(objectUrl)
      setPreviewUrl(data.asset.filePath)

      // Notificar al componente padre
      onUploadComplete(data.asset.filePath)
    } catch (err: any) {
      console.error("Error al subir archivo:", err)
      setError(err.message || "Error al cargar el archivo")
      setPreviewUrl(currentUrl) // Restaurar la URL anterior
    } finally {
      setIsUploading(false)
      setUploadProgress(0)

      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDelete = async () => {
    if (!currentUrl) return

    try {
      const response = await fetch(`/api/theme/assets?type=${assetType}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al eliminar el archivo")
      }

      setPreviewUrl(null)
      onDelete()
    } catch (err: any) {
      setError(err.message || "Error al eliminar el archivo")
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Calcular dimensiones basadas en el aspect ratio
  let containerStyle: React.CSSProperties = {}
  if (aspectRatio === "landscape") {
    containerStyle = { width, height: height || width * 0.75 }
  } else if (aspectRatio === "portrait") {
    containerStyle = { width, height: height || width * 1.33 }
  } else {
    containerStyle = { width, height: height || width }
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div
        className="relative border-2 border-dashed rounded-md flex items-center justify-center overflow-hidden bg-muted/30"
        style={containerStyle}
      >
        {previewUrl ? (
          <>
            <Image src={previewUrl || "/placeholder.svg"} alt="Vista previa" fill className="object-contain" />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white text-black hover:bg-gray-200"
                  onClick={triggerFileInput}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Cambiar
                </Button>
                <Button size="sm" variant="destructive" onClick={handleDelete}>
                  <X className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">Arrastra y suelta o haz clic para subir</p>
            <p className="text-xs text-muted-foreground">
              {accept.replace("image/*", "JPG, PNG, GIF, SVG")} (máx. {maxSize / (1024 * 1024)}MB)
            </p>
            {isUploading && (
              <div className="w-full mt-2">
                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-center mt-1">{uploadProgress}%</p>
              </div>
            )}
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        )}
      </div>

      {!previewUrl && (
        <Button type="button" variant="outline" size="sm" onClick={triggerFileInput} disabled={isUploading}>
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Subir archivo
            </>
          )}
        </Button>
      )}

      {error && <p className="text-sm text-destructive mt-1">{error}</p>}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept}
        onChange={handleFileChange}
        disabled={isUploading}
      />
    </div>
  )
}
