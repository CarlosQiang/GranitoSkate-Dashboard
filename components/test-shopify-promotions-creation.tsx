"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, TestTube, CheckCircle, XCircle } from "lucide-react"

export default function TestShopifyPromotionsCreation() {
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [isCreatingPromotion, setIsCreatingPromotion] = useState(false)
  const [connectionResult, setConnectionResult] = useState(null)
  const [creationResult, setCreationResult] = useState(null)
  const [promotionData, setPromotionData] = useState({
    titulo: "Test Promoción " + Date.now(),
    descripcion: "Promoción de prueba",
    tipo: "PORCENTAJE_DESCUENTO",
    valor: "10",
    codigo: "",
  })

  const testConnection = async () => {
    setIsTestingConnection(true)
    setConnectionResult(null)

    try {
      const response = await fetch("/api/shopify/test-promotions")
      const result = await response.json()
      setConnectionResult(result)
    } catch (error) {
      setConnectionResult({
        success: false,
        error: "Error de conexión",
        details: error.message,
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const createTestPromotion = async () => {
    setIsCreatingPromotion(true)
    setCreationResult(null)

    try {
      const response = await fetch("/api/shopify/promotions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...promotionData,
          fechaInicio: new Date().toISOString(),
        }),
      })

      const result = await response.json()
      setCreationResult(result)
    } catch (error) {
      setCreationResult({
        success: false,
        error: "Error de creación",
        details: error.message,
      })
    } finally {
      setIsCreatingPromotion(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Diagnóstico de Promociones Shopify
          </CardTitle>
          <CardDescription>Prueba la conexión y creación de promociones en Shopify</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={testConnection} disabled={isTestingConnection} variant="outline">
              {isTestingConnection ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube className="h-4 w-4" />}
              Probar Conexión
            </Button>
          </div>

          {connectionResult && (
            <Alert className={connectionResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <div className="flex items-center gap-2">
                {connectionResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  <strong>Test de Conexión:</strong> {connectionResult.success ? "Exitoso" : "Fallido"}
                </AlertDescription>
              </div>
              {connectionResult.tests && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={connectionResult.tests.read.success ? "default" : "destructive"}>
                      Lectura: {connectionResult.tests.read.success ? "OK" : "Error"}
                    </Badge>
                    <span className="text-sm">
                      {connectionResult.tests.read.success
                        ? `${connectionResult.tests.read.data} descuentos encontrados`
                        : "No se pueden leer descuentos"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={connectionResult.tests.create.success ? "default" : "destructive"}>
                      Creación: {connectionResult.tests.create.success ? "OK" : "Error"}
                    </Badge>
                    {connectionResult.tests.create.errors && (
                      <span className="text-sm text-red-600">
                        {JSON.stringify(connectionResult.tests.create.errors)}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Crear Promoción de Prueba</CardTitle>
          <CardDescription>Prueba crear una promoción real en Shopify</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                value={promotionData.titulo}
                onChange={(e) => setPromotionData({ ...promotionData, titulo: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="valor">Valor (%)</Label>
              <Input
                id="valor"
                type="number"
                value={promotionData.valor}
                onChange={(e) => setPromotionData({ ...promotionData, valor: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="codigo">Código (opcional)</Label>
            <Input
              id="codigo"
              value={promotionData.codigo}
              onChange={(e) => setPromotionData({ ...promotionData, codigo: e.target.value })}
              placeholder="Dejar vacío para descuento automático"
            />
          </div>

          <Button onClick={createTestPromotion} disabled={isCreatingPromotion}>
            {isCreatingPromotion ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube className="h-4 w-4" />}
            Crear Promoción de Prueba
          </Button>

          {creationResult && (
            <Alert className={creationResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <div className="flex items-center gap-2">
                {creationResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  <strong>Creación de Promoción:</strong> {creationResult.success ? "Exitosa" : "Fallida"}
                </AlertDescription>
              </div>
              {creationResult.promocion && (
                <div className="mt-2">
                  <p className="text-sm">
                    <strong>ID:</strong> {creationResult.promocion.id}
                  </p>
                  <p className="text-sm">
                    <strong>Título:</strong> {creationResult.promocion.titulo}
                  </p>
                </div>
              )}
              {creationResult.error && (
                <div className="mt-2">
                  <p className="text-sm text-red-600">
                    <strong>Error:</strong> {creationResult.error}
                  </p>
                  {creationResult.details && (
                    <pre className="text-xs mt-1 bg-red-100 p-2 rounded overflow-auto">
                      {JSON.stringify(creationResult.details, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
