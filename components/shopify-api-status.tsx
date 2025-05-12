"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { checkShopifyConnection } from "@/lib/shopify"
import { AlertCircle, CheckCircle, RefreshCw, Settings } from "lucide-react"
import Link from "next/link"

export function ShopifyApiStatus() {
  const [status, setStatus] = useState({
    checking: true,
    connected: false,
    error: null,
    shopName: null,
    missingVars: [],
  })

  const checkConnection = async () => {
    setStatus((prev) => ({ ...prev, checking: true }))
    try {
      const result = await checkShopifyConnection()
      setStatus({
        checking: false,
        connected: result.connected || result.success,
        error: result.error || null,
        shopName: result.shop?.name || result.shopName,
        missingVars: result.missingVars || [],
      })
    } catch (error) {
      setStatus({
        checking: false,
        connected: false,
        error: error.message,
        shopName: null,
        missingVars: [],
      })
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  if (status.checking) {
    return (
      <Alert className="bg-blue-50 border-blue-200">
        <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
        <AlertTitle className="text-blue-800">Verificando conexión con Shopify</AlertTitle>
        <AlertDescription className="text-blue-700">Comprobando la conexión con la API de Shopify...</AlertDescription>
      </Alert>
    )
  }

  if (!status.connected) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error de conexión con Shopify</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>{status.error || "No se pudo conectar con la API de Shopify"}</p>
          {status.missingVars && status.missingVars.length > 0 && (
            <div>
              <p>Faltan las siguientes variables de entorno:</p>
              <ul className="list-disc pl-5">
                {status.missingVars.map((variable) => (
                  <li key={variable}>{variable}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={checkConnection}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                Configurar variables
              </Link>
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="bg-green-50 border-green-200">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-800">Conectado a Shopify - Tienda: {status.shopName}</AlertTitle>
      <AlertDescription className="text-green-700 flex items-center justify-between">
        <span>La conexión con la API de Shopify está funcionando correctamente.</span>
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
          Conectado
        </Badge>
      </AlertDescription>
    </Alert>
  )
}
