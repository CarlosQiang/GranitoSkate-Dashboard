"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { fetchSalesOverview } from "@/lib/api/analytics"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

export function SalesOverview() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const salesData = await fetchSalesOverview()
        setData(salesData)
      } catch (err) {
        console.error("Error loading sales overview:", err)
        setError("No se pudieron cargar los datos de ventas")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-destructive/10 text-destructive rounded-md">
        <AlertCircle className="h-5 w-5 mr-2" />
        <p>{error}</p>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No hay datos de ventas disponibles
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => {
            const date = new Date(value)
            return `${date.getDate()}/${date.getMonth() + 1}`
          }}
        />
        <YAxis />
        <Tooltip
          formatter={(value) => [`${value} €`, "Ventas"]}
          labelFormatter={(label) => {
            const date = new Date(label)
            return date.toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
            })
          }}
        />
        <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
