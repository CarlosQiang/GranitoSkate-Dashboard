"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Line, Bar, Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js"

// Registrar los componentes de ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

interface ChartProps {
  data: any[]
  categories?: string[]
  colors?: string[]
  height?: number
  showLegend?: boolean
  showXAxis?: boolean
  showYAxis?: boolean
  showGridLines?: boolean
  yAxisWidth?: number
  valueFormatter?: (value: number) => string
  showLabel?: boolean
}

export function LineChart({
  data,
  categories = [],
  colors = ["#2563eb", "#10b981", "#f59e0b", "#ef4444"],
  height = 300,
  showLegend = true,
  showXAxis = true,
  showYAxis = true,
  showGridLines = true,
  yAxisWidth = 40,
  valueFormatter = (value: number) => value.toString(),
}: ChartProps) {
  const { theme } = useTheme()
  const [chartData, setChartData] = useState<any>(null)
  const [chartOptions, setChartOptions] = useState<ChartOptions<"line">>({})

  useEffect(() => {
    const isDark = theme === "dark"
    const textColor = isDark ? "#e5e7eb" : "#374151"
    const gridColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"

    setChartData({
      labels: categories,
      datasets: data.map((dataset, index) => ({
        label: dataset.name,
        data: dataset.data.map((item: any) => item.y),
        borderColor: colors[index % colors.length],
        backgroundColor: `${colors[index % colors.length]}33`,
        tension: 0.3,
        fill: false,
        pointRadius: 3,
        pointHoverRadius: 5,
      })),
    })

    setChartOptions({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: showLegend,
          position: "top" as const,
          labels: {
            color: textColor,
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || ""
              return `${label}: ${valueFormatter(context.parsed.y)}`
            },
          },
        },
      },
      scales: {
        x: {
          display: showXAxis,
          grid: {
            display: showGridLines,
            color: gridColor,
          },
          ticks: {
            color: textColor,
          },
        },
        y: {
          display: showYAxis,
          grid: {
            display: showGridLines,
            color: gridColor,
          },
          ticks: {
            color: textColor,
            callback: (value) => valueFormatter(value as number),
          },
        },
      },
    })
  }, [data, categories, colors, theme, showLegend, showXAxis, showYAxis, showGridLines, valueFormatter])

  if (!chartData) {
    return (
      <div style={{ height }} className="flex items-center justify-center">
        Cargando gráfico...
      </div>
    )
  }

  return <Line data={chartData} options={chartOptions} height={height} />
}

export function BarChart({
  data,
  categories = [],
  colors = ["#2563eb", "#10b981", "#f59e0b", "#ef4444"],
  height = 300,
  showLegend = true,
  showXAxis = true,
  showYAxis = true,
  showGridLines = true,
  yAxisWidth = 40,
  valueFormatter = (value: number) => value.toString(),
}: ChartProps) {
  const { theme } = useTheme()
  const [chartData, setChartData] = useState<any>(null)
  const [chartOptions, setChartOptions] = useState<ChartOptions<"bar">>({})

  useEffect(() => {
    const isDark = theme === "dark"
    const textColor = isDark ? "#e5e7eb" : "#374151"
    const gridColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"

    setChartData({
      labels: categories,
      datasets: data.map((dataset, index) => ({
        label: dataset.name,
        data: dataset.data.map((item: any) => item.y),
        backgroundColor: colors[index % colors.length],
        borderColor: `${colors[index % colors.length]}`,
        borderWidth: 1,
      })),
    })

    setChartOptions({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: showLegend,
          position: "top" as const,
          labels: {
            color: textColor,
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || ""
              return `${label}: ${valueFormatter(context.parsed.y)}`
            },
          },
        },
      },
      scales: {
        x: {
          display: showXAxis,
          grid: {
            display: showGridLines,
            color: gridColor,
          },
          ticks: {
            color: textColor,
          },
        },
        y: {
          display: showYAxis,
          grid: {
            display: showGridLines,
            color: gridColor,
          },
          ticks: {
            color: textColor,
            callback: (value) => valueFormatter(value as number),
          },
        },
      },
    })
  }, [data, categories, colors, theme, showLegend, showXAxis, showYAxis, showGridLines, valueFormatter])

  if (!chartData) {
    return (
      <div style={{ height }} className="flex items-center justify-center">
        Cargando gráfico...
      </div>
    )
  }

  return <Bar data={chartData} options={chartOptions} height={height} />
}

export function PieChart({
  data,
  colors = ["#2563eb", "#10b981", "#f59e0b", "#ef4444"],
  height = 300,
  showLegend = true,
  valueFormatter = (value: number) => value.toString(),
  showLabel = false,
}: ChartProps) {
  const { theme } = useTheme()
  const [chartData, setChartData] = useState<any>(null)
  const [chartOptions, setChartOptions] = useState<ChartOptions<"pie">>({})

  useEffect(() => {
    const isDark = theme === "dark"
    const textColor = isDark ? "#e5e7eb" : "#374151"

    setChartData({
      labels: data.map((item) => item.name),
      datasets: [
        {
          data: data.map((item) => item.value),
          backgroundColor: colors.slice(0, data.length),
          borderColor: isDark ? "rgba(0, 0, 0, 0.1)" : "white",
          borderWidth: 2,
        },
      ],
    })

    setChartOptions({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: showLegend,
          position: "right" as const,
          labels: {
            color: textColor,
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || ""
              const value = context.raw as number
              return `${label}: ${valueFormatter(value)}`
            },
          },
        },
      },
    })
  }, [data, colors, theme, showLegend, valueFormatter])

  if (!chartData) {
    return (
      <div style={{ height }} className="flex items-center justify-center">
        Cargando gráfico...
      </div>
    )
  }

  return <Pie data={chartData} options={chartOptions} height={height} />
}

// Añadir SimpleChart para compatibilidad
export function SimpleChart({
  data,
  title,
  type = "line",
}: { data: any; title: string; type?: "line" | "bar" | "pie" }) {
  const chartData = {
    labels: data?.labels || ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul"],
    datasets: data?.datasets || [
      {
        label: "Datos",
        data: [65, 59, 80, 81, 56, 55, 40],
        backgroundColor: "#d29a43",
        borderColor: "#d29a43",
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
  }

  if (type === "line") return <Line data={chartData} options={options} />
  if (type === "bar") return <Bar data={chartData} options={options} />
  if (type === "pie") return <Pie data={chartData} options={options} />

  return <Line data={chartData} options={options} />
}
