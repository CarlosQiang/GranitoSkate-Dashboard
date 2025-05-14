import type { Metadata } from "next"
import { Separator } from "@/components/ui/separator"
import TutorialForm from "@/components/tutoriales/tutorial-form"

export const metadata: Metadata = {
  title: "Crear Tutorial | GestionGranito",
  description: "Crea un nuevo tutorial para la plataforma",
}

export default function CrearTutorialPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Crear Tutorial</h3>
        <p className="text-sm text-muted-foreground">Crea un nuevo tutorial para la plataforma.</p>
      </div>
      <Separator />
      <TutorialForm />
    </div>
  )
}
