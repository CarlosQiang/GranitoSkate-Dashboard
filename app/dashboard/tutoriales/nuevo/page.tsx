import type { Metadata } from "next"
import { TutorialForm } from "@/components/tutorial-form"

export const metadata: Metadata = {
  title: "Nuevo Tutorial - GranitoSkate",
  description: "Crea un nuevo tutorial para tu tienda",
}

export default function NuevoTutorialPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nuevo Tutorial</h1>
        <p className="text-muted-foreground">Crea un nuevo tutorial para tu tienda</p>
      </div>

      <TutorialForm />
    </div>
  )
}
