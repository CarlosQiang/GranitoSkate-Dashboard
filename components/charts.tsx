"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function BarChart({ data, title, description }) {
  // Implementación simplificada de un gráfico de barras
  const maxValue = Math.max(...data.map((item) => item.value || item.sales || 0))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="w-24 text-sm">{item.label || item.month || item.name}</div>
              <div className="flex-1">
                <div className="h-4 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${((item.value || item.sales || 0) / maxValue) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="w-12 text-right text-sm">{item.value || item.sales || 0}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function LineChart({ data, title, description }) {
  // Implementación simplificada de un gráfico de líneas
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>
        <div className="h-[200px] flex items-end justify-between">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className="w-8 bg-primary rounded-t-sm"
                style={{
                  height: `${(item.value || item.sales || 0) / 100}px`,
                }}
              />
              <div className="mt-2 text-xs">{item.label || item.month || item.name}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function PieChart({ data, title, description }) {
  // Implementación simplificada de un gráfico circular
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent className="flex justify-center">
        <div className="w-40 h-40 rounded-full border-8 border-primary flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {data.reduce((sum, item) => sum + (item.value || item.sales || 0), 0)}
            </div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>
      </CardContent>
      <div className="px-6 pb-6">
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{
                  backgroundColor: `hsl(${index * 40}, 70%, 50%)`,
                }}
              />
              <div className="flex-1 text-sm">{item.label || item.name}</div>
              <div className="text-sm font-medium">{item.value || item.sales || 0}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

export function DashboardChart({ type = "bar", ...props }) {
  switch (type) {
    case "bar":
      return <BarChart {...props} />
    case "line":
      return <LineChart {...props} />
    case "pie":
      return <PieChart {...props} />
    default:
      return <BarChart {...props} />
  }
}
