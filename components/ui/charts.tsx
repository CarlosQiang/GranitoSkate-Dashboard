"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SimpleChartProps {
  title: string
  data: number[]
  labels: string[]
  type?: "bar" | "line"
  height?: number
  className?: string
}

export function SimpleChart({ title, data, labels, type = "bar", height = 300, className }: SimpleChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Configuración básica
    const padding = 40
    const chartWidth = canvas.width - padding * 2
    const chartHeight = canvas.height - padding * 2
    const maxValue = Math.max(...data) * 1.1 // 10% más alto que el valor máximo

    // Dibujar ejes
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, canvas.height - padding)
    ctx.lineTo(canvas.width - padding, canvas.height - padding)
    ctx.strokeStyle = "#ccc"
    ctx.stroke()

    // Dibujar etiquetas del eje X
    ctx.textAlign = "center"
    ctx.fillStyle = "#666"
    ctx.font = "10px Arial"
    const barWidth = chartWidth / labels.length
    labels.forEach((label, i) => {
      const x = padding + i * barWidth + barWidth / 2
      ctx.fillText(label, x, canvas.height - padding + 15)
    })

    // Dibujar etiquetas del eje Y
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"
    for (let i = 0; i <= 5; i++) {
      const value = (maxValue / 5) * i
      const y = canvas.height - padding - (chartHeight / 5) * i
      ctx.fillText(value.toFixed(0), padding - 5, y)

      // Líneas de cuadrícula
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(canvas.width - padding, y)
      ctx.strokeStyle = "#eee"
      ctx.stroke()
    }

    // Color de la marca
    const brandColor = "#d29a43"
    const brandColorAlpha = "rgba(210, 154, 67, 0.7)"

    // Dibujar datos
    if (type === "bar") {
      // Gráfico de barras
      const barPadding = 4
      const actualBarWidth = barWidth - barPadding * 2

      data.forEach((value, i) => {
        const barHeight = (value / maxValue) * chartHeight
        const x = padding + i * barWidth + barPadding
        const y = canvas.height - padding - barHeight

        ctx.fillStyle = brandColorAlpha // Color de la marca con transparencia
        ctx.fillRect(x, y, actualBarWidth, barHeight)

        ctx.strokeStyle = brandColor // Borde con el color de la marca
        ctx.strokeRect(x, y, actualBarWidth, barHeight)
      })
    } else if (type === "line") {
      // Gráfico de líneas
      ctx.beginPath()
      data.forEach((value, i) => {
        const x = padding + i * barWidth + barWidth / 2
        const y = canvas.height - padding - (value / maxValue) * chartHeight

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.strokeStyle = brandColor // Color de la marca
      ctx.lineWidth = 2
      ctx.stroke()

      // Puntos en la línea
      data.forEach((value, i) => {
        const x = padding + i * barWidth + barWidth / 2
        const y = canvas.height - padding - (value / maxValue) * chartHeight

        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fillStyle = "white"
        ctx.fill()
        ctx.strokeStyle = brandColor
        ctx.lineWidth = 2
        ctx.stroke()
      })
    }
  }, [data, labels, type, height])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <canvas ref={canvasRef} height={height} width={500} style={{ width: "100%", height: `${height}px` }} />
      </CardContent>
    </Card>
  )
}

export function BarChart(props: Omit<SimpleChartProps, "type">) {
  return <SimpleChart {...props} type="bar" />
}

export function LineChart(props: Omit<SimpleChartProps, "type">) {
  return <SimpleChart {...props} type="line" />
}

// Añadir el componente PieChart al final del archivo
export function PieChart({ title, data, labels, height = 300, className }: Omit<SimpleChartProps, "type">) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Configuración básica
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 40

    // Calcular el total para los porcentajes
    const total = data.reduce((sum, value) => sum + value, 0)

    // Colores para las secciones del pie
    const colors = [
      "#d29a43", // Color principal de la marca
      "#e0b46a", // Versión más clara
      "#b37e2e", // Versión más oscura
      "#f0d9a8", // Muy claro
      "#8c6218", // Muy oscuro
    ]

    // Dibujar el pie
    let startAngle = 0
    data.forEach((value, i) => {
      const sliceAngle = (value / total) * 2 * Math.PI

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
      ctx.closePath()

      ctx.fillStyle = colors[i % colors.length]
      ctx.fill()

      // Borde
      ctx.strokeStyle = "white"
      ctx.lineWidth = 2
      ctx.stroke()

      // Calcular posición para la etiqueta
      const midAngle = startAngle + sliceAngle / 2
      const labelRadius = radius * 0.7
      const labelX = centerX + labelRadius * Math.cos(midAngle)
      const labelY = centerY + labelRadius * Math.sin(midAngle)

      // Dibujar etiqueta
      ctx.fillStyle = "white"
      ctx.font = "bold 12px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      // Calcular porcentaje
      const percentage = Math.round((value / total) * 100)
      ctx.fillText(`${percentage}%`, labelX, labelY)

      startAngle += sliceAngle
    })

    // Dibujar leyenda
    const legendY = canvas.height - 20
    const itemWidth = canvas.width / labels.length

    labels.forEach((label, i) => {
      const legendX = (i + 0.5) * itemWidth

      // Cuadrado de color
      ctx.fillStyle = colors[i % colors.length]
      ctx.fillRect(legendX - 40, legendY, 10, 10)

      // Texto
      ctx.fillStyle = "#666"
      ctx.font = "10px Arial"
      ctx.textAlign = "left"
      ctx.fillText(label, legendX - 25, legendY + 5)
    })
  }, [data, labels, height])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <canvas ref={canvasRef} height={height} width={500} style={{ width: "100%", height: `${height}px` }} />
      </CardContent>
    </Card>
  )
}
