"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { BookOpen, Edit, Star, Trash } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface TutorialCardProps {
  tutorial: {
    id: number
    titulo: string
    descripcion: string
    contenido: string
    imagen_url?: string
    publicado: boolean
    destacado: boolean
    fecha_creacion: string
  }
  onDelete?: (id: number) => void
}

export default function TutorialCard({ tutorial, onDelete }: TutorialCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!tutorial.id) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/tutoriales/${tutorial.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el tutorial")
      }

      toast({
        title: "Tutorial eliminado",
        description: "El tutorial ha sido eliminado correctamente",
      })

      if (onDelete) {
        onDelete(tutorial.id)
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error("Error al eliminar tutorial:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el tutorial",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{tutorial.titulo}</CardTitle>
          {tutorial.destacado && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" /> Destacado
            </Badge>
          )}
        </div>
        <CardDescription className="line-clamp-2">{tutorial.descripcion}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="relative aspect-video rounded-md overflow-hidden mb-4">
          {tutorial.imagen_url ? (
            <img
              src={tutorial.imagen_url || "/placeholder.svg"}
              alt={tutorial.titulo}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-gray-400" />
            </div>
          )}
        </div>
        <div className="text-sm text-muted-foreground">{new Date(tutorial.fecha_creacion).toLocaleDateString()}</div>
      </CardContent>
      <CardFooter className="flex justify-between pt-3">
        <Button variant="outline" asChild>
          <Link href={`/dashboard/tutoriales/${tutorial.id}`}>Ver</Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/dashboard/tutoriales/editar/${tutorial.id}`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" className="text-red-500">
                <Trash className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Esto eliminará permanentemente el tutorial.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-500 text-white hover:bg-red-600"
                >
                  {isDeleting ? "Eliminando..." : "Eliminar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  )
}
