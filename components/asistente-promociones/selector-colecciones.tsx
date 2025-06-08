"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, FolderOpen, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Coleccion {
  id: string
  title: string
  handle: string
  products_count: number
  published_at: string
  image?: { src: string }
}

interface SelectorColeccionesProps {
  coleccionesSeleccionadas: string[]
  onChange: (colecciones: string[]) => void
}

export function SelectorColecciones({ coleccionesSeleccionadas, onChange }: SelectorColeccionesProps) {
  const [colecciones, setColecciones] = useState<Coleccion[]>([])
  const [loading, setLoading] = useState(false)
  const [busqueda, setBusqueda] = useState("")
  const [coleccionesFiltradas, setColeccionesFiltradas] = useState<Coleccion[]>([])
  const { toast } = useToast()

  useEffect(() => {
    cargarColecciones()
  }, [])

  useEffect(() => {
    if (busqueda.trim()) {
      const filtradas = colecciones.filter((coleccion) =>
        coleccion.title.toLowerCase().includes(busqueda.toLowerCase()),
      )
      setColeccionesFiltradas(filtradas)
    } else {
      setColeccionesFiltradas(colecciones)
    }
  }, [busqueda, colecciones])

  const cargarColecciones = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/shopify/collections", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && Array.isArray(data.collections)) {
          setColecciones(data.collections)
          setColeccionesFiltradas(data.collections)
        }
      } else {
        throw new Error("Error al cargar colecciones")
      }
    } catch (error) {
      console.error("Error al cargar colecciones:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las colecciones",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleColeccion = (coleccionId: string) => {
    const nuevasSeleccionadas = coleccionesSeleccionadas.includes(coleccionId)
      ? coleccionesSeleccionadas.filter((id) => id !== coleccionId)
      : [...coleccionesSeleccionadas, coleccionId]

    onChange(nuevasSeleccionadas)
  }

  const removerColeccion = (coleccionId: string) => {
    onChange(coleccionesSeleccionadas.filter((id) => id !== coleccionId))
  }

  const obtenerColeccionPorId = (id: string) => {
    return colecciones.find((c) => c.id === id)
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="busqueda">Buscar colecciones</Label>
        <div className="relative mt-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="busqueda"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre..."
            className="pl-10"
          />
        </div>
      </div>

      {coleccionesSeleccionadas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Colecciones seleccionadas ({coleccionesSeleccionadas.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {coleccionesSeleccionadas.map((id) => {
                const coleccion = obtenerColeccionPorId(id)
                return (
                  <Badge key={id} variant="secondary" className="flex items-center gap-1">
                    {coleccion?.title || id}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removerColeccion(id)}
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
          <CardTitle className="text-sm">Colecciones disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Cargando colecciones...</div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {coleccionesFiltradas.map((coleccion) => (
                <div key={coleccion.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
                  <Checkbox
                    id={coleccion.id}
                    checked={coleccionesSeleccionadas.includes(coleccion.id)}
                    onCheckedChange={() => toggleColeccion(coleccion.id)}
                  />
                  <div className="flex items-center space-x-3 flex-1">
                    {coleccion.image?.src ? (
                      <img
                        src={coleccion.image.src || "/placeholder.svg"}
                        alt={coleccion.title}
                        className="h-10 w-10 rounded-md object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                        <FolderOpen className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <Label htmlFor={coleccion.id} className="text-sm font-medium cursor-pointer">
                        {coleccion.title}
                      </Label>
                      <p className="text-xs text-muted-foreground">{coleccion.products_count} productos</p>
                    </div>
                  </div>
                </div>
              ))}
              {coleccionesFiltradas.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  {busqueda ? "No se encontraron colecciones" : "No hay colecciones disponibles"}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
