"use client"

import { CardFooter } from "@/components/ui/card"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Database, RefreshCw } from "lucide-react"

export function DbInitializer() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "idle">("idle")
  const [message, setMessage] = useState<string>("Verificando tablas...")
  const [tablas, setTablas] = useState<Record<string, boolean>>({})
  const [todasExisten, setTodasExisten] = useState<boolean>(false)

  const verificarTablas = async () => {
    setStatus("loading")
    setMessage("Verificando tablas...")

    try {
      const response = await fetch("/api/db/init")
      const data = await response.json()

      if (data.success) {
        setTablas(data.tablas)
        setTodasExisten(data.todasExisten)
        setStatus("success")
        setMessage("Verificación completada")
      } else {
        setStatus("error")
        setMessage(data.error || "Error al verificar tablas")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Error al verificar tablas")
      console.error(error)
    }
  }

  const inicializarDB = async () => {
    setStatus("loading")
    setMessage("Inicializando base de datos...")

    try {
      const response = await fetch("/api/db/init", {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setMessage(data.message)
        // Verificar tablas después de inicializar
        verificarTablas()
      } else {
        setStatus("error")
        setMessage(data.error || "Error al inicializar base de datos")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Error al inicializar base de datos")
      console.error(error)
    }
  }

  useEffect(() => {
    verificarTablas()
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Inicialización de Base de Datos
        </CardTitle>
        <CardDescription>Verifica y crea las tablas necesarias en la base de datos</CardDescription>
      </CardHeader>
      <CardContent>
        {status === "loading" && (
          <Alert>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <AlertTitle>Procesando</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <Alert variant={todasExisten ? "default" : "warning"}>
              {todasExisten ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <AlertTitle>{todasExisten ? "Base de datos inicializada" : "Faltan tablas"}</AlertTitle>
              <AlertDescription>
                {todasExisten
                  ? "Todas las tablas necesarias existen en la base de datos"
                  : 'Algunas tablas no existen. Haz clic en "Inicializar Base de Datos" para crearlas'}
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(tablas).map(([tabla, existe]) => (
                <div key={tabla} className="flex items-center justify-between p-3 border rounded-md">
                  <span className="font-medium">{tabla}</span>
                  {existe ? (
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" /> Existe
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600">
                      <XCircle className="h-4 w-4 mr-1" /> No existe
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={verificarTablas} disabled={status === "loading"}>
          <RefreshCw className={`h-4 w-4 mr-2 ${status === "loading" ? "animate-spin" : ""}`} />
          Verificar Tablas
        </Button>
        <Button onClick={inicializarDB} disabled={status === "loading" || todasExisten}>
          <Database className="h-4 w-4 mr-2" />
          Inicializar Base de Datos
        </Button>
      </CardFooter>
    </Card>
  )
}
