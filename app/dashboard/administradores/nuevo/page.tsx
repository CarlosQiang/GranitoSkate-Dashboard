import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import NuevoAdministradorForm from "@/components/nuevo-administrador-form"

export default async function NuevoAdministradorPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Verificar si el usuario tiene permisos de superadmin
  if (session.user.role !== "superadmin") {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Crear Nuevo Administrador</h1>

      <Card>
        <CardHeader>
          <CardTitle>Información del Administrador</CardTitle>
        </CardHeader>
        <CardContent>
          <NuevoAdministradorForm />
        </CardContent>
      </Card>
    </div>
  )
}
