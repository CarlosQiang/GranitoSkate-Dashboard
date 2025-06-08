"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, X, Package } from "lucide-react"
import Image from "next/image"

interface Producto {
  id: string
  title: string
  handle: string
  images?: { url: string }[]
  variants?: { price: string }[]
}

interface SelectorProductosProps {
  productosSeleccionados: string[]
  onChange: (productos: string[]) => void
}

export function SelectorProductos({ productosSeleccionados, onChange }: SelectorProductosProps) {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(false)
  const [busqueda, setBusqueda] = useState("")
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([])

  useEffect(() => {
    cargarProductos()
  }, [])

  useEffect(() => {
    if (busqueda.trim()) {
      const filtrados = productos.filter((producto) => producto.title.toLowerCase().includes(busqueda.toLowerCase()))
      setProductosFiltrados(filtrados)
    } else {
      setProductosFiltrados(productos)
    }
  }, [busqueda, productos])

  const cargarProductos = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/shopify/products")
      if (response.ok) {
        const data = await response.json()
        setProductos(data.products || [])
      }
    } catch (error) {
      console.error("Error cargando productos:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleProducto = (productoId: string) => {
    const nuevosSeleccionados = productosSeleccionados.includes(productoId)
      ? productosSeleccionados.filter((id) => id !== productoId)
      : [...productosSeleccionados, productoId]

    onChange(nuevosSeleccionados)
  }

  const removerProducto = (productoId: string) => {
    onChange(productosSeleccionados.filter((id) => id !== productoId))
  }

  const productosSeleccionadosData = productos.filter((p) => productosSeleccionados.includes(p.id))

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Productos seleccionados ({productosSeleccionados.length})</Label>
        {productosSeleccionados.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {productosSeleccionadosData.map((producto) => (
              <Badge key={producto.id} variant="secondary" className="flex items-center gap-2">
                {producto.title}
                <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => removerProducto(producto.id)}>
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No hay productos seleccionados</p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Seleccionar productos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="text-center py-4">
              <p>Cargando productos...</p>
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2">
              {productosFiltrados.map((producto) => (
                <div key={producto.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                  <Checkbox
                    checked={productosSeleccionados.includes(producto.id)}
                    onCheckedChange={() => toggleProducto(producto.id)}
                  />
                  {producto.images?.[0] && (
                    <Image
                      src={producto.images[0].url || "/placeholder.svg"}
                      alt={producto.title}
                      width={40}
                      height={40}
                      className="rounded object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{producto.title}</p>
                    {producto.variants?.[0] && (
                      <p className="text-sm text-muted-foreground">Desde €{producto.variants[0].price}</p>
                    )}
                  </div>
                </div>
              ))}
              {productosFiltrados.length === 0 && !loading && (
                <p className="text-center text-muted-foreground py-4">No se encontraron productos</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
