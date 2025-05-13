import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { sql } from "@vercel/postgres"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UserPlus, Edit, Trash2, CheckCircle, XCircle } from "lucide-react"

export default async function AdministradoresPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Verificar si el usuario tiene permisos de superadmin
  if (session.user.role !== "superadmin") {
    redirect("/dashboard")
  }

  // Obtener la lista de administradores
  const { rows: administradores } = await sql`
    SELECT 
      id, 
      nombre_usuario, 
      correo_electronico, 
      nombre_completo, 
      rol, 
      activo, 
      ultimo_acceso,
      fecha_creacion
    FROM 
      administradores
    ORDER BY 
      fecha_creacion DESC
  `

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Administradores</h1>
        <Link href="/dashboard/administradores/nuevo">
          <Button className="bg-granito hover:bg-granito-dark">
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Administrador
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {administradores.map((admin) => (
          <Card key={admin.id} className="overflow-hidden">
            <CardHeader className="pb-2 bg-gray-50">
              <CardTitle className="flex justify-between items-center">
                <span>{admin.nombre_completo || admin.nombre_usuario}</span>
                {admin.activo ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500 mb-2">
                <span className="font-medium">Usuario:</span> {admin.nombre_usuario}
              </p>
              <p className="text-sm text-gray-500 mb-2">
                <span className="font-medium">Email:</span> {admin.correo_electronico}
              </p>
              <p className="text-sm text-gray-500 mb-2">
                <span className="font-medium">Rol:</span>{" "}
                <span className={admin.rol === "superadmin" ? "text-granito font-semibold" : ""}>
                  {admin.rol === "superadmin" ? "Super Administrador" : "Administrador"}
                </span>
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Último acceso:</span>{" "}
                {admin.ultimo_acceso ? new Date(admin.ultimo_acceso).toLocaleString() : "Nunca"}
              </p>

              <div className="mt-4 flex space-x-2">
                <Link href={`/dashboard/administradores/${admin.id}/editar`}>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Edit className="mr-1 h-4 w-4" />
                    Editar
                  </Button>
                </Link>
                <Link href={`/dashboard/administradores/${admin.id}/eliminar`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Eliminar
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
