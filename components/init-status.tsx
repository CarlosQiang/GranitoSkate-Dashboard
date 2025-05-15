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
      // Intentar con la ruta principal
      const response = await fetch("/api/init", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }).catch(() => null)

      // Si falla, intentar verificar directamente si podemos obtener datos
      let data = { success: false, message: "No se pudo verificar la inicialización" }
      let actuallyWorks = false

      if (response && response.ok) {
        data = await response.json()
      }

      // Verificar si podemos obtener datos de Shopify
      try {
        // Intentar con la nueva ruta
        const productsResponse = await fetch("/api/shopify/products?limit=1", {
          cache: "no-store",
        }).catch(() => null)

        // Si falla, intentar con la ruta alternativa
        let productsData = null
        if (productsResponse && productsResponse.ok) {
          productsData = await productsResponse.json()
        } else {
          // Intentar con otra ruta que podría funcionar
          const altResponse = await fetch("/api/shopify/proxy", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `
                query {
                  shop {
                    name
                  }
                }
              `,
            }),
          }).catch(() => null)

          if (altResponse && altResponse.ok) {
            const altData = await altResponse.json()
            productsData = { success: true, shop: altData.data?.shop }
          }
        }

        // Si podemos obtener datos, consideramos que funciona
        actuallyWorks = productsData && !productsData.error && (productsData.products?.length > 0 || productsData.shop)
      } catch (e) {
        console.warn("Error al verificar datos de Shopify:", e)
      }

      setStatus({
        checked: true,
        // Si podemos obtener productos, consideramos que la inicialización fue exitosa
        // incluso si el endpoint de inicialización reporta un error
        success: data.success || actuallyWorks,
        message:
          actuallyWorks && !data.success
            ? "Sistema funcionando correctamente (ignorando error de inicialización)"
            : data.message || "Inicialización completada correctamente",
        isLoading: false,
        // Solo mostrar el error si realmente no podemos obtener datos de Shopify
        showError: !(actuallyWorks || data.success),
      })
    } catch (error) {
      console.error("Error al verificar inicialización:", error)
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
    // Solo ejecutar en el cliente
    if (typeof window !== "undefined") {
      checkInitialization()
    }
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
    <Alert variant="default" className="w-full mb-4 bg-yellow-50 border-yellow-200">
      <div className="flex items-start justify-between w-full">
        <div className="flex items-start">
          <AlertCircle className="h-4 w-4 mt-0.5 mr-2 text-yellow-600" />
          <div>
            <AlertTitle className="text-sm font-medium text-yellow-800">Advertencia de inicialización</AlertTitle>
            <AlertDescription className="text-sm text-yellow-700 break-words max-w-[90%]">
              {status.message}. La aplicación seguirá funcionando con los datos disponibles.
            </AlertDescription>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setStatus((prev) => ({ ...prev, showError: false }))}
          className="ml-2 flex-shrink-0 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
        >
          Ignorar
        </Button>
      </div>
    </Alert>
  )
}
