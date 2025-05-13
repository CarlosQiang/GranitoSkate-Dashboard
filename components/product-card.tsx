"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { useState } from "react"
import { Package } from "lucide-react"

export function ProductCard({ product }) {
  const [imageError, setImageError] = useState(false)

  // Asegurarse de que el producto tiene todas las propiedades necesarias
  const {
    id,
    title = "Producto sin título",
    titulo = title, // Soporte para ambos nombres de propiedad
    price = 0,
    precio = price, // Soporte para ambos nombres de propiedad
    currencyCode = "EUR",
    status = "ACTIVE",
    estado = status, // Soporte para ambos nombres de propiedad
  } = product || {}

  // Intentar obtener la URL de la imagen de diferentes propiedades
  const imageUrl = getImageUrl(product)

  // Función para extraer el ID limpio
  const cleanId = (id) => {
    if (!id) return ""
    if (typeof id === "string" && id.includes("/")) {
      return id.split("/").pop()
    }
    return id
  }

  return (
    <Link href={`/dashboard/products/${cleanId(id)}`} className="block">
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <div className="aspect-square relative bg-muted">
          {!imageError && imageUrl ? (
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt={titulo || title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium line-clamp-1">{titulo || title}</h3>
          <div className="flex items-center justify-between mt-2">
            <span className="font-bold">{formatCurrency(precio || price, currencyCode)}</span>
            <Badge variant={(estado || status) === "ACTIVE" ? "default" : "secondary"}>
              {(estado || status) === "ACTIVE" ? "Activo" : "Borrador"}
            </Badge>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">ID: {cleanId(id)}</CardFooter>
      </Card>
    </Link>
  )
}

// Función auxiliar para obtener la URL de la imagen
function getImageUrl(product) {
  if (!product) return null

  // Intentar obtener la imagen de diferentes propiedades
  if (product.imagen) return product.imagen
  if (product.image) return typeof product.image === "string" ? product.image : product.image?.url || product.image?.src

  if (product.featuredImage) return product.featuredImage.url || product.featuredImage.src

  if (product.imagenes && product.imagenes.length > 0) {
    return product.imagenes[0].src || product.imagenes[0].url
  }

  if (product.images && product.images.length > 0) {
    return typeof product.images[0] === "string" ? product.images[0] : product.images[0]?.url || product.images[0]?.src
  }

  // Si hay edges en las imágenes (formato GraphQL)
  if (product.images && product.images.edges && product.images.edges.length > 0) {
    return product.images.edges[0].node.url || product.images.edges[0].node.src
  }

  return null
}
