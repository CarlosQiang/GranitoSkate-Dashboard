"use client"

interface ChartData {
  month?: string
  name?: string
  total?: number
  sales?: number
}

interface ChartProps {
  data: ChartData[]
}

export function RevenueChart({ data }: ChartProps) {
  return (
    <div className="h-[300px] flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Gráfico de ingresos</p>
        <p className="text-sm text-muted-foreground mt-2">{data.length} puntos de datos disponibles</p>
      </div>
    </div>
  )
}

export function ProductsChart({ data }: ChartProps) {
  return (
    <div className="h-[300px] flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Gráfico de productos</p>
        <p className="text-sm text-muted-foreground mt-2">{data.length} productos disponibles</p>
      </div>
    </div>
  )
}
