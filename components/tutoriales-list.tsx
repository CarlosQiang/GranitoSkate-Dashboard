"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TutorialCard } from "@/components/tutorial-card"
import { LoadingState } from "@/components/loading-state"
import { Plus, Search, Filter, RefreshCw } from "lucide-react"
import { Pagination } from "@/components/ui/pagination"

// Opciones predefinidas
const CATEGORIAS_OPCIONES = [
  "Todas",
  "Equipamiento",
  "Principiantes",
  "Trucos",
  "Mantenimiento",
  "Competición",
  "Estilo",
  "Historia",
]

export function TutorialesList() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [tutoriales, setTutoriales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState<any>({ total: 0, page: 1, limit: 9, totalPages: 1 })

  // Filtros
  const [busqueda, setBusqueda] = useState("")
  const [categoria, setCategoria] = useState("Todas")
  const [filtroPublicados, setFiltroPublicados] = useState<string>("todos")
  const [page, setPage] = useState(1)

  // Cargar tutoriales
  const fetchTutoriales = async () => {
    setLoading(true)
    setError(null)

    try {
      // Construir URL con filtros
      const params = new URLSearchParams()

      if (busqueda) {
        params.append("busqueda", busqueda)
      }

      if (categoria && categoria !== "Todas") {
        params.append("categoria", categoria)
      }

      if (filtroPublicados === "publicados") {
        params.append("publicados", "true")
      }

      params.append("page", page.toString())
      params.append("limit", "9")

      const response = await fetch(`/api/tutoriales?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Error al cargar tutoriales")
      }

      const data = await response.json()
      setTutoriales(data.tutoriales)
      setMeta(data.meta)
    } catch (err) {
      console.error("Error:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
      setTutoriales([])
    } finally {
      setLoading(false)
    }
  }

  // Cargar tutoriales al montar o cambiar filtros
  useEffect(() => {
    fetchTutoriales()
  }, [filtroPublicados, categoria, page])

  // Manejar búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1) // Resetear página al buscar
    fetchTutoriales()
  }

  // Manejar cambio de página
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tutoriales</h1>
          <p className="text-muted-foreground">Gestiona los tutoriales de tu tienda</p>
        </div>

        <Button asChild>
          <Link href="/dashboard/tutoriales/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo tutorial
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar tutoriales..."
              className="pl-8"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <Button type="submit">Buscar</Button>
        </form>

        <div className="flex gap-2">
          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIAS_OPCIONES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => fetchTutoriales()} className="flex-shrink-0">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="todos" value={filtroPublicados} onValueChange={setFiltroPublicados}>
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="publicados">Publicados</TabsTrigger>
          <TabsTrigger value="borradores">Borradores</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <LoadingState message="Cargando tutoriales..." />
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" onClick={fetchTutoriales} className="mt-4">
            Reintentar
          </Button>
        </div>
      ) : tutoriales.length === 0 ? (
        <div className="text-center py-10 border rounded-lg">
          <h3 className="text-lg font-medium">No hay tutoriales</h3>
          <p className="text-muted-foreground mt-1">No se encontraron tutoriales con los filtros actuales</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/tutoriales/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Crear tutorial
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {tutoriales.map((tutorial) => (
              <Link
                key={tutorial.id}
                href={`/dashboard/tutoriales/${tutorial.id}`}
                className="block h-full transition-transform hover:scale-[1.02]"
              >
                <TutorialCard tutorial={tutorial} />
              </Link>
            ))}
          </div>

          {meta.totalPages > 1 && (
            <Pagination currentPage={meta.page} totalPages={meta.totalPages} onPageChange={handlePageChange} />
          )}
        </>
      )}
    </div>
  )
}
