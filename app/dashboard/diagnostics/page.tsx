import type { Metadata } from "next"
import { SystemStatus } from "@/components/system-status"
import { ShopifyConnectionStatus } from "@/components/shopify-connection-status"
import { DbConnectionStatus } from "@/components/db-connection-status"
import { InitAdmin } from "@/components/init-admin"

export const metadata: Metadata = {
  title: "Diagnósticos del Sistema | GestionGranito",
  description: "Diagnósticos y estado del sistema GestionGranito",
}

export default function DiagnosticsPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Diagnósticos del Sistema</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <DbConnectionStatus />
        <ShopifyConnectionStatus />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <InitAdmin />
        <SystemStatus />
      </div>
    </div>
  )
}
