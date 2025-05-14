"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AutoSync() {
  const [syncStatus, setSyncStatus] = useState<{
    isChecking: boolean
    needsSync: boolean
    isLoading: boolean
    error: string | null
    showAlert: boolean
  }>({
    isChecking: true,
    needsSync: false,
    isLoading: false,
    error: null,
    showAlert: true,
  })

  const checkDatabaseStatus = async () => {
    try {
      setSyncStatus((prev) => ({ ...prev, isChecking: true }))

      // Intentar con la nueva ruta primero
      let response = await fetch("/api/db/check", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }).catch(() => null)

      // Si falla, intentar con la ruta alternativa
      if (!response || !response.ok) {
        response = await fetch("/api/system/db-check", {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        }).catch(() => null)
      }

      // Si ambas rutas fallan, manejamos el error
      if (!response || !response.ok) {
        throw new Error("No se pudo verificar el estado de la base de datos")
      }

      const data = await response.json()

      setSyncStatus({
        isChecking: false,
        needsSync: data.isEmpty === true,
        isLoading: false,
        error: null,
        showAlert: data.isEmpty === true,
      })
    } catch (error) {
      console.error("Error al verificar el estado de la base de datos:", error)
      setSyncStatus({
        isChecking: false,
        needsSync: false,
        isLoading: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        showAlert: true,
      })
    }
  }

  const syncData = async () => {
    try {
      setSyncStatus((prev) => ({ ...prev, isLoading: true }))

      const response = await fetch("/api/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      })

      if (!response.ok) {
        throw new Error(`Error al sincronizar datos: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Error desconocido durante la sincronización")
      }

      setSyncStatus({
        isChecking: false,
        needsSync: false,
        isLoading: false,
        error: null,
        showAlert: false,
      })
    } catch (error) {
      console.error("Error durante la sincronización:", error)
      setSyncStatus((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Error desconocido durante la sincronización",
        showAlert: true,
      }))
    }
  }

  useEffect(() => {
    // Solo ejecutar la verificación si estamos en el cliente
    if (typeof window !== "undefined") {
      checkDatabaseStatus()
    }
  }, [])

  if (!syncStatus.showAlert) {
    return null
  }

  if (syncStatus.isChecking) {
    return (
      <Alert variant="default" className="mb-4 bg-muted/50">
        <div className="flex items-center">
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          <AlertTitle>Verificando estado de la base de datos...</AlertTitle>
        </div>
      </Alert>
    )
  }

  if (syncStatus.error) {
    return (
      <Alert variant="default" className="mb-4 bg-yellow-50 border-yellow-200">
        <div className="flex items-start justify-between w-full">
          <div className="flex items-start">
            <AlertCircle className="h-4 w-4 mt-0.5 mr-2 text-yellow-600" />
            <div>
              <AlertTitle className="text-sm font-medium text-yellow-800">Advertencia</AlertTitle>
              <AlertDescription className="text-sm text-yellow-700">
                No se pudo verificar el estado de la base de datos. La aplicación seguirá funcionando con los datos
                disponibles.
              </AlertDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSyncStatus((prev) => ({ ...prev, showAlert: false }))}
            className="ml-2 flex-shrink-0 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
          >
            Ignorar
          </Button>
        </div>
      </Alert>
    )
  }

  if (syncStatus.needsSync) {
    return (
      <Alert variant="default" className="mb-4 bg-blue-50 border-blue-200">
        <div className="flex items-start justify-between w-full">
          <div className="flex items-start">
            <AlertCircle className="h-4 w-4 mt-0.5 mr-2 text-blue-600" />
            <div>
              <AlertTitle className="text-sm font-medium text-blue-800">Sincronización necesaria</AlertTitle>
              <AlertDescription className="text-sm text-blue-700">
                La base de datos está vacía. Se recomienda sincronizar los datos con Shopify.
              </AlertDescription>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={syncData}
              disabled={syncStatus.isLoading}
              className="flex-shrink-0 border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              {syncStatus.isLoading ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                "Sincronizar"
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSyncStatus((prev) => ({ ...prev, showAlert: false }))}
              className="flex-shrink-0 border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              Ignorar
            </Button>
          </div>
        </div>
      </Alert>
    )
  }

  return null
}
