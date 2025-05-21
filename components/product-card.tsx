"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { useState } from "react"
import { Package, Tag, Calendar, Eye } from "lucide-react"

export function ProductCard({ product }) {
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Asegurarse de que el producto tiene todas las propiedades necesarias
  const {
    id,
    title = "Producto sin título",
    titulo = title, // Soporte para ambos nombres de propiedad
    price = 0,
    precio = price, // Soporte para ambos nombres de propiedad
    compareAtPrice,
    currencyCode = "EUR",
    status = "ACTIVE",
    estado = status, // Soporte para ambos nombres de propiedad
    productType,
    createdAt,
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

  // Determinar si hay un descuento
  const hasDiscount = compareAtPrice && Number(compareAtPrice) > Number(price)

  // Calcular el porcentaje de descuento
  const discountPercentage = hasDiscount ? Math.round((1 - Number(price) / Number(compareAtPrice)) * 100) : 0

  // Formatear la fecha de creación
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null

  return (
    <Link
      href={`/dashboard/products/${cleanId(id)}`}
      className="block h-full transition-transform duration-200 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="overflow-hidden h-full flex flex-col border-gray-200 dark:border-gray-800 transition-all duration-200 hover:shadow-md">
        <div className="aspect-square relative bg-gray-100 dark:bg-gray-800 overflow-hidden">
          {!imageError && imageUrl ? (
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt={titulo || title}
              fill
              className="object-cover transition-transform duration-500 ease-in-out"
              style={{ transform: isHovered ? "scale(1.05)" : "scale(1)" }}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
          )}

          {/* Etiquetas superpuestas */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {(estado || status) !== "ACTIVE" && (
              <Badge variant="secondary" className="bg-gray-800 text-white dark:bg-gray-700">
                {(estado || status) === "DRAFT" ? "Borrador" : "Archivado"}
              </Badge>
            )}

            {hasDiscount && <Badge className="bg-red-500 text-white">-{discountPercentage}%</Badge>}
          </div>

          {/* Overlay con botón de vista rápida al hacer hover */}
          <div
            className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <Badge variant="secondary" className="bg-white text-gray-800 flex items-center gap-1 px-3 py-1">
              <Eye className="h-3.5 w-3.5" />
              Ver detalles
            </Badge>
          </div>
        </div>

        <CardContent className="p-4 flex-grow">
          <div className="space-y-2">
            <h3 className="font-medium line-clamp-2 h-12">{titulo || title}</h3>

            {productType && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Tag className="h-3.5 w-3.5 mr-1" />
                {productType}
              </div>
            )}

            {formattedDate && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                {formattedDate}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 border-t mt-auto">
          <div className="w-full flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-bold text-granito-700">{formatCurrency(precio || price, currencyCode)}</span>
              {hasDiscount && (
                <span className="text-sm line-through text-gray-500">
                  {formatCurrency(compareAtPrice, currencyCode)}
                </span>
              )}
            </div>
            {(estado || status) === "ACTIVE" && (
              <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                Activo
              </Badge>
            )}
          </div>
        </CardFooter>
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
