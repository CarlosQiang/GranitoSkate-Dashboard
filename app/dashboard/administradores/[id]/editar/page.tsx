import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { sql } from "@vercel/postgres"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import EditarAdministradorForm from "@/components/editar-administrador-form"

export default async function EditarAdministradorPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Verificar si el usuario tiene permisos de superadmin
  if (session.user.role !== "superadmin") {
    redirect("/dashboard")
  }

  // Obtener datos del administrador
  const { rows } = await sql`
    SELECT 
      id, 
      nombre_usuario, 
      correo_electronico, 
      nombre_completo, 
      rol, 
      activo
    FROM 
      administradores
    WHERE 
      id = ${params.id}
  `

  if (rows.length === 0) {
    redirect("/dashboard/administradores")
  }

  const administrador = rows[0]

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Editar Administrador</h1>

      <Card>
        <CardHeader>
          <CardTitle>Información del Administrador</CardTitle>
        </CardHeader>
        <CardContent>
          <EditarAdministradorForm administrador={administrador} />
        </CardContent>
      </Card>
    </div>
  )
}
