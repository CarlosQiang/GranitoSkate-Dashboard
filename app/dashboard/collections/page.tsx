"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Search, RefreshCw, Grid3X3, List, Package, Eye, Edit } from "lucide-react"
import { fetchCollections } from "@/lib/api/collections"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

export const dynamic = "force-dynamic"

export default function CollectionsPage() {
  const router = useRouter()
  const [collections, setCollections] = useState([])
  const [filteredCollections, setFilteredCollections] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState("grid")
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const loadCollections = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchCollections()
      setCollections(data)
      filterCollections(data, searchTerm)
    } catch (error) {
      console.error("Error al cargar colecciones:", error)
      setError("No se pudieron cargar las colecciones. Intente nuevamente más tarde.")
      toast({
        title: "Error al cargar colecciones",
        description: "No se pudieron cargar las colecciones. Intente nuevamente más tarde.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterCollections = (collectionsData, search) => {
    let filtered = [...collectionsData]

    if (search) {
      filtered = filtered.filter(
        (collection) =>
          collection.title?.toLowerCase().includes(search.toLowerCase()) ||
          collection.description?.toLowerCase().includes(search.toLowerCase()),
      )
    }

    setFilteredCollections(filtered)
  }

  useEffect(() => {
    loadCollections()

    const savedViewMode = localStorage.getItem("collectionsViewMode")
    if (savedViewMode) {
      setViewMode(savedViewMode)
    }
  }, [])

  useEffect(() => {
    filterCollections(collections, searchTerm)
  }, [searchTerm, collections])

  useEffect(() => {
    localStorage.setItem("collectionsViewMode", viewMode)
  }, [viewMode])

  const syncCollections = async () => {
    setIsSyncing(true)
    setError(null)
    try {
      const response = await fetch("/api/sync/collections")
      if (!response.ok) {
        throw new Error("Error al sincronizar colecciones")
      }

      toast({
        title: "Sincronización completada",
        description: "Las colecciones se han sincronizado correctamente con Shopify.",
      })

      await loadCollections()
    } catch (error) {
      console.error("Error al sincronizar colecciones:", error)
      setError("No se pudieron sincronizar las colecciones. Intente nuevamente más tarde.")
      toast({
        title: "Error de sincronización",
        description: "No se pudieron sincronizar las colecciones. Intente nuevamente más tarde.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const getImageUrl = (collection) => {
    if (collection.image?.url) return collection.image.url
    if (collection.image?.src) return collection.image.src
    if (collection.featuredImage?.url) return collection.featuredImage.url
    return null
  }

  const cleanId = (id) => {
    if (!id) return ""
    if (typeof id === "string" && id.includes("/")) {
      return id.split("/").pop()
    }
    return id
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header responsive */}
      <div className="flex-responsive-between">
        <div>
          <h1 className="heading-responsive">Colecciones</h1>
          <p className="caption-responsive mt-1">Gestiona las colecciones de productos de tu tienda</p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/collections/new")}
          className="bg-granito-500 hover:bg-granito-600 text-white mobile-full-width sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          <span className="mobile-only">Nueva</span>
          <span className="tablet-up">Nueva colección</span>
        </Button>
      </div>

      <Card className="overflow-hidden border-gray-200 dark:border-gray-800">
        <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b card-responsive">
          <div className="flex-responsive-between">
            <div>
              <CardTitle className="subheading-responsive">Catálogo de colecciones</CardTitle>
              <CardDescription className="caption-responsive">
                Organiza tus productos en colecciones temáticas.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={syncCollections}
                disabled={isSyncing}
                variant="outline"
                className="border-granito-300 hover:bg-granito-50"
                size={isMobile ? "sm" : "default"}
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    <span className="mobile-only">Sync...</span>
                    <span className="tablet-up">Sincronizando...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    <span className="mobile-only">Sync</span>
                    <span className="tablet-up">Sincronizar</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="card-responsive">
          <div className="space-y-4">
            {/* Controles de búsqueda y vista */}
            <div className="flex-responsive-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar colecciones..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>

              <div className="flex items-center border rounded-md overflow-hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("px-2 rounded-none", viewMode === "grid" && "bg-gray-100 dark:bg-gray-800")}
                  onClick={() => setViewMode("grid")}
                  aria-label="Vista de cuadrícula"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("px-2 rounded-none", viewMode === "list" && "bg-gray-100 dark:bg-gray-800")}
                  onClick={() => setViewMode("list")}
                  aria-label="Vista de lista"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Error state */}
            {error && (
              <div
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md"
                role="alert"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">Error:</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Contenido principal */}
            {isLoading ? (
              viewMode === "grid" ? (
                <div
                  className={cn(
                    "grid gap-4",
                    isMobile ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
                  )}
                >
                  {Array(8)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="border rounded-md overflow-hidden">
                        <Skeleton className="h-48 w-full" />
                        <div className="p-4 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="flex items-center gap-4 border rounded-md p-4">
                        <Skeleton className="h-16 w-16 rounded-md" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-4 w-1/4" />
                        </div>
                        <Skeleton className="h-8 w-24" />
                      </div>
                    ))}
                </div>
              )
            ) : filteredCollections.length === 0 ? (
              <div className="text-center py-12 border rounded-md bg-gray-50 dark:bg-gray-900">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="subheading-responsive">No se encontraron colecciones</h3>
                <p className="caption-responsive mt-1 mb-4">
                  {searchTerm ? `No hay resultados para "${searchTerm}"` : "No hay colecciones disponibles"}
                </p>
                <Button
                  onClick={() => router.push("/dashboard/collections/new")}
                  className="bg-granito-500 hover:bg-granito-600 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Crear nueva colección
                </Button>
              </div>
            ) : viewMode === "grid" ? (
              <div
                className={cn(
                  "grid gap-4",
                  isMobile ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
                )}
              >
                {filteredCollections.map((collection) => (
                  <CollectionCard key={collection.id} collection={collection} isMobile={isMobile} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCollections.map((collection) => (
                  <CollectionListItem key={collection.id} collection={collection} />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CollectionCard({ collection, isMobile }) {
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const imageUrl = getImageUrl(collection)
  const cleanCollectionId = cleanId(collection.id)

  return (
    <Link
      href={`/dashboard/collections/${cleanCollectionId}`}
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
        <div className="aspect-video relative bg-gray-100 dark:bg-gray-800 overflow-hidden">
          {!imageError && imageUrl ? (
            <img
              src={imageUrl || "/placeholder.svg"}
              alt={collection.title || "Colección"}
              className={cn(
                "object-cover w-full h-full transition-transform duration-500 ease-in-out",
                !isMobile && isHovered && "scale-105",
              )}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
          )}

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
                Ver colección
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4 flex-grow">
          <div className="space-y-2">
            <h3 className="font-medium line-clamp-2 h-12 text-sm sm:text-base">{collection.title}</h3>
            {collection.description && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{collection.description}</p>
            )}
            <div className="flex items-center justify-between pt-2">
              <Badge variant="outline" className="text-xs">
                {collection.productsCount || 0} productos
              </Badge>
              {collection.published && (
                <Badge
                  variant="default"
                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs"
                >
                  Publicada
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function CollectionListItem({ collection }) {
  const imageUrl = getImageUrl(collection)
  const cleanCollectionId = cleanId(collection.id)

  return (
    <div className="flex items-center gap-4 border rounded-md p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
      <div className="h-16 w-16 relative bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden flex-shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={collection.title || "Colección"}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-6 w-6 text-gray-400" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{collection.title}</h3>
        <p className="text-sm text-muted-foreground truncate">{collection.description || "Sin descripción"}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="text-xs">
            {collection.productsCount || 0} productos
          </Badge>
          {collection.published && (
            <Badge
              variant="default"
              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs"
            >
              Publicada
            </Badge>
          )}
        </div>
      </div>
      <div className="flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Acciones</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/collections/${cleanCollectionId}`}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalles
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/collections/${cleanCollectionId}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

function getImageUrl(collection) {
  if (collection.image?.url) return collection.image.url
  if (collection.image?.src) return collection.image.src
  if (collection.featuredImage?.url) return collection.featuredImage.url
  return null
}

function cleanId(id) {
  if (!id) return ""
  if (typeof id === "string" && id.includes("/")) {
    return id.split("/").pop()
  }
  return id
}
