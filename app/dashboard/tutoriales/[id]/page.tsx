import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { db } from "@/lib/db/neon"
import { tutoriales } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Star } from "lucide-react"

interface TutorialPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: TutorialPageProps): Promise<Metadata> {
  const id = Number.parseInt(params.id)
  if (isNaN(id)) return { title: "Tutorial no encontrado" }

  try {
    const result = await db.select().from(tutoriales).where(eq(tutoriales.id, id)).limit(1)
    const tutorial = result[0]

    if (!tutorial) {
      return {
        title: "Tutorial no encontrado",
      }
    }

    return {
      title: `${tutorial.titulo} | GestionGranito`,
      description: tutorial.descripcion,
    }
  } catch (error) {
    return {
      title: "Error al cargar tutorial",
    }
  }
}

export default async function TutorialPage({ params }: TutorialPageProps) {
  const id = Number.parseInt(params.id)
  if (isNaN(id)) notFound()

  try {
    const result = await db.select().from(tutoriales).where(eq(tutoriales.id, id)).limit(1)
    const tutorial = result[0]

    if (!tutorial) {
      notFound()
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Ver Tutorial</h3>
            <p className="text-sm text-muted-foreground">Visualiza los detalles del tutorial.</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard/tutoriales">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver
            </Link>
          </Button>
        </div>
        <Separator />

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{tutorial.titulo}</CardTitle>
                <CardDescription>{tutorial.descripcion}</CardDescription>
              </div>
              <div className="flex gap-2">
                {tutorial.destacado && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" /> Destacado
                  </Badge>
                )}
                <Badge variant={tutorial.publicado ? "default" : "secondary"}>
                  {tutorial.publicado ? "Publicado" : "Borrador"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {tutorial.imagen_url && (
              <div className="mb-6">
                <img
                  src={tutorial.imagen_url || "/placeholder.svg"}
                  alt={tutorial.titulo}
                  className="rounded-md w-full max-h-[400px] object-cover"
                />
              </div>
            )}
            <div className="prose max-w-none">
              {tutorial.contenido.split("\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-6 text-sm text-muted-foreground">
              Creado: {new Date(tutorial.fecha_creacion).toLocaleDateString()}
              {tutorial.ultima_actualizacion && tutorial.ultima_actualizacion !== tutorial.fecha_creacion && (
                <> | Actualizado: {new Date(tutorial.ultima_actualizacion).toLocaleDateString()}</>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href={`/dashboard/tutoriales/editar/${tutorial.id}`}>
                <Edit className="mr-2 h-4 w-4" /> Editar Tutorial
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  } catch (error) {
    console.error("Error al cargar tutorial:", error)
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Error</h3>
          <p className="text-sm text-muted-foreground">No se pudo cargar el tutorial.</p>
        </div>
        <Separator />
        <Card>
          <CardContent className="pt-6">
            <p>Ocurrió un error al cargar el tutorial. Por favor, inténtalo de nuevo más tarde.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild>
              <Link href="/dashboard/tutoriales">
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Tutoriales
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }
}
