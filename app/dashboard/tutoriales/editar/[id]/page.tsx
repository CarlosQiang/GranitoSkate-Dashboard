import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { db } from "@/lib/db/neon"
import { tutoriales } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import TutorialForm from "@/components/tutoriales/tutorial-form"
import { ArrowLeft } from "lucide-react"

interface EditarTutorialPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: EditarTutorialPageProps): Promise<Metadata> {
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
      title: `Editar: ${tutorial.titulo} | GestionGranito`,
      description: `Editar tutorial: ${tutorial.titulo}`,
    }
  } catch (error) {
    return {
      title: "Error al cargar tutorial",
    }
  }
}

export default async function EditarTutorialPage({ params }: EditarTutorialPageProps) {
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
            <h3 className="text-lg font-medium">Editar Tutorial</h3>
            <p className="text-sm text-muted-foreground">Actualiza la información del tutorial.</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard/tutoriales">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver
            </Link>
          </Button>
        </div>
        <Separator />
        <TutorialForm tutorial={tutorial} />
      </div>
    )
  } catch (error) {
    console.error("Error al cargar tutorial para editar:", error)
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Error</h3>
          <p className="text-sm text-muted-foreground">No se pudo cargar el tutorial para editar.</p>
        </div>
        <Separator />
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <p>Ocurrió un error al cargar el tutorial. Por favor, inténtalo de nuevo más tarde.</p>
          <Button variant="outline" asChild className="mt-4">
            <Link href="/dashboard/tutoriales">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Tutoriales
            </Link>
          </Button>
        </div>
      </div>
    )
  }
}
