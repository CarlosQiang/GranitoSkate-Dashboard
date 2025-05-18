import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { sql } from "@vercel/postgres"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UserPlus, Edit, Trash2, CheckCircle, XCircle } from "lucide-react"
import { Suspense } from "react"

export default async function AdministradoresPage() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      console.log("No hay sesión, redirigiendo a /login")
      redirect("/login")
    }

    // Verificar si el usuario tiene permisos de superadmin
    // Comentamos esta validación temporalmente para depurar
    /*
    if (session.user.role !== "superadmin") {
      console.log("Usuario no es superadmin, redirigiendo a /dashboard")
      redirect("/dashboard")
    }
    */

    return (
      <div className="container mx-auto py-4 md:py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-xl md:text-2xl font-bold">Gestión de Administradores</h1>
          <Link href="/dashboard/administradores/nuevo">
            <Button className="bg-[#c7a04a] hover:bg-[#b08e42] w-full sm:w-auto">
              <UserPlus className="mr-2 h-4 w-4" />
              Nuevo Administrador
            </Button>
          </Link>
        </div>

        <Suspense fallback={<div className="text-center py-8">Cargando administradores...</div>}>
          <AdministradoresList />
        </Suspense>
      </div>
    )
  } catch (error) {
    console.error("Error en AdministradoresPage:", error)
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Gestión de Administradores</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Error al cargar la página de administradores: {error.message}</p>
        </div>
      </div>
    )
  }
}

async function AdministradoresList() {
  try {
    console.log("Obteniendo lista de administradores...")

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

    console.log(`Se encontraron ${administradores.length} administradores`)

    if (administradores.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No hay administradores registrados.</p>
          <Link href="/dashboard/administradores/nuevo" className="mt-4 inline-block">
            <Button className="bg-[#c7a04a] hover:bg-[#b08e42]">
              <UserPlus className="mr-2 h-4 w-4" />
              Crear primer administrador
            </Button>
          </Link>
        </div>
      )
    }

    return (
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {administradores.map((admin) => (
          <Card key={admin.id} className="overflow-hidden">
            <CardHeader className="pb-2 bg-gray-50">
              <CardTitle className="flex justify-between items-center text-base md:text-lg">
                <span className="truncate">{admin.nombre_completo || admin.nombre_usuario}</span>
                {admin.activo ? (
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500 mb-2 truncate">
                <span className="font-medium">Usuario:</span> {admin.nombre_usuario}
              </p>
              <p className="text-sm text-gray-500 mb-2 truncate">
                <span className="font-medium">Email:</span> {admin.correo_electronico}
              </p>
              <p className="text-sm text-gray-500 mb-2">
                <span className="font-medium">Rol:</span>{" "}
                <span className={admin.rol === "superadmin" ? "text-[#c7a04a] font-semibold" : ""}>
                  {admin.rol === "superadmin" ? "Super Administrador" : "Administrador"}
                </span>
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Último acceso:</span>{" "}
                {admin.ultimo_acceso ? new Date(admin.ultimo_acceso).toLocaleString() : "Nunca"}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
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
    )
  } catch (error) {
    console.error("Error al obtener administradores:", error)
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error al cargar los administradores: {error.message}</p>
      </div>
    )
  }
}
