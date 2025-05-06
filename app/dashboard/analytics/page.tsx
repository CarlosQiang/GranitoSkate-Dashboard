"use client"

import { useState, useEffect } from "react"

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSales: "€0.00",
    totalOrders: 0,
    averageOrderValue: "€0.00",
    conversionRate: "0%",
  })

  useEffect(() => {
    // Simulamos la carga de datos
    const timer = setTimeout(() => {
      setStats({
        totalSales: "€4,250.00",
        totalOrders: 42,
        averageOrderValue: "€101.19",
        conversionRate: "2.4%",
      })
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Estadísticas</h1>
        <p className="text-muted-foreground">Analiza el rendimiento de tu tienda</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Ventas totales</h3>
          </div>
          <div>
            {isLoading ? (
              <div className="h-7 w-20 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <div className="text-2xl font-bold">{stats.totalSales}</div>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Pedidos</h3>
          </div>
          <div>
            {isLoading ? (
              <div className="h-7 w-20 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Valor medio</h3>
          </div>
          <div>
            {isLoading ? (
              <div className="h-7 w-20 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <div className="text-2xl font-bold">{stats.averageOrderValue}</div>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Tasa de conversión</h3>
          </div>
          <div>
            {isLoading ? (
              <div className="h-7 w-20 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <div className="text-2xl font-bold">{stats.conversionRate}</div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">Ventas por período</h3>
          <p className="text-sm text-muted-foreground">Comparativa de ventas en los últimos 30 días</p>
        </div>
        <div className="p-6 pt-0 h-80 flex items-center justify-center">
          {isLoading ? (
            <div className="h-full w-full bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Los datos de ventas estarán disponibles próximamente</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
