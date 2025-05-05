"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  onImageChange: (imageUrl: string | null) => void
  initialImage?: string | null
  className?: string
}

export function ImageUpload({ onImageChange, initialImage = null, className = "" }: ImageUploadProps) {
  const [image, setImage] = useState<string | null>(initialImage)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setImage(initialImage)
  }, [initialImage])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      // Verificar el tamaño del archivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("La imagen es demasiado grande. El tamaño máximo es de 5MB.")
      }

      // Verificar el tipo de archivo
      if (!file.type.startsWith("image/")) {
        throw new Error("El archivo seleccionado no es una imagen.")
      }

      // En lugar de usar FileReader para convertir a base64, vamos a usar una URL temporal
      // Esto es solo para la vista previa local
      const imageUrl = URL.createObjectURL(file)
      setImage(imageUrl)

      // Para enviar a Shopify, necesitamos subir la imagen a un servidor y obtener una URL pública
      // Por ahora, usaremos un servicio de placeholder para demostración
      // En producción, deberías implementar una función para subir la imagen a un servicio como Cloudinary, AWS S3, etc.
      const placeholderUrl = `https://placehold.co/600x400?text=${encodeURIComponent(file.name)}`

      // Notificar al componente padre sobre la nueva URL de la imagen
      onImageChange(placeholderUrl)
    } catch (err) {
      setError(err.message || "Error al cargar la imagen")
      console.error("Error al cargar la imagen:", err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setImage(null)
    onImageChange(null)
    setError(null)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {image ? (
        <div className="relative">
          <div className="relative w-full h-64 border rounded-md overflow-hidden">
            <Image src={image || "/placeholder.svg"} alt="Imagen del producto" fill style={{ objectFit: "contain" }} />
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Eliminar imagen</span>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-12 text-center">
          <Upload className="h-12 w-12 text-gray-400 mb-4" />
          <div className="space-y-1">
            <p className="text-sm text-gray-500">
              <span className="font-medium text-primary">Haz clic para subir</span> o arrastra y suelta
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 5MB</p>
          </div>
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleImageChange}
            accept="image/*"
            disabled={isUploading}
          />
        </div>
      )}

      {isUploading && <p className="text-sm text-amber-600">Subiendo imagen...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
        <p className="text-sm text-yellow-800">
          <strong>Nota:</strong> Para esta versión de demostración, estamos usando URLs de placeholder. En producción,
          necesitarás implementar un servicio de almacenamiento de imágenes como Cloudinary o AWS S3.
        </p>
      </div>
    </div>
  )
}
