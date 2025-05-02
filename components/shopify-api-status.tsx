"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export function ShopifyApiStatus() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [details, setDetails] = useState<any>(null)

  const checkConnection = async () => {
    setStatus("loading")
    try {
      const response = await fetch("/api/shopify/check")
      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setMessage("Conexión con Shopify establecida correctamente")
        setDetails(data)
      } else {
        setStatus("error")
        setMessage(data.message || "Error al conectar con Shopify")
        setDetails(data)
      }
    } catch (error) {
      setStatus("error")
      setMessage(`Error al verificar la conexión: ${(error as Error).message}`)
      setDetails(null)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          {status === "loading" && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
          {status === "success" && <CheckCircle className="mr-2 h-4 w-4 text-green-500" />}
          {status === "error" && <AlertCircle className="mr-2 h-4 w-4 text-red-500" />}
          Estado de la API de Shopify
        </CardTitle>
        <CardDescription>Verifica la conexión con la API de Shopify</CardDescription>
      </CardHeader>
      <CardContent>
        {status === "loading" ? (
          <p>Verificando conexión con Shopify...</p>
        ) : status === "success" ? (
          <Alert variant="success">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Conexión exitosa</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error de conexión</AlertTitle>
            <AlertDescription>
              <p>{message}</p>
              {details && (
                <pre className="mt-2 max-h-40 overflow-auto rounded bg-slate-950 p-2 text-xs text-white">
                  {JSON.stringify(details, null, 2)}
                </pre>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={checkConnection} disabled={status === "loading"}>
          {status === "loading" ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Verificar conexión
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
