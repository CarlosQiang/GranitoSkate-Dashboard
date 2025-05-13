import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { TutorialForm } from "@/components/tutorial-form"
import { getTutorialById } from "@/lib/api/tutoriales"

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const tutorial = await getTutorialById(Number.parseInt(params.id))

  if (!tutorial) {
    return {
      title: "Tutorial no encontrado - GranitoSkate",
    }
  }

  return {
    title: `Editar: ${tutorial.titulo} - GranitoSkate`,
    description: `Editar tutorial: ${tutorial.titulo}`,
  }
}

export default async function EditarTutorialPage({ params }: { params: { id: string } }) {
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
        <h1 className="text-2xl font-bold">Editar Tutorial</h1>
      </div>

      <TutorialForm tutorial={tutorial} isEditing={true} />
    </div>
  )
}
