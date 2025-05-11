"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, ImageIcon } from "lucide-react"
import Image from "next/image"

export function ImageUpload({ onImageChange, initialImage = null }) {
  const [preview, setPreview] = useState(initialImage)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef(null)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecciona un archivo de imagen válido")
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no debe superar los 5MB")
      return
    }

    setError("")
    setIsUploading(true)

    try {
      // Crear una URL para previsualizar la imagen
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)

      // Convertir la imagen a base64 para enviarla a Shopify
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const base64String = reader.result
        onImageChange(base64String)
        setIsUploading(false)
      }
    } catch (err) {
      console.error("Error al procesar la imagen:", err)
      setError("Error al procesar la imagen. Inténtalo de nuevo.")
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreview(null)
    onImageChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative w-full aspect-square max-w-md">
          <Image src={preview || "/placeholder.svg"} alt="Vista previa" fill className="object-cover rounded-md" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Eliminar imagen</span>
          </Button>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="p-3 bg-primary/10 rounded-full">
              <ImageIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Arrastra una imagen o haz clic para seleccionar</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG o WEBP (máx. 5MB)</p>
            </div>
            <Button type="button" variant="secondary" size="sm" disabled={isUploading} className="mt-2">
              {isUploading ? (
                <>Subiendo...</>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Seleccionar imagen
                </>
              )}
            </Button>
          </div>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
    </div>
  )
}
