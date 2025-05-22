"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle, XCircle, Database } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function DbInitializer() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState<string>("")

  const initializeDb = async () => {
    setStatus("loading")
    setMessage("Inicializando base de datos...")

    try {
      const response = await fetch("/api/db/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setStatus("success")
        setMessage(data.message || "Base de datos inicializada correctamente")
      } else {
        setStatus("error")
        setMessage(data.error || "Error al inicializar la base de datos")
      }
    } catch (error) {
      console.error("Error al inicializar la base de datos:", error)
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Error desconocido al inicializar la base de datos")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inicializar Base de Datos</CardTitle>
        <CardDescription>Crea las tablas necesarias en la base de datos</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Esta herramienta inicializa la base de datos creando todas las tablas necesarias para el funcionamiento de la
          aplicación. Úsala solo si es la primera vez que configuras la aplicación o si necesitas reiniciar la base de
          datos.
        </p>

        {status === "loading" && (
          <div className="flex items-center justify-center p-4">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Inicializando base de datos...</span>
          </div>
        )}

        {status === "success" && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Inicialización exitosa</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error de inicialización</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={initializeDb} disabled={status === "loading"} variant="outline" className="w-full">
          {status === "loading" ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Inicializando...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Inicializar Base de Datos
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default DbInitializer
