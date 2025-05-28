"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, RefreshCw } from "lucide-react"

export function InitDbButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const initializeDatabase = async () => {
    setStatus("loading")
    setMessage("")

    try {
      const response = await fetch("/api/init-db", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(data.message || "Base de datos inicializada correctamente")
      } else {
        setStatus("error")
        setMessage(data.message || "Error al inicializar la base de datos")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Error de conexión al inicializar la base de datos")
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={initializeDatabase} disabled={status === "loading"} className="w-full">
        {status === "loading" ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Inicializando...
          </>
        ) : (
          "Inicializar Base de Datos"
        )}
      </Button>

      {status === "success" && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700">{message}</AlertDescription>
        </Alert>
      )}

      {status === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default InitDbButton
