"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function ShopifyFallback() {
  return (
    <Alert variant="warning" className="my-4 border-amber-300 bg-amber-50">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Conexión con Shopify no disponible</AlertTitle>
      <AlertDescription className="text-amber-700">
        <p>No se pudo conectar con la API de Shopify. La aplicación seguirá funcionando con datos locales.</p>
        <p className="mt-2 text-sm">Esto puede deberse a:</p>
        <ul className="mt-1 list-disc pl-5 text-sm space-y-1">
          <li>Credenciales de Shopify incorrectas o expiradas</li>
          <li>Problemas de conectividad con la API de Shopify</li>
          <li>La tienda Shopify no está disponible temporalmente</li>
        </ul>
      </AlertDescription>
    </Alert>
  )
}
