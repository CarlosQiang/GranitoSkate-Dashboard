"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Package, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Producto {
  id: string
  title: string
  handle: string
  vendor: string
  product_type: string
  status: string
  images?: Array<{ src: string }>
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
  const { toast } = useToast()

  useEffect(() => {
    cargarProductos()
  }, [])

  useEffect(() => {
    if (busqueda.trim()) {
      const filtrados = productos.filter(
        (producto) =>
          producto.title.toLowerCase().includes(busqueda.toLowerCase()) ||
          producto.vendor.toLowerCase().includes(busqueda.toLowerCase()) ||
          producto.product_type.toLowerCase().includes(busqueda.toLowerCase()),
      )
      setProductosFiltrados(filtrados)
    } else {
      setProductosFiltrados(productos)
    }
  }, [busqueda, productos])

  const cargarProductos = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/shopify/products", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && Array.isArray(data.products)) {
          setProductos(data.products)
          setProductosFiltrados(data.products)
        }
      } else {
        throw new Error("Error al cargar productos")
      }
    } catch (error) {
      console.error("Error al cargar productos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      })
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

  const obtenerProductoPorId = (id: string) => {
    return productos.find((p) => p.id === id)
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="busqueda">Buscar productos</Label>
        <div className="relative mt-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="busqueda"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, marca o tipo..."
            className="pl-10"
          />
        </div>
      </div>

      {productosSeleccionados.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Productos seleccionados ({productosSeleccionados.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {productosSeleccionados.map((id) => {
                const producto = obtenerProductoPorId(id)
                return (
                  <Badge key={id} variant="secondary" className="flex items-center gap-1">
                    {producto?.title || id}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removerProducto(id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Productos disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Cargando productos...</div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {productosFiltrados.map((producto) => (
                <div key={producto.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
                  <Checkbox
                    id={producto.id}
                    checked={productosSeleccionados.includes(producto.id)}
                    onCheckedChange={() => toggleProducto(producto.id)}
                  />
                  <div className="flex items-center space-x-3 flex-1">
                    {producto.images?.[0]?.src ? (
                      <img
                        src={producto.images[0].src || "/placeholder.svg"}
                        alt={producto.title}
                        className="h-10 w-10 rounded-md object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <Label htmlFor={producto.id} className="text-sm font-medium cursor-pointer">
                        {producto.title}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {producto.vendor} • {producto.product_type}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {productosFiltrados.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  {busqueda ? "No se encontraron productos" : "No hay productos disponibles"}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
