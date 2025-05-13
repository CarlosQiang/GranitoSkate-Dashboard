import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import { getTutorialById } from "@/lib/api/tutoriales"
import { EliminarTutorialForm } from "@/components/eliminar-tutorial-form"

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const tutorial = await getTutorialById(Number.parseInt(params.id))

  if (!tutorial) {
    return {
      title: "Tutorial no encontrado - GranitoSkate",
    }
  }

  return {
    title: `Eliminar: ${tutorial.titulo} - GranitoSkate`,
    description: `Eliminar tutorial: ${tutorial.titulo}`,
  }
}

export default async function EliminarTutorialPage({ params }: { params: { id: string } }) {
  const tutorial = await getTutorialById(Number.parseInt(params.id))

  if (!tutorial) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/tutoriales/${tutorial.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Eliminar Tutorial</h1>
      </div>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Confirmar eliminación
          </CardTitle>
          <CardDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el tutorial &quot;{tutorial.titulo}&quot; y
            todos sus datos asociados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Si el tutorial está sincronizado con Shopify, también se eliminará de tu tienda.</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/tutoriales/${tutorial.id}`}>Cancelar</Link>
          </Button>
          <EliminarTutorialForm tutorial={tutorial} />
        </CardFooter>
      </Card>
    </div>
  )
}
