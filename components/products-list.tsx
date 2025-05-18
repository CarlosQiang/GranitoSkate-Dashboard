"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import Link from "next/link"

export function ProductsList({ products = [], onRefresh }) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No hay productos disponibles.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onRefresh={onRefresh} />
      ))}
    </div>
  )
}

function ProductCard({ product, onRefresh }) {
  const [isDeleting, setIsDeleting] = useState(false)

  // Función para eliminar un producto
  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      return
    }

    setIsDeleting(true)
    try {
      // Simulamos la eliminación
      console.log("Eliminando producto:", product.id)
      setTimeout(() => {
        onRefresh()
      }, 1000)
    } catch (error) {
      console.error("Error al eliminar producto:", error)
      alert("No se pudo eliminar el producto. Intente nuevamente más tarde.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative bg-muted">
        {product.image ? (
          <img src={product.image || "/placeholder.svg"} alt={product.title} className="object-cover w-full h-full" />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <span className="text-gray-400">Sin imagen</span>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium truncate">{product.title}</h3>
          <span className="text-sm px-2 py-1 rounded-full bg-gray-100">
            {product.status === "ACTIVE" ? "Activo" : product.status === "DRAFT" ? "Borrador" : "Archivado"}
          </span>
        </div>
        <div className="text-sm text-muted-foreground mb-4">
          <p>Precio: {typeof product.price === "undefined" ? "N/A" : `${product.price} €`}</p>
          <p>Inventario: {typeof product.inventoryQuantity === "undefined" ? "N/A" : product.inventoryQuantity}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/products/${product.id}`}>
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handleDelete} disabled={isDeleting}>
            <Trash2 className="h-4 w-4 mr-1" />
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
