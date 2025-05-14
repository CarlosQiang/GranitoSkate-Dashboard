"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function InitStatus() {
  const [status, setStatus] = useState<{
    checked: boolean
    success: boolean
    message: string
    isLoading: boolean
    showError: boolean
  }>({
    checked: false,
    success: false,
    message: "Verificando inicialización...",
    isLoading: true,
    showError: true,
  })

  const checkInitialization = async () => {
    setStatus((prev) => ({ ...prev, isLoading: true }))
    try {
      const response = await fetch("/api/init", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Accept: "application/json",
        },
      })

      // Verificar si la respuesta es JSON válido
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Respuesta no válida: esperaba JSON pero recibió ${contentType}`)
      }

      const data = await response.json()

      // Verificar si hay datos de productos o colecciones para determinar si realmente hay un problema
      try {
        const productsResponse = await fetch("/api/shopify/products?limit=1", {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Accept: "application/json",
          },
        })

        if (productsResponse.ok) {
          const productsData = await productsResponse.json()
          // Si podemos obtener productos, entonces la conexión realmente funciona
          const actuallyWorks = productsData && !productsData.error && productsData.products?.length > 0

          setStatus({
            checked: true,
            // Si podemos obtener productos, consideramos que la inicialización fue exitosa
            success: data.success || actuallyWorks,
            message:
              actuallyWorks && !data.success
                ? "Sistema funcionando correctamente (ignorando error de inicialización)"
                : data.message || "Inicialización completada correctamente",
            isLoading: false,
            showError: !(actuallyWorks && !data.success),
          })
          return
        }
      } catch (productError) {
        console.warn("Error al verificar productos:", productError)
      }

      setStatus({
        checked: true,
        success: data.success,
        message: data.message || "Inicialización completada",
        isLoading: false,
        showError: true,
      })
    } catch (error) {
      console.error("Error en la inicialización:", error)
      setStatus({
        checked: true,
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido",
        isLoading: false,
        showError: true,
      })
    }
  }

  useEffect(() => {
    checkInitialization()
  }, [])

  if (!status.checked && status.isLoading) {
    return (
      <Alert variant="default" className="w-full mb-4 bg-muted/50">
        <div className="flex items-center">
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          <AlertTitle>Verificando estado del sistema...</AlertTitle>
        </div>
      </Alert>
    )
  }

  // No mostrar nada si la inicialización fue exitosa o si decidimos ocultar el error
  if (status.success || !status.showError) {
    return null
  }

  return (
    <Alert variant="destructive" className="w-full mb-4">
      <div className="flex items-start justify-between w-full">
        <div className="flex items-start">
          <AlertCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <AlertTitle className="text-sm font-medium">Error de inicialización</AlertTitle>
            <AlertDescription className="text-sm break-words max-w-[90%]">{status.message}</AlertDescription>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setStatus((prev) => ({ ...prev, showError: false }))}
          className="ml-2 flex-shrink-0"
        >
          Ignorar
        </Button>
      </div>
    </Alert>
  )
}
