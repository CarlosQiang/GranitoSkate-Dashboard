"use client"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from "chart.js"
import { Line, Bar } from "react-chartjs-2"

// Registrar los componentes de ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

// Opciones por defecto para los gráficos
const defaultOptions: ChartOptions<"line"> = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Datos",
    },
  },
}

// Datos de ejemplo para los gráficos
const defaultData: ChartData<"line"> = {
  labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio"],
  datasets: [
    {
      label: "Dataset 1",
      data: [65, 59, 80, 81, 56, 55, 40],
      borderColor: "rgb(255, 99, 132)",
      backgroundColor: "rgba(255, 99, 132, 0.5)",
    },
    {
      label: "Dataset 2",
      data: [28, 48, 40, 19, 86, 27, 90],
      borderColor: "rgb(53, 162, 235)",
      backgroundColor: "rgba(53, 162, 235, 0.5)",
    },
  ],
}

interface LineChartProps {
  data?: ChartData<"line">
  options?: ChartOptions<"line">
}

export function LineChart({ data = defaultData, options = defaultOptions }: LineChartProps) {
  return <Line options={options} data={data} />
}

interface BarChartProps {
  data?: ChartData<"bar">
  options?: ChartOptions<"bar">
}

export function BarChart({ data = defaultData, options = defaultOptions }: BarChartProps) {
  return <Bar options={options} data={data} />
}
