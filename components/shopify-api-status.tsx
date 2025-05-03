"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export function ShopifyApiStatus() {
  const [status, setStatus] = useState<"loading" | "connected" | "error" | "hidden">("loading")
  const [shopName, setShopName] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [isChecking, setIsChecking] = useState(false)
  const [hasData, setHasData] = useState(false)

  // Verificar si hay datos en la página
  const checkForData = () => {
    // Si estamos en la página de colecciones, verificar si hay colecciones
    if (window.location.pathname.includes("/collections")) {
      const collectionElements = document.querySelectorAll("[data-collection-item]")
      if (collectionElements && collectionElements.length > 0) {
        setHasData(true)
        return true
      }
    }

    // Si estamos en la página de productos, verificar si hay productos
    if (window.location.pathname.includes("/products")) {
      const productElements = document.querySelectorAll("[data-product-item]")
      if (productElements && productElements.length > 0) {
        setHasData(true)
        return true
      }
    }

    return false
  }

  const checkConnection = async () => {
    setIsChecking(true)
    setStatus("loading")

    try {
      // Primero verificamos si hay datos en la página
      if (checkForData()) {
        console.log("Se encontraron datos en la página, ocultando el estado de la API")
        setStatus("hidden")
        setIsChecking(false)
        return
      }

      const response = await fetch("/api/shopify/check", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      })

      let data
      try {
        const text = await response.text()

        if (!text) {
          // Si no hay respuesta pero hay datos, ocultamos el estado
          if (checkForData()) {
            setStatus("hidden")
            setIsChecking(false)
            return
          }

          throw new Error("Respuesta vacía del servidor")
        }

        data = JSON.parse(text)
      } catch (parseError) {
        console.error("Error al parsear la respuesta:", parseError)

        // Si hay un error pero hay datos, ocultamos el estado
        if (checkForData()) {
          setStatus("hidden")
          setIsChecking(false)
          return
        }

        setStatus("error")
        setError(`Error al parsear la respuesta: ${(parseError as Error).message}`)
        setIsChecking(false)
        return
      }

      if (data.success) {
        setStatus("connected")
        setShopName(data.shopName || "")
      } else {
        // Si hay un error pero hay datos, ocultamos el estado
        if (checkForData()) {
          setStatus("hidden")
          setIsChecking(false)
          return
        }

        setStatus("error")
        setError(data.error || "Error desconocido al conectar con Shopify")
      }
    } catch (err) {
      console.error("Error al verificar la conexión con Shopify:", err)

      // Si hay un error pero hay datos, ocultamos el estado
      if (checkForData()) {
        setStatus("hidden")
        setIsChecking(false)
        return
      }

      setStatus("error")
      setError(`Error al verificar la conexión con Shopify: ${(err as Error).message}`)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    // Esperar a que el DOM esté completamente cargado
    const timer = setTimeout(() => {
      checkConnection()
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Si el estado es "hidden", no mostramos nada
  if (status === "hidden") {
    return null
  }

  if (status === "loading") {
    return (
      <Alert>
        <RefreshCw className="h-4 w-4 animate-spin" />
        <AlertTitle>Verificando conexión con Shopify</AlertTitle>
        <AlertDescription>Estamos verificando la conexión con tu tienda Shopify...</AlertDescription>
      </Alert>
    )
  }

  if (status === "error") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error de conexión con Shopify</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={checkConnection}
            disabled={isChecking}
            className="w-fit flex items-center gap-2"
          >
            {isChecking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Reintentar conexión
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert variant="default" className="bg-green-50 border-green-200">
      <CheckCircle2 className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-800">Conectado a Shopify</AlertTitle>
      <AlertDescription className="text-green-700">
        Conexión establecida correctamente con la tienda: <strong>{shopName}</strong>
      </AlertDescription>
    </Alert>
  )
}
