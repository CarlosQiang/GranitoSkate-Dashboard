"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tags, Search, Plus, MoreHorizontal, Pencil, Trash2, Layers } from "lucide-react"
import { fetchCollections, deleteCollection } from "@/lib/api/collections"
import { useToast } from "@/components/ui/use-toast"

interface Collection {
  id: string
  title: string
  handle: string
  productsCount: number
  image: {
    url: string
  } | null
}

export default function CollectionsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [collections, setCollections] = useState<Collection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    const getCollections = async () => {
      try {
        const data = await fetchCollections()
        setCollections(data)
      } catch (error) {
        console.error("Error fetching collections:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las colecciones",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    getCollections()
  }, [toast])

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta colección?")) {
      try {
        await deleteCollection(id)
        setCollections(collections.filter((collection) => collection.id !== id))
        toast({
          title: "Colección eliminada",
          description: "La colección ha sido eliminada correctamente",
        })
      } catch (error) {
        console.error("Error deleting collection:", error)
        toast({
          title: "Error",
          description: "No se pudo eliminar la colección",
          variant: "destructive",
        })
      }
    }
  }

  const filteredCollections = collections.filter((collection) =>
    collection.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Colecciones</h1>
          <p className="text-muted-foreground">Gestiona las colecciones de productos de tu tienda</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard/collections/manage")}>
            <Layers className="mr-2 h-4 w-4" />
            Gestionar productos
          </Button>
          <Button onClick={() => router.push("/dashboard/collections/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva colección
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar colecciones..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="hidden sm:flex"
          >
            Cuadrícula
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="hidden sm:flex"
          >
            Lista
          </Button>
        </div>
      </div>

      {isLoading ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-40 w-full" />
                <CardHeader className="p-4">
                  <Skeleton className="h-5 w-3/4" />
                </CardHeader>
                <CardFooter className="p-4 pt-0 flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Imagen</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-12 w-12 rounded-md" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
      ) : filteredCollections.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Tags className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No se encontraron colecciones</p>
          <Button onClick={() => router.push("/dashboard/collections/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Crear mi primera colección
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCollections.map((collection) => (
            <Card key={collection.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square relative">
                {collection.image ? (
                  <Image
                    src={collection.image.url || "/placeholder.svg"}
                    alt={collection.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-muted">
                    <Tags className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-lg truncate">{collection.title}</CardTitle>
              </CardHeader>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <p className="text-sm text-muted-foreground">{collection.productsCount} productos</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Acciones</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/dashboard/collections/${collection.id}`)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/dashboard/collections/${collection.id}/products`)}>
                      <Layers className="mr-2 h-4 w-4" />
                      Gestionar productos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(collection.id)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Imagen</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCollections.map((collection) => (
                <TableRow key={collection.id}>
                  <TableCell>
                    <div className="h-12 w-12 rounded-md overflow-hidden bg-muted">
                      {collection.image ? (
                        <Image
                          src={collection.image.url || "/placeholder.svg"}
                          alt={collection.title}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-muted">
                          <Tags className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{collection.title}</div>
                    <div className="text-sm text-muted-foreground">{collection.handle}</div>
                  </TableCell>
                  <TableCell>{collection.productsCount}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Acciones</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/collections/${collection.id}`)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/dashboard/collections/${collection.id}/products`)}
                        >
                          <Layers className="mr-2 h-4 w-4" />
                          Gestionar productos
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(collection.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
