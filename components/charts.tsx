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

// Datos de ejemplo para los gráficos
const revenueData = [
  { name: "Ene", total: 1200 },
  { name: "Feb", total: 1800 },
  { name: "Mar", total: 2200 },
  { name: "Abr", total: 1800 },
  { name: "May", total: 2400 },
  { name: "Jun", total: 2800 },
  { name: "Jul", total: 3200 },
]

const productsData = [
  { name: "Zapatillas Skate Pro", sales: 124 },
  { name: "Tabla Element Classic", sales: 98 },
  { name: "Ruedas Spitfire 52mm", sales: 87 },
  { name: "Trucks Independent 149", sales: 65 },
  { name: "Rodamientos Bones Reds", sales: 59 },
]

export function RevenueChart({ data = revenueData }) {
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

export function ProductsChart({ data = productsData }) {
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

export function SalesChart({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventas</CardTitle>
        <CardDescription>Ventas mensuales del año actual</CardDescription>
      </CardHeader>
      <CardContent>
        <RevenueChart data={data} />
      </CardContent>
    </Card>
  )
}

export function TopProductsChart({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos más vendidos</CardTitle>
        <CardDescription>Top 5 productos por ventas</CardDescription>
      </CardHeader>
      <CardContent>
        <ProductsChart data={data} />
      </CardContent>
    </Card>
  )
}
