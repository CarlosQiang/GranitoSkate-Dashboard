"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { SyncManager } from "@/components/sync-manager"

export default function SyncPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Sincronización de Datos</h1>
        </div>
      </div>

      <p className="text-muted-foreground">
        Esta página te permite sincronizar los datos entre Shopify y la base de datos. Puedes sincronizar todos los
        datos o seleccionar una entidad específica.
      </p>

      <SyncManager />

      <div className="space-y-4 bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h2 className="text-xl font-semibold text-blue-800">Información sobre la sincronización</h2>

        <div className="space-y-2">
          <h3 className="font-medium text-blue-700">¿Qué hace la sincronización?</h3>
          <p className="text-blue-600">
            La sincronización obtiene los datos de Shopify y los guarda en la base de datos local. Esto permite que la
            aplicación funcione más rápido y que puedas acceder a los datos incluso cuando Shopify no está disponible.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-blue-700">¿Cuándo debo sincronizar?</h3>
          <p className="text-blue-600">Se recomienda sincronizar los datos cuando:</p>
          <ul className="list-disc pl-5 text-blue-600 space-y-1">
            <li>Inicias la aplicación por primera vez</li>
            <li>Has realizado cambios importantes en Shopify</li>
            <li>Notas que los datos en la aplicación no coinciden con los de Shopify</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-blue-700">Sincronización bidireccional</h3>
          <p className="text-blue-600">La sincronización es bidireccional, lo que significa que:</p>
          <ul className="list-disc pl-5 text-blue-600 space-y-1">
            <li>Los cambios realizados en Shopify se reflejan en la base de datos local</li>
            <li>Los cambios realizados en la aplicación se envían a Shopify</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
