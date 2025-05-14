import type { Metadata } from "next"
import { Separator } from "@/components/ui/separator"
import TutorialList from "@/components/tutoriales/tutorial-list"

export const metadata: Metadata = {
  title: "Tutoriales | GestionGranito",
  description: "Gestiona los tutoriales de la plataforma",
}

export default function TutorialesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Tutoriales</h3>
        <p className="text-sm text-muted-foreground">
          Gestiona los tutoriales de la plataforma. Crea, edita y elimina tutoriales.
        </p>
      </div>
      <Separator />
      <TutorialList />
    </div>
  )
}
