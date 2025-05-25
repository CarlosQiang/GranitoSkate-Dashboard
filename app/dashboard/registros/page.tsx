import { Suspense } from "react"
import RegistrosActividad from "@/components/registros-actividad"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw } from "lucide-react"

export default function RegistrosPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Registros del Sistema</h1>
        <p className="text-muted-foreground mt-2">
          Monitorea todas las actividades y acciones realizadas en el sistema
        </p>
      </div>

      <Suspense
        fallback={
          <Card>
            <CardHeader>
              <CardTitle>Cargando registros...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        }
      >
        <RegistrosActividad />
      </Suspense>
    </div>
  )
}
