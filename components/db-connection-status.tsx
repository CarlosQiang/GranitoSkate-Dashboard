"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function DbConnectionStatus() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState<string>("")
  const [isChecking, setIsChecking] = useState(false)

  const checkDbConnection = async () => {
    setIsChecking(true)
    setStatus("loading")
    setMessage("Verificando conexión con la base de datos...")

    try {
      const response = await fetch("/api/db/check", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
      })

      const data = await response.json()

      if (response.ok && data.connected) {
        setStatus("success")
        setMessage(data.message || "Conexión exitosa con la base de datos")
      } else {
        setStatus("error")
        setMessage(data.error || "Error al conectar con la base de datos")
      }
    } catch (error) {
      console.error("Error al verificar conexión con la base de datos:", error)
      setStatus("error")
      setMessage(
        error instanceof Error ? error.message : "Error desconocido al verificar conexión con la base de datos",
      )
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkDbConnection()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
          {status === "error" && <XCircle className="h-5 w-5 text-red-500" />}
          {status === "loading" && <RefreshCw className="h-5 w-5 animate-spin" />}
          Conexión con la Base de Datos
        </CardTitle>
        <CardDescription>Verifica la conexión con la base de datos PostgreSQL</CardDescription>
      </CardHeader>
      <CardContent>
        {status === "loading" ? (
          <div className="flex items-center justify-center p-4">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Verificando conexión con la base de datos...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {status === "error" && (
              <Alert variant="destructive">
                <AlertTitle>Error de conexión</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {status === "success" && (
              <Alert className="bg-green-50 border-green-200 text-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>Conexión exitosa</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={checkDbConnection} disabled={isChecking} variant="outline" className="w-full">
          {isChecking ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Verificar conexión
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default DbConnectionStatus
