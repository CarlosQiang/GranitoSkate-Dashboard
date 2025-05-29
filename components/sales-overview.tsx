"use client"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface SalesOverviewProps {
  data?: Array<{
    date: string
    sales: number
    orders: number
  }>
}

export function SalesOverview({ data = [] }: SalesOverviewProps) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    // Generar datos de ejemplo para los últimos 7 días si no hay datos reales
    const exampleData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return {
        date: date.toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
        sales: Math.floor(Math.random() * 100) + 50,
        orders: Math.floor(Math.random() * 5) + 1,
      }
    })

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={exampleData}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={(value) => `€${value}`} />
          <Tooltip formatter={(value) => [`€${value}`, "Ventas"]} />
          <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(value)
  }

  const chartData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chartData}
        margin={{
          top: 5,
          right: 10,
          left: 10,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis tickFormatter={(value) => `€${value}`} />
        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
        <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
