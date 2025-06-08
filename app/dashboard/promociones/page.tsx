"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw, Plus } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const sincronizarPromociones = async () => {
  try {
    const response = await fetch("/api/sync/promociones", {
      method: "POST",
    })
    const data = await response.json()

    if (data.success) {
      toast({
        title: "✅ Sincronización completada",
        description: data.message,
      })
      // Recargar la página para mostrar los cambios
      window.location.reload()
    }
  } catch (error) {
    toast({
      title: "❌ Error",
      description: "No se pudo sincronizar con Shopify",
      variant: "destructive",
    })
  }
}

export default function PromocionesPage() {
  return (
    <div className="container py-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promociones</h1>
          <p className="text-muted-foreground">Gestiona las promociones y descuentos de tu tienda</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={sincronizarPromociones}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sincronizar
          </Button>
          <Button asChild>
            <Link href="/dashboard/promociones/asistente">
              <Plus className="mr-2 h-4 w-4" />
              Nueva promoción
            </Link>
          </Button>
        </div>
      </div>
      {/* @ts-expect-error Server Component */}
    </div>
  )
}
