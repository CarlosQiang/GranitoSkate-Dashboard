import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UserPlus } from "lucide-react"

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
  const administradores = await prisma.administrador.findMany({
    orderBy: {
      fecha_creacion: "desc",
    },
  })

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
          <Card key={admin.id}>
            <CardHeader className="pb-2">
              <CardTitle>{admin.nombre_completo || admin.nombre_usuario}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-2">
                <span className="font-medium">Email:</span> {admin.correo_electronico}
              </p>
              <p className="text-sm text-gray-500 mb-2">
                <span className="font-medium">Rol:</span> {admin.rol}
              </p>
              <p className="text-sm text-gray-500 mb-2">
                <span className="font-medium">Estado:</span>{" "}
                <span className={admin.activo ? "text-green-500" : "text-red-500"}>
                  {admin.activo ? "Activo" : "Inactivo"}
                </span>
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Último acceso:</span>{" "}
                {admin.ultimo_acceso ? new Date(admin.ultimo_acceso).toLocaleString() : "Nunca"}
              </p>

              <div className="mt-4 flex space-x-2">
                <Link href={`/dashboard/administradores/${admin.id}`}>
                  <Button variant="outline" size="sm">
                    Ver detalles
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
