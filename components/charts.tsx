"use client"

import {
  Line,
  Bar,
  BarChart,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { fetchSalesChartData, fetchTopProductsChartData } from "@/lib/api/dashboard"

export function RevenueChart({ data = [], isLoading = false, onRefresh = null }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[350px] bg-gray-50 rounded-md">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[350px] bg-gray-50 rounded-md">
        <p className="text-muted-foreground mb-4">No hay datos de ventas disponibles</p>
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Intentar de nuevo
          </Button>
        )}
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value) => [`${value} €`, "Total"]} labelFormatter={(label) => `Mes: ${label}`} />
        <Legend />
        <Line type="monotone" dataKey="total" stroke="#8884d8" activeDot={{ r: 8 }} name="Ingresos" />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function ProductsChart({ data = [], isLoading = false, onRefresh = null }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[350px] bg-gray-50 rounded-md">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[350px] bg-gray-50 rounded-md">
        <p className="text-muted-foreground mb-4">No hay datos de productos disponibles</p>
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Intentar de nuevo
          </Button>
        )}
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={150} />
        <Tooltip formatter={(value) => [`${value} unidades`, "Ventas"]} />
        <Legend />
        <Bar dataKey="sales" fill="#82ca9d" name="Ventas" />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function SalesChart() {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const chartData = await fetchSalesChartData()
      setData(chartData)
    } catch (err) {
      console.error("Error al cargar datos de ventas:", err)
      setError(err.message || "Error al cargar datos")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Ventas</CardTitle>
          <CardDescription>Ventas mensuales del año actual</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </CardHeader>
      <CardContent>
        <RevenueChart data={data} isLoading={isLoading} onRefresh={loadData} />
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </CardContent>
    </Card>
  )
}

export function TopProductsChart() {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const chartData = await fetchTopProductsChartData()
      setData(chartData)
    } catch (err) {
      console.error("Error al cargar datos de productos:", err)
      setError(err.message || "Error al cargar datos")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Productos más vendidos</CardTitle>
          <CardDescription>Top 5 productos por ventas</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </CardHeader>
      <CardContent>
        <ProductsChart data={data} isLoading={isLoading} onRefresh={loadData} />
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </CardContent>
    </Card>
  )
}
