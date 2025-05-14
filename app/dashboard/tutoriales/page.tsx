import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { TutorialesList } from "@/components/tutoriales-list"
import { SincronizacionTutoriales } from "@/components/sincronizacion-tutoriales"

export const metadata: Metadata = {
  title: "Tutoriales - GranitoSkate",
  description: "Gestiona los tutoriales de tu tienda",
}

export default function TutorialesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tutoriales</h1>
          <p className="text-muted-foreground">Gestiona los tutoriales de tu tienda y sincronízalos con Shopify</p>
        </div>
        <Link href="/dashboard/tutoriales/nuevo">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Tutorial
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="md:col-span-2">
          <Suspense fallback={<div>Cargando tutoriales...</div>}>
            <TutorialesList />
          </Suspense>
        </div>
        <div>
          <SincronizacionTutoriales />
        </div>
      </div>
    </div>
  )
}
