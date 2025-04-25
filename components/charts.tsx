"use client"

import { useTheme } from "next-themes"

export function LineChart() {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const textColor = isDark ? "#ffffff" : "#000000"
  const gridColor = isDark ? "#333333" : "#e5e5e5"
  const lineColor = "#d29a43"

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg width="100%" height="100%" viewBox="0 0 800 400">
        <rect width="800" height="400" fill="none" />

        {/* Eje X */}
        <line x1="50" y1="350" x2="750" y2="350" stroke={gridColor} strokeWidth="1" />

        {/* Eje Y */}
        <line x1="50" y1="50" x2="50" y2="350" stroke={gridColor} strokeWidth="1" />

        {/* Líneas de cuadrícula horizontales */}
        <line x1="50" y1="50" x2="750" y2="50" stroke={gridColor} strokeWidth="0.5" strokeDasharray="5,5" />
        <line x1="50" y1="125" x2="750" y2="125" stroke={gridColor} strokeWidth="0.5" strokeDasharray="5,5" />
        <line x1="50" y1="200" x2="750" y2="200" stroke={gridColor} strokeWidth="0.5" strokeDasharray="5,5" />
        <line x1="50" y1="275" x2="750" y2="275" stroke={gridColor} strokeWidth="0.5" strokeDasharray="5,5" />

        {/* Etiquetas del eje X */}
        <text x="100" y="370" fill={textColor} fontSize="12" textAnchor="middle">
          Día 1
        </text>
        <text x="200" y="370" fill={textColor} fontSize="12" textAnchor="middle">
          Día 6
        </text>
        <text x="300" y="370" fill={textColor} fontSize="12" textAnchor="middle">
          Día 11
        </text>
        <text x="400" y="370" fill={textColor} fontSize="12" textAnchor="middle">
          Día 16
        </text>
        <text x="500" y="370" fill={textColor} fontSize="12" textAnchor="middle">
          Día 21
        </text>
        <text x="600" y="370" fill={textColor} fontSize="12" textAnchor="middle">
          Día 26
        </text>
        <text x="700" y="370" fill={textColor} fontSize="12" textAnchor="middle">
          Día 30
        </text>

        {/* Etiquetas del eje Y */}
        <text x="40" y="350" fill={textColor} fontSize="12" textAnchor="end">
          0€
        </text>
        <text x="40" y="275" fill={textColor} fontSize="12" textAnchor="end">
          500€
        </text>
        <text x="40" y="200" fill={textColor} fontSize="12" textAnchor="end">
          1000€
        </text>
        <text x="40" y="125" fill={textColor} fontSize="12" textAnchor="end">
          1500€
        </text>
        <text x="40" y="50" fill={textColor} fontSize="12" textAnchor="end">
          2000€
        </text>

        {/* Mensaje de datos no disponibles */}
        <text x="400" y="200" fill={textColor} fontSize="14" textAnchor="middle">
          Los datos de ventas estarán disponibles próximamente
        </text>
      </svg>
    </div>
  )
}

export function BarChart() {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const textColor = isDark ? "#ffffff" : "#000000"
  const gridColor = isDark ? "#333333" : "#e5e5e5"

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg width="100%" height="100%" viewBox="0 0 800 400">
        <rect width="800" height="400" fill="none" />

        {/* Eje X */}
        <line x1="50" y1="350" x2="750" y2="350" stroke={gridColor} strokeWidth="1" />

        {/* Eje Y */}
        <line x1="50" y1="50" x2="50" y2="350" stroke={gridColor} strokeWidth="1" />

        {/* Líneas de cuadrícula horizontales */}
        <line x1="50" y1="50" x2="750" y2="50" stroke={gridColor} strokeWidth="0.5" strokeDasharray="5,5" />
        <line x1="50" y1="125" x2="750" y2="125" stroke={gridColor} strokeWidth="0.5" strokeDasharray="5,5" />
        <line x1="50" y1="200" x2="750" y2="200" stroke={gridColor} strokeWidth="0.5" strokeDasharray="5,5" />
        <line x1="50" y1="275" x2="750" y2="275" stroke={gridColor} strokeWidth="0.5" strokeDasharray="5,5" />

        {/* Etiquetas del eje X */}
        <text x="125" y="370" fill={textColor} fontSize="12" textAnchor="middle">
          Tablas
        </text>
        <text x="250" y="370" fill={textColor} fontSize="12" textAnchor="middle">
          Ruedas
        </text>
        <text x="375" y="370" fill={textColor} fontSize="12" textAnchor="middle">
          Ejes
        </text>
        <text x="500" y="370" fill={textColor} fontSize="12" textAnchor="middle">
          Ropa
        </text>
        <text x="625" y="370" fill={textColor} fontSize="12" textAnchor="middle">
          Accesorios
        </text>

        {/* Etiquetas del eje Y */}
        <text x="40" y="350" fill={textColor} fontSize="12" textAnchor="end">
          0€
        </text>
        <text x="40" y="275" fill={textColor} fontSize="12" textAnchor="end">
          1000€
        </text>
        <text x="40" y="200" fill={textColor} fontSize="12" textAnchor="end">
          2000€
        </text>
        <text x="40" y="125" fill={textColor} fontSize="12" textAnchor="end">
          3000€
        </text>
        <text x="40" y="50" fill={textColor} fontSize="12" textAnchor="end">
          4000€
        </text>

        {/* Mensaje de datos no disponibles */}
        <text x="400" y="200" fill={textColor} fontSize="14" textAnchor="middle">
          Los datos por categoría estarán disponibles próximamente
        </text>
      </svg>
    </div>
  )
}

export function PieChart() {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const textColor = isDark ? "#ffffff" : "#000000"

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg width="100%" height="100%" viewBox="0 0 400 400">
        <text x="200" y="200" fill={textColor} fontSize="14" textAnchor="middle">
          Los datos de tráfico estarán disponibles próximamente
        </text>
      </svg>
    </div>
  )
}
