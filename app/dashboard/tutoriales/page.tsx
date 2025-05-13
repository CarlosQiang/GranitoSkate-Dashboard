import type { Metadata } from "next"
import { TutorialesList } from "@/components/tutoriales-list"

export const metadata: Metadata = {
  title: "Tutoriales - GranitoSkate",
  description: "Gestiona los tutoriales de tu tienda",
}

export default function TutorialesPage() {
  return (
    <div className="space-y-6">
      <TutorialesList />
    </div>
  )
}
