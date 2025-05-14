"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Database, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function DbInitializer() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState<string>("")

  const initializeDb = async () => {
    setStatus("loading")
    setMessage("Inicializando base de datos...")

    try {
      const response = await fetch("/api/db/init")
      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(data.message)
      } else {
        setStatus("error")
        setMessage(data.message || "Error desconocido al inicializar la base de datos")
      }
    } catch (error) {
      setStatus("error")
      setMessage((error as Error).message || "Error al inicializar la base de datos")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Inicialización de Base de Datos
        </CardTitle>
        <CardDescription>Crea las tablas necesarias en la base de datos si no existen</CardDescription>
      </CardHeader>
      <CardContent>
        {status === "idle" && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Inicialización pendiente</AlertTitle>
            <AlertDescription>Haz clic en el botón para inicializar la base de datos</AlertDescription>
          </Alert>
        )}

        {status === "loading" && (
          <div className="flex items-center justify-center p-4">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">{message}</span>
          </div>
        )}

        {status === "success" && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertTitle>Inicialización completada</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error de inicialización</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={initializeDb} disabled={status === "loading"} className="w-full">
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
