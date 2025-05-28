"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { Package, Tag, Calendar, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

// Función helper para formatear moneda
const formatCurrency = (amount: number | string, currency = "EUR") => {
  const num = typeof amount === "string" ? Number.parseFloat(amount) : amount
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currency,
  }).format(num || 0)
}

// Función helper para limpiar IDs
const cleanId = (id: string | undefined) => {
  if (!id) return ""
  if (typeof id === "string" && id.includes("/")) {
    return id.split("/").pop() || ""
  }
  return id
}

// Función helper para obtener URL de imagen
const getImageUrl = (product: any) => {
  if (!product) return null

  if (product.imagen) return product.imagen
  if (product.image) return typeof product.image === "string" ? product.image : product.image?.url || product.image?.src

  if (product.featuredImage) return product.featuredImage.url || product.featuredImage.src

  if (product.imagenes && product.imagenes.length > 0) {
    return product.imagenes[0].src || product.imagenes[0].url
  }

  if (product.images && product.images.length > 0) {
    return typeof product.images[0] === "string" ? product.images[0] : product.images[0]?.url || product.images[0]?.src
  }

  if (product.images && product.images.edges && product.images.edges.length > 0) {
    return product.images.edges[0].node.url || product.images.edges[0].node.src
  }

  return null
}

export function ProductCard({ product }: { product: any }) {
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const {
    id,
    title = "Producto sin título",
    titulo = title,
    price = 0,
    precio = price,
    compareAtPrice,
    currencyCode = "EUR",
    status = "ACTIVE",
    estado = status,
    productType,
    createdAt,
  } = product || {}

  const imageUrl = getImageUrl(product)

  const hasDiscount = compareAtPrice && Number(compareAtPrice) > Number(price)
  const discountPercentage = hasDiscount ? Math.round((1 - Number(price) / Number(compareAtPrice)) * 100) : 0

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
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      <Card
        className={cn(
          "overflow-hidden h-full flex flex-col border-gray-200 dark:border-gray-800",
          "transition-all duration-200 hover:shadow-md",
          isMobile && "active:scale-95",
        )}
      >
        <div className="aspect-square relative bg-gray-100 dark:bg-gray-800 overflow-hidden">
          {!imageError && imageUrl ? (
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt={titulo || title}
              fill
              className={cn(
                "object-cover transition-transform duration-500 ease-in-out",
                !isMobile && isHovered && "scale-105",
              )}
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
              <Badge variant="secondary" className="bg-gray-800 text-white dark:bg-gray-700 text-xs">
                {(estado || status) === "DRAFT" ? "Borrador" : "Archivado"}
              </Badge>
            )}

            {hasDiscount && <Badge className="bg-red-500 text-white text-xs">-{discountPercentage}%</Badge>}
          </div>

          {/* Overlay con botón de vista rápida (solo desktop) */}
          {!isMobile && (
            <div
              className={cn(
                "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200",
                isHovered ? "opacity-100" : "opacity-0",
              )}
            >
              <Badge variant="secondary" className="bg-white text-gray-800 flex items-center gap-1 px-3 py-1">
                <Eye className="h-3.5 w-3.5" />
                Ver detalles
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4 flex-grow">
          <div className="space-y-2">
            <h3 className="font-medium line-clamp-2 h-12 text-sm sm:text-base">{titulo || title}</h3>

            {productType && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Tag className="h-3.5 w-3.5 mr-1" />
                <span className="truncate">{productType}</span>
              </div>
            )}

            {formattedDate && !isMobile && (
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
              <span className="font-bold text-yellow-700 text-sm sm:text-base">
                {formatCurrency(precio || price, currencyCode)}
              </span>
              {hasDiscount && (
                <span className="text-xs line-through text-gray-500">
                  {formatCurrency(compareAtPrice, currencyCode)}
                </span>
              )}
            </div>
            {(estado || status) === "ACTIVE" && (
              <Badge
                variant="default"
                className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs"
              >
                Activo
              </Badge>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
