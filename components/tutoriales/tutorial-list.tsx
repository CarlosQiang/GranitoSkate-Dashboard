"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Plus, RefreshCw, Search } from "lucide-react"
import TutorialCard from "./tutorial-card"
import { useToast } from "@/components/ui/use-toast"

interface Tutorial {
  id: number
  titulo: string
  descripcion: string
  contenido: string
  imagen_url?: string
  publicado: boolean
  destacado: boolean
  fecha_creacion: string
}

export default function TutorialList() {
  const router = useRouter()
  const { toast } = useToast()
  const [tutoriales, setTutoriales] = useState<Tutorial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState("fecha_creacion")
  const [sortOrder, setSortOrder] = useState("desc")
  const [activeTab, setActiveTab] = useState("todos")

  useEffect(() => {
    fetchTutoriales()
  }, [currentPage, sortBy, sortOrder, activeTab])

  const fetchTutoriales = async () => {
    setLoading(true)
    setError(null)

    try {
      const destacados = activeTab === "destacados" ? true : undefined
      const url = new URL("/api/tutoriales", window.location.origin)
      url.searchParams.append("page", currentPage.toString())
      url.searchParams.append("limit", "9")
      url.searchParams.append("sort", sortBy)
      url.searchParams.append("order", sortOrder)

      if (destacados) {
        url.searchParams.append("destacados", "true")
      }

      const response = await fetch(url.toString())

      if (!response.ok) {
        throw new Error("Error al obtener los tutoriales")
      }

      const data = await response.json()
      setTutoriales(data.tutoriales)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error("Error al cargar tutoriales:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
      toast({
        title: "Error",
        description: "No se pudieron cargar los tutoriales",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (id: number) => {
    setTutoriales((prev) => prev.filter((tutorial) => tutorial.id !== id))
    fetchTutoriales()
  }

  const filteredTutoriales = tutoriales.filter(
    (tutorial) =>
      tutorial.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutorial.descripcion.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar tutoriales..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchTutoriales} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="titulo">Título</SelectItem>
              <SelectItem value="fecha_creacion">Fecha de creación</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Orden" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascendente</SelectItem>
              <SelectItem value="desc">Descendente</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => router.push("/dashboard/tutoriales/crear")}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo
          </Button>
        </div>
      </div>

      <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="destacados">Destacados</TabsTrigger>
        </TabsList>
      </Tabs>

      {error ? (
        <div className="text-center p-8 border rounded-lg">
          <p className="text-red-500">{error}</p>
          <Button variant="outline" onClick={fetchTutoriales} className="mt-4">
            Reintentar
          </Button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 h-[300px] animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="flex justify-between">
                <div className="h-8 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredTutoriales.length === 0 ? (
        <div className="text-center p-8 border rounded-lg">
          <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No hay tutoriales</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? "No se encontraron tutoriales que coincidan con tu búsqueda."
              : "Aún no hay tutoriales creados."}
          </p>
          <Button onClick={() => router.push("/dashboard/tutoriales/crear")}>
            <Plus className="mr-2 h-4 w-4" /> Crear nuevo tutorial
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutoriales.map((tutorial) => (
              <TutorialCard key={tutorial.id} tutorial={tutorial} onDelete={handleDelete} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationPrevious
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage <= 1}
                />
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink onClick={() => setCurrentPage(i + 1)} isActive={currentPage === i + 1}>
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationNext
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage >= totalPages}
                />
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  )
}
