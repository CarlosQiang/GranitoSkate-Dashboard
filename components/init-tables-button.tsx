"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"

export function InitTablesButton() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null)

  const handleInitTables = async () => {
    setIsInitializing(true)
    setMessage(null)
    setIsSuccess(null)

    try {
      const response = await fetch("/api/db/init-tables", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (response.ok) {
        setMessage("✅ Tablas inicializadas correctamente")
        setIsSuccess(true)
      } else {
        setMessage(`❌ Error: ${result.message}`)
        setIsSuccess(false)
      }
    } catch (error) {
      setMessage(`❌ Error al inicializar tablas: ${error instanceof Error ? error.message : "Error desconocido"}`)
      setIsSuccess(false)
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Inicialización de Base de Datos
        </CardTitle>
        <CardDescription>
          Si las tablas aparecen como vacías, puedes inicializar la estructura de la base de datos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Button onClick={handleInitTables} disabled={isInitializing} variant="outline">
            {isInitializing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Inicializando...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Inicializar Tablas
              </>
            )}
          </Button>

          {message && (
            <div className={`flex items-center gap-2 text-sm ${isSuccess ? "text-green-600" : "text-red-600"}`}>
              {isSuccess ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              {message}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
