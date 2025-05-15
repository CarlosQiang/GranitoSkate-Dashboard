import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { sql } from "@vercel/postgres"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import EliminarAdministradorForm from "@/components/eliminar-administrador-form"

export default async function EliminarAdministradorPage({ params }: { params: { id: string } }) {
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
      nombre_completo
    FROM 
      administradores
    WHERE 
      id = ${params.id}
  `

  if (rows.length === 0) {
    redirect("/dashboard/administradores")
  }

  const administrador = rows[0]

  // No permitir eliminar al propio usuario
  if (administrador.correo_electronico === session.user.email) {
    redirect("/dashboard/administradores?error=No+puedes+eliminar+tu+propio+usuario")
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Eliminar Administrador</h1>

      <Card>
        <CardHeader className="bg-red-50">
          <CardTitle className="text-red-600">Confirmar eliminación</CardTitle>
          <CardDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el usuario administrador.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <p>
              <span className="font-medium">Usuario:</span> {administrador.nombre_usuario}
            </p>
            <p>
              <span className="font-medium">Email:</span> {administrador.correo_electronico}
            </p>
            <p>
              <span className="font-medium">Nombre:</span> {administrador.nombre_completo || "No especificado"}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2 border-t pt-6">
          <Link href="/dashboard/administradores">
            <Button variant="outline">Cancelar</Button>
          </Link>
          <EliminarAdministradorForm id={administrador.id} />
        </CardFooter>
      </Card>
    </div>
  )
}
