import type { Metadata } from "next"
import { DbInitializer } from "@/components/db-initializer"
import { SystemStatus } from "@/components/system-status"
import { ShopifyConnectionStatus } from "@/components/shopify-connection-status"
import { ShopifyConnectionDiagnostics } from "@/components/shopify-connection-diagnostics"
import { SystemDiagnostics } from "@/components/system-diagnostics"

export const metadata: Metadata = {
  title: "Diagnósticos del Sistema",
  description: "Herramientas de diagnóstico y estado del sistema",
}

export default function DiagnosticsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Diagnósticos del Sistema</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <DbInitializer />
        <SystemStatus />
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        <ShopifyConnectionStatus />
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        <ShopifyConnectionDiagnostics />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <SystemDiagnostics />
      </div>
    </div>
  )
}
