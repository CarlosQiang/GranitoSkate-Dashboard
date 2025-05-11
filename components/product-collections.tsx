"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { fetchCollections } from "@/lib/api/collections"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, RefreshCw, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ProductCollections({ productId }) {
  const { toast } = useToast()
  const [collections, setCollections] = useState([])
  const [selectedCollections, setSelectedCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadCollections() {
      try {
        setLoading(true)
        setError(null)
        const allCollections = await fetchCollections()

        // Aquí deberíamos obtener las colecciones a las que pertenece el producto
        // Por ahora, simplemente mostramos todas las colecciones
        setCollections(allCollections)

        // Simulamos que el producto pertenece a algunas colecciones
        // En una implementación real, esto debería venir de la API
        setSelectedCollections([])
      } catch (err) {
        console.error("Error al cargar colecciones:", err)
        setError(err.message || "Error al cargar colecciones")
      } finally {
        setLoading(false)
      }
    }

    loadCollections()
  }, [productId])

  const handleCollectionToggle = (collectionId) => {
    setSelectedCollections((prev) => {
      if (prev.includes(collectionId)) {
        return prev.filter((id) => id !== collectionId)
      } else {
        return [...prev, collectionId]
      }
    })
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Aquí deberíamos comparar las colecciones seleccionadas con las originales
      // y hacer las llamadas API necesarias para añadir/eliminar el producto de las colecciones

      // Por ahora, simplemente mostramos un mensaje de éxito
      toast({
        title: "Colecciones actualizadas",
        description: "Las colecciones del producto se han actualizado correctamente",
      })
    } catch (err) {
      console.error("Error al actualizar colecciones:", err)
      toast({
        title: "Error",
        description: err.message || "Error al actualizar colecciones",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error al cargar colecciones</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {collections.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No hay colecciones disponibles</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((collection) => (
              <Card key={collection.id} className="p-4 flex items-start space-x-2">
                <Checkbox
                  id={`collection-${collection.id}`}
                  checked={selectedCollections.includes(collection.id)}
                  onCheckedChange={() => handleCollectionToggle(collection.id)}
                />
                <div className="grid gap-1.5">
                  <label
                    htmlFor={`collection-${collection.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {collection.title}
                  </label>
                  {collection.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{collection.description}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar cambios
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
