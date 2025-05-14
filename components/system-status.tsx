"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react"

export function SystemStatus() {
  const [dbStatus, setDbStatus] = useState<"loading" | "ok" | "error">("loading")
  const [dbMessage, setDbMessage] = useState("")
  const [shopifyStatus, setShopifyStatus] = useState<"loading" | "ok" | "error">("loading")
  const [shopifyMessage, setShopifyMessage] = useState("")
  const [isChecking, setIsChecking] = useState(false)

  const checkStatus = async () => {
    setIsChecking(true)
    setDbStatus("loading")
    setShopifyStatus("loading")

    // Verificar conexión a la base de datos
    try {
      const dbResponse = await fetch("/api/system/db-check")
      const dbData = await dbResponse.json()

      if (dbResponse.ok && dbData.status === "ok") {
        setDbStatus("ok")
        setDbMessage(dbData.message)
      } else {
        setDbStatus("error")
        setDbMessage(dbData.message || "Error al conectar con la base de datos")
      }
    } catch (error) {
      setDbStatus("error")
      setDbMessage("Error al verificar la conexión a la base de datos")
      console.error("Error al verificar la conexión a la base de datos:", error)
    }

    // Verificar conexión con Shopify
    try {
      const shopifyResponse = await fetch("/api/shopify/check")
      const shopifyData = await shopifyResponse.json()

      if (shopifyResponse.ok && shopifyData.success) {
        setShopifyStatus("ok")
        setShopifyMessage("Conexión con Shopify establecida correctamente")
      } else {
        setShopifyStatus("error")
        setShopifyMessage(shopifyData.message || "Error al conectar con Shopify")
      }
    } catch (error) {
      setShopifyStatus("error")
      setShopifyMessage("Error al verificar la conexión con Shopify")
      console.error("Error al verificar la conexión con Shopify:", error)
    }

    setIsChecking(false)
  }

  useEffect(() => {
    checkStatus()
  }, [])

  const getStatusIcon = (status: "loading" | "ok" | "error") => {
    if (status === "loading") return <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
    if (status === "ok") return <CheckCircle className="h-5 w-5 text-green-500" />
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Estado del Sistema
        </CardTitle>
        <CardDescription>Verifica el estado de las conexiones del sistema</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(dbStatus)}
              <span className="font-medium">Base de Datos</span>
            </div>
            <span
              className={`text-sm ${dbStatus === "ok" ? "text-green-500" : dbStatus === "error" ? "text-red-500" : "text-blue-500"}`}
            >
              {dbStatus === "loading" ? "Verificando..." : dbStatus === "ok" ? "Conectado" : "Error"}
            </span>
          </div>

          {dbStatus === "error" && (
            <Alert variant="destructive">
              <AlertTitle>Error de conexión a la base de datos</AlertTitle>
              <AlertDescription>{dbMessage}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(shopifyStatus)}
              <span className="font-medium">Shopify</span>
            </div>
            <span
              className={`text-sm ${shopifyStatus === "ok" ? "text-green-500" : shopifyStatus === "error" ? "text-red-500" : "text-blue-500"}`}
            >
              {shopifyStatus === "loading" ? "Verificando..." : shopifyStatus === "ok" ? "Conectado" : "Error"}
            </span>
          </div>

          {shopifyStatus === "error" && (
            <Alert variant="destructive">
              <AlertTitle>Error de conexión con Shopify</AlertTitle>
              <AlertDescription>{shopifyMessage}</AlertDescription>
            </Alert>
          )}
        </div>

        <Button onClick={checkStatus} disabled={isChecking} variant="outline" className="w-full">
          {isChecking ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Verificar Conexiones
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
