"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export function DbInitializer() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null)

  const initializeDatabase = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/db/init", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al inicializar la base de datos")
      }

      setResult({
        success: true,
        message: data.message || "Base de datos inicializada correctamente",
      })
    } catch (error: any) {
      console.error("Error al inicializar la base de datos:", error)
      setResult({
        success: false,
        error: error.message || "Ocurrió un error al inicializar la base de datos",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inicializar Base de Datos</CardTitle>
        <CardDescription>Crea las tablas necesarias para el funcionamiento de la aplicación</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-4">Este proceso creará las siguientes tablas si no existen:</p>
        <ul className="list-disc pl-5 text-sm text-gray-500 mb-4">
          <li>administradores</li>
          <li>registro_sincronizacion</li>
          <li>productos</li>
          <li>colecciones</li>
          <li>clientes</li>
          <li>pedidos</li>
          <li>promociones</li>
        </ul>
        <p className="text-sm text-gray-500 mb-4">
          También creará un usuario administrador por defecto si no existe ninguno:
        </p>
        <ul className="list-disc pl-5 text-sm text-gray-500">
          <li>Usuario: admin</li>
          <li>Contraseña: admin123</li>
        </ul>

        {result && (
          <div className={`mt-4 p-3 rounded-md ${result.success ? "bg-green-50" : "bg-red-50"}`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {result.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${result.success ? "text-green-800" : "text-red-800"}`}>
                  {result.success ? result.message : result.error}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={initializeDatabase} disabled={loading} className="w-full">
          {loading ? "Inicializando..." : "Inicializar Base de Datos"}
        </Button>
      </CardFooter>
    </Card>
  )
}
