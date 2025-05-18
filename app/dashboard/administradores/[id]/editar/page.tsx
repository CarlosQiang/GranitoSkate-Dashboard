import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { sql } from "@vercel/postgres"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import EditarAdministradorForm from "@/components/editar-administrador-form"

// Marcar la página como dinámica para evitar errores de renderizado estático
export const dynamic = "force-dynamic"

export default async function EditarAdministradorPage({ params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      redirect("/login")
    }

    // Comentamos temporalmente la validación de rol para depurar
    /*
    if (session.user.role !== "superadmin") {
      redirect("/dashboard")
    }
    */

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
  } catch (error) {
    console.error("Error en EditarAdministradorPage:", error)
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Editar Administrador</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Error al cargar la página: {error.message}</p>
        </div>
      </div>
    )
  }
}
