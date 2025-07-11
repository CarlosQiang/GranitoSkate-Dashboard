"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RefreshCw, Database, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface SyncStep {
  name: string
  label: string
  status: "pending" | "running" | "completed" | "error"
  result?: {
    borrados: number
    insertados: number
    errores: number
  }
  error?: string
}

interface SyncAllDataProps {
  onSyncComplete?: () => void
}

export function SyncAllData({ onSyncComplete }: SyncAllDataProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<SyncStep[]>([
    { name: "products", label: "Productos", status: "pending" },
    { name: "collections", label: "Colecciones", status: "pending" },
    { name: "orders", label: "Pedidos", status: "pending" },
    { name: "customers", label: "Clientes", status: "pending" },
    { name: "promotions", label: "Promociones", status: "pending" },
    { name: "shop-data", label: "Datos de la Tienda", status: "pending" },
  ])

  const updateStepStatus = (index: number, status: SyncStep["status"], result?: any, error?: string) => {
    setSteps((prev) => prev.map((step, i) => (i === index ? { ...step, status, result, error } : step)))
  }

  const syncEntity = async (entityName: string, apiEndpoint: string, data?: any) => {
    try {
      console.log(`🔄 Sincronizando ${entityName}...`)

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data || {}),
      })

      if (!response.ok) {
        let errorMessage = `Error HTTP: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch (e) {
          // Si no se puede parsear el JSON del error, usar el mensaje por defecto
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log(`✅ ${entityName} sincronizado:`, result)

      return {
        borrados: result.borrados || 0,
        insertados: result.total || 0,
        errores: result.errores || 0,
      }
    } catch (error) {
      console.error(`❌ Error sincronizando ${entityName}:`, error)
      throw error
    }
  }

  const getAllProducts = async () => {
    try {
      console.log("🔍 Obteniendo TODOS los productos de Shopify...")
      const response = await fetch("/api/shopify/products", {
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error("Error al obtener productos de Shopify")
      }

      const data = await response.json()
      console.log("📦 Productos obtenidos:", data.products?.length || 0)
      return data.products || []
    } catch (error) {
      console.error("❌ Error obteniendo productos:", error)
      return []
    }
  }

  const handleSyncAll = async () => {
    setIsRunning(true)
    setCurrentStep(0)

    // Resetear todos los pasos
    setSteps((prev) => prev.map((step) => ({ ...step, status: "pending", result: undefined, error: undefined })))

    try {
      // Obtener datos del dashboard primero
      console.log("🔍 Obteniendo datos del dashboard...")
      const dashboardResponse = await fetch("/api/dashboard/summary", {
        cache: "no-store",
      })

      if (!dashboardResponse.ok) {
        throw new Error("Error al obtener datos del dashboard")
      }

      const dashboardData = await dashboardResponse.json()
      console.log("📊 Datos del dashboard obtenidos:", dashboardData)

      // Obtener TODOS los productos (no solo los recientes)
      const allProducts = await getAllProducts()
      console.log("📦 Total de productos para sincronizar:", allProducts.length)

      const syncConfigs = [
        {
          name: "products",
          endpoint: "/api/sync/products-replace",
          data: { products: allProducts },
        },
        {
          name: "collections",
          endpoint: "/api/sync/collections-replace",
          data: { collections: dashboardData.allCollections || [] },
        },
        {
          name: "orders",
          endpoint: "/api/sync/orders-replace",
          data: { orders: dashboardData.recentOrders || [] },
        },
        {
          name: "customers",
          endpoint: "/api/sync/customers-replace",
          data: {},
        },
        {
          name: "promotions",
          endpoint: "/api/sync/promotions-replace",
          data: {},
        },
        {
          name: "shop-data",
          endpoint: "/api/sync/shop-data",
          data: {},
        },
      ]

      for (let i = 0; i < syncConfigs.length; i++) {
        const config = syncConfigs[i]
        setCurrentStep(i)
        updateStepStatus(i, "running")

        try {
          const result = await syncEntity(steps[i].label, config.endpoint, config.data)
          const errorsCount = result.errores || 0

          if (errorsCount > 0) {
            updateStepStatus(i, "error", result, `${errorsCount} errores`)
          } else {
            updateStepStatus(i, "completed", result)
          }

          // Pequeña pausa entre sincronizaciones
          await new Promise((resolve) => setTimeout(resolve, 1000))
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Error desconocido"
          updateStepStatus(i, "error", undefined, errorMessage)

          // Continuar con el siguiente paso incluso si hay error
          console.warn(`⚠️ Continuando con el siguiente paso después del error en ${steps[i].label}`)
        }
      }
    } catch (error) {
      console.error("❌ Error general:", error)
    }

    setIsRunning(false)
    setCurrentStep(steps.length)

    // Actualizar el estado de la base de datos
    setTimeout(() => {
      onSyncComplete?.()
    }, 1000)
  }

  const getStepIcon = (step: SyncStep) => {
    switch (step.status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
    }
  }

  const completedSteps = steps.filter((step) => step.status === "completed").length
  const stepsWithErrors = steps.filter((step) => step.status === "error").length
  const totalErrors = steps.reduce((total, step) => {
    if (step.result?.errores) {
      return total + step.result.errores
    }
    return step.status === "error" ? total + 1 : total
  }, 0)
  const progress = ((completedSteps + stepsWithErrors) / steps.length) * 100

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Sincronización Completa de Todos los Datos
        </CardTitle>
        <CardDescription>
          Ejecuta la sincronización de todas las entidades secuencialmente: productos, colecciones, pedidos, clientes,
          promociones y datos de la tienda (SEO, configuración, información del negocio)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Sincronización Secuencial</h3>
                <p className="mt-1 text-sm text-blue-700">
                  Este proceso ejecutará la sincronización de cada entidad una por una, incluyendo los datos de
                  configuración de la tienda. Borrará todos los datos existentes y los reemplazará con los datos
                  actuales de Shopify.
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSyncAll}
            disabled={isRunning}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isRunning ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Sincronizando... ({completedSteps + stepsWithErrors}/{steps.length})
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Sincronizar Todos los Datos
              </>
            )}
          </Button>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso general</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          <div className="space-y-2">
            {steps.map((step, index) => (
              <div key={step.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStepIcon(step)}
                  <div>
                    <p className="font-medium">{step.label}</p>
                    {step.status === "running" && <p className="text-xs text-blue-600">Procesando...</p>}
                    {step.error && <p className="text-xs text-red-600">{step.error}</p>}
                  </div>
                </div>
                {/* ELIMINÉ la sección de la derecha con "+0 insertados" */}
              </div>
            ))}
          </div>

          {!isRunning && (completedSteps > 0 || stepsWithErrors > 0) && (
            <div className="mt-4 p-3 bg-gray-50 border rounded-md">
              <h4 className="font-medium mb-2">Resumen de la sincronización:</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{completedSteps}</div>
                  <div className="text-green-600">Completados</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">{totalErrors}</div>
                  <div className="text-red-600">Con errores</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-600">
                    {steps.length - completedSteps - stepsWithErrors}
                  </div>
                  <div className="text-gray-600">Pendientes</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
