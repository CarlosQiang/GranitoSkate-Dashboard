import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Shield, Activity, Settings } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">GranitoSkate</h1>
          <p className="text-xl text-gray-600 mb-8">Sistema de gestión y administración</p>
          <Link href="/login">
            <Button size="lg" className="bg-granito hover:bg-granito-dark">
              Acceder al Panel
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-granito" />
                Seguro
              </CardTitle>
              <CardDescription>Sistema de autenticación robusto con control de acceso</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Acceso protegido con credenciales seguras y sesiones controladas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-granito" />
                Monitoreo
              </CardTitle>
              <CardDescription>Registro completo de todas las actividades del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Seguimiento detallado de acciones, errores y eventos del sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-granito" />
                Configurable
              </CardTitle>
              <CardDescription>Gestión flexible de administradores y configuraciones</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Panel de control intuitivo para gestionar usuarios y configuraciones
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-16">
          <p className="text-sm text-gray-500">Desarrollado para la gestión eficiente de GranitoSkate</p>
        </div>
      </div>
    </div>
  )
}
