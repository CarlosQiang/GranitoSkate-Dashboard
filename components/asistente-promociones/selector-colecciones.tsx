"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, X, FolderOpen } from "lucide-react"

interface Coleccion {
  id: string
  title: string
  handle: string
  productsCount?: number
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
      const response = await fetch("/api/shopify/collections")
      if (response.ok) {
        const data = await response.json()
        setColecciones(data.collections || [])
      }
    } catch (error) {
      console.error("Error cargando colecciones:", error)
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

  const coleccionesSeleccionadasData = colecciones.filter((c) => coleccionesSeleccionadas.includes(c.id))

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Colecciones seleccionadas ({coleccionesSeleccionadas.length})</Label>
        {coleccionesSeleccionadas.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {coleccionesSeleccionadasData.map((coleccion) => (
              <Badge key={coleccion.id} variant="secondary" className="flex items-center gap-2">
                {coleccion.title}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => removerColeccion(coleccion.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No hay colecciones seleccionadas</p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Seleccionar colecciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar colecciones..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="text-center py-4">
              <p>Cargando colecciones...</p>
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2">
              {coleccionesFiltradas.map((coleccion) => (
                <div key={coleccion.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                  <Checkbox
                    checked={coleccionesSeleccionadas.includes(coleccion.id)}
                    onCheckedChange={() => toggleColeccion(coleccion.id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{coleccion.title}</p>
                    {coleccion.productsCount !== undefined && (
                      <p className="text-sm text-muted-foreground">{coleccion.productsCount} productos</p>
                    )}
                  </div>
                </div>
              ))}
              {coleccionesFiltradas.length === 0 && !loading && (
                <p className="text-center text-muted-foreground py-4">No se encontraron colecciones</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
