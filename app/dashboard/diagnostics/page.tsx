import { Suspense } from "react"
import { SystemStatus } from "@/components/system-status"
import { ShopifyConnectionStatus } from "@/components/shopify-connection-status"
import { DbConnectionStatus } from "@/components/db-connection-status"
import { CreateTablesButton } from "@/components/create-tables-button"
import { SyncAllButton } from "@/components/sync-all-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default function DiagnosticsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Diagnósticos</h2>
          <div className="flex items-center gap-2">
            <CreateTablesButton />
            <SyncAllButton />
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Estado del sistema</CardTitle>
              <CardDescription>Comprueba el estado general del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Cargando estado del sistema...</div>}>
                <SystemStatus />
              </Suspense>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conexión con Shopify</CardTitle>
              <CardDescription>Comprueba la conexión con la API de Shopify</CardDescription>
            </CardHeader>
            <CardContent>
              <ShopifyConnectionStatus />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conexión con la base de datos</CardTitle>
              <CardDescription>Comprueba la conexión con la base de datos</CardDescription>
            </CardHeader>
            <CardContent>
              <DbConnectionStatus />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
