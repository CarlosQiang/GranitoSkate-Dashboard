import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Database } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const dynamic = "force-dynamic"
export const revalidate = 0

async function checkDatabaseTables() {
  try {
    // Verificar conexión básica
    await prisma.$queryRaw`SELECT 1`

    // Verificar tablas existentes
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `

    // Verificar si hay datos en las tablas principales
    const adminCount = await prisma.administrador.count()
    const productCount = await prisma.$queryRaw`SELECT COUNT(*) FROM productos`
    const collectionCount = await prisma.$queryRaw`SELECT COUNT(*) FROM colecciones`

    return {
      connected: true,
      tables: tables as { table_name: string }[],
      counts: {
        administradores: adminCount,
        productos: Number((productCount as any)[0]?.count || 0),
        colecciones: Number((collectionCount as any)[0]?.count || 0),
      },
    }
  } catch (error) {
    console.error("Error al verificar la base de datos:", error)
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Error desconocido",
      tables: [],
      counts: {
        administradores: 0,
        productos: 0,
        colecciones: 0,
      },
    }
  }
}

async function DatabaseCheck() {
  const dbStatus = await checkDatabaseTables()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Diagnóstico de Base de Datos</h1>

      {/* Estado de conexión */}
      {dbStatus.connected ? (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800">Conexión establecida</AlertTitle>
          <AlertDescription className="text-green-700">
            La conexión con la base de datos PostgreSQL está funcionando correctamente.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Error de conexión</AlertTitle>
          <AlertDescription>No se pudo conectar con la base de datos: {dbStatus.error}</AlertDescription>
        </Alert>
      )}

      {/* Tablas encontradas */}
      {dbStatus.connected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Tablas en la base de datos
            </CardTitle>
            <CardDescription>Se encontraron {dbStatus.tables.length} tablas en la base de datos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dbStatus.tables.map((table) => (
                <div key={table.table_name} className="p-3 bg-gray-50 rounded-md">
                  {table.table_name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conteo de registros */}
      {dbStatus.connected && (
        <Card>
          <CardHeader>
            <CardTitle>Registros en tablas principales</CardTitle>
            <CardDescription>Cantidad de registros encontrados en las tablas principales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-md">
                <div className="text-sm text-blue-600 font-medium">Administradores</div>
                <div className="text-2xl font-bold">{dbStatus.counts.administradores}</div>
              </div>
              <div className="p-4 bg-green-50 rounded-md">
                <div className="text-sm text-green-600 font-medium">Productos</div>
                <div className="text-2xl font-bold">{dbStatus.counts.productos}</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-md">
                <div className="text-sm text-purple-600 font-medium">Colecciones</div>
                <div className="text-2xl font-bold">{dbStatus.counts.colecciones}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button asChild>
          <Link href="/dashboard/diagnostics">Volver a Diagnósticos</Link>
        </Button>
      </div>
    </div>
  )
}

export default function DatabaseCheckPage() {
  return (
    <Suspense fallback={<div>Cargando diagnóstico de base de datos...</div>}>
      <DatabaseCheck />
    </Suspense>
  )
}
