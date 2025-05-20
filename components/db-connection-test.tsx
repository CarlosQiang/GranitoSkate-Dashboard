"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function DbConnectionTest() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const testConnection = async () => {
    setStatus("loading")
    try {
      const response = await fetch("/api/db/check", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(data.message || "Conexión a la base de datos establecida correctamente")
      } else {
        setStatus("error")
        setMessage(data.error || "Error al conectar con la base de datos")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Error al realizar la prueba de conexión")
      console.error("Error al probar la conexión:", error)
    }
  }

  useEffect(() => {
    // Probar la conexión automáticamente al cargar el componente
    testConnection()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Estado de la conexión a la base de datos</h3>
        <Button onClick={testConnection} disabled={status === "loading"} variant="outline" size="sm">
          {status === "loading" ? "Probando..." : "Probar conexión"}
        </Button>
      </div>

      {status === "loading" && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Probando conexión a la base de datos...</AlertDescription>
        </Alert>
      )}

      {status === "success" && (
        <Alert variant="default" className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle>Conexión exitosa</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {status === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error de conexión</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
