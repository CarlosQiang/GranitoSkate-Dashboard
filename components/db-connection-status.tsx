"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function DbConnectionStatus() {
  const [status, setStatus] = useState<"loading" | "connected" | "error">("loading")
  const [message, setMessage] = useState<string>("Verificando conexión a la base de datos...")
  const [timestamp, setTimestamp] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkConnection = async () => {
    setIsChecking(true)
    setStatus("loading")
    setMessage("Verificando conexión a la base de datos...")

    try {
      const response = await fetch("/api/db/check")
      const data = await response.json()

      if (response.ok) {
        setStatus("connected")
        setMessage(data.message)
        setTimestamp(data.timestamp)
      } else {
        setStatus("error")
        setMessage(data.message || "Error desconocido al conectar con la base de datos")
      }
    } catch (error) {
      setStatus("error")
      setMessage((error as Error).message || "Error al verificar la conexión")
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status === "connected" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
          {status === "error" && <AlertCircle className="h-5 w-5 text-red-500" />}
          {status === "loading" && <RefreshCw className="h-5 w-5 animate-spin" />}
          Estado de la Base de Datos
        </CardTitle>
        <CardDescription>Verifica la conexión con la base de datos Neon PostgreSQL</CardDescription>
      </CardHeader>
      <CardContent>
        {status === "connected" && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertTitle>Conexión establecida</AlertTitle>
            <AlertDescription>
              {message}
              {timestamp && (
                <div className="mt-2 text-xs text-gray-500">
                  Timestamp del servidor: {new Date(timestamp).toLocaleString()}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error de conexión</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {status === "loading" && (
          <div className="flex items-center justify-center p-4">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">{message}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={checkConnection} disabled={isChecking} variant="outline" className="w-full">
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
