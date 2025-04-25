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
          1 May
        </text>
        <text x="200" y="370" fill={textColor} fontSize="12" textAnchor="middle">
          6 May
        </text>
        <text x="300" y="370" fill={textColor} fontSize="12" textAnchor="middle">
          11 May
        </text>
        <text x="400" y="370" fill={textColor} fontSize="12" textAnchor="middle">
          16 May
        </text>
        <text x="500" y="370" fill={textColor} fontSize="12" textAnchor="middle">
          21 May
        </text>
        <text x="600" y="370" fill={textColor} fontSize="12" textAnchor="middle">
          26 May
        </text>
        <text x="700" y="370" fill={textColor} fontSize="12" textAnchor="middle">
          31 May
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

        {/* Línea de datos */}
        <path
          d="M100,320 L150,300 L200,280 L250,310 L300,260 L350,240 L400,200 L450,180 L500,150 L550,170 L600,130 L650,100 L700,120"
          fill="none"
          stroke={lineColor}
          strokeWidth="3"
        />

        {/* Puntos de datos */}
        <circle cx="100" cy="320" r="4" fill={lineColor} />
        <circle cx="150" cy="300" r="4" fill={lineColor} />
        <circle cx="200" cy="280" r="4" fill={lineColor} />
        <circle cx="250" cy="310" r="4" fill={lineColor} />
        <circle cx="300" cy="260" r="4" fill={lineColor} />
        <circle cx="350" cy="240" r="4" fill={lineColor} />
        <circle cx="400" cy="200" r="4" fill={lineColor} />
        <circle cx="450" cy="180" r="4" fill={lineColor} />
        <circle cx="500" cy="150" r="4" fill={lineColor} />
        <circle cx="550" cy="170" r="4" fill={lineColor} />
        <circle cx="600" cy="130" r="4" fill={lineColor} />
        <circle cx="650" cy="100" r="4" fill={lineColor} />
        <circle cx="700" cy="120" r="4" fill={lineColor} />
      </svg>
    </div>
  )
}

export function BarChart() {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const textColor = isDark ? "#ffffff" : "#000000"
  const gridColor = isDark ? "#333333" : "#e5e5e5"
  const barColor = "#d29a43"
  const barHoverColor = "#e6b76a"

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

        {/* Barras */}
        <rect x="90" y="100" width="70" height="250" fill={barColor} />
        <rect x="215" y="180" width="70" height="170" fill={barColor} />
        <rect x="340" y="150" width="70" height="200" fill={barColor} />
        <rect x="465" y="220" width="70" height="130" fill={barColor} />
        <rect x="590" y="250" width="70" height="100" fill={barColor} />
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
        <g transform="translate(200, 200)">
          {/* Segmentos del gráfico */}
          <path d="M0,0 L180,0 A180,180 0 0,1 90,155.9 z" fill="#d29a43" />
          <path d="M0,0 L90,155.9 A180,180 0 0,1 -90,155.9 z" fill="#e6b76a" />
          <path d="M0,0 L-90,155.9 A180,180 0 0,1 -180,0 z" fill="#b07e2c" />
          <path d="M0,0 L-180,0 A180,180 0 0,1 -90,-155.9 z" fill="#f0d9a8" />
          <path d="M0,0 L-90,-155.9 A180,180 0 0,1 90,-155.9 z" fill="#8c6321" />
          <path d="M0,0 L90,-155.9 A180,180 0 0,1 180,0 z" fill="#d8b77e" />
        </g>

        {/* Leyenda */}
        <g transform="translate(200, 380)">
          <rect x="-180" y="-30" width="12" height="12" fill="#d29a43" />
          <text x="-160" y="-20" fill={textColor} fontSize="12">
            Búsqueda orgánica (40%)
          </text>

          <rect x="-180" y="-10" width="12" height="12" fill="#e6b76a" />
          <text x="-160" y="0" fill={textColor} fontSize="12">
            Redes sociales (20%)
          </text>

          <rect x="20" y="-30" width="12" height="12" fill="#b07e2c" />
          <text x="40" y="-20" fill={textColor} fontSize="12">
            Directo (15%)
          </text>

          <rect x="20" y="-10" width="12" height="12" fill="#f0d9a8" />
          <text x="40" y="0" fill={textColor} fontSize="12">
            Email (10%)
          </text>

          <rect x="20" y="10" width="12" height="12" fill="#8c6321" />
          <text x="40" y="20" fill={textColor} fontSize="12">
            Referral (10%)
          </text>

          <rect x="-180" y="10" width="12" height="12" fill="#d8b77e" />
          <text x="-160" y="20" fill={textColor} fontSize="12">
            Otros (5%)
          </text>
        </g>
      </svg>
    </div>
  )
}
