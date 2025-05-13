import type { Metadata } from "next"
import RegistroSincronizacion from "@/components/registro-sincronizacion"

export const metadata: Metadata = {
  title: "Registro de Sincronización",
  description: "Historial de operaciones de sincronización entre la aplicación y la base de datos",
}

export default function SincronizacionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Registro de Sincronización</h1>
        <p className="text-muted-foreground">
          Monitorea las operaciones de sincronización entre la aplicación y la base de datos
        </p>
      </div>
      <RegistroSincronizacion />
    </div>
  )
}
