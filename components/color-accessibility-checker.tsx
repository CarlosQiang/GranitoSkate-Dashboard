"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, XCircle, Eye } from "lucide-react"

interface AccessibilityResult {
  ratio: number
  level: "AAA" | "AA" | "A" | "FAIL"
  score: number
}

interface ColorAccessibilityCheckerProps {
  primaryColor: string
  secondaryColor: string
  accentColor: string
}

export function ColorAccessibilityChecker({
  primaryColor,
  secondaryColor,
  accentColor,
}: ColorAccessibilityCheckerProps) {
  const [results, setResults] = useState<{
    primaryOnWhite: AccessibilityResult
    secondaryOnWhite: AccessibilityResult
    accentOnWhite: AccessibilityResult
    primaryOnSecondary: AccessibilityResult
  } | null>(null)

  // Función para convertir hex a RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : null
  }

  // Función para calcular la luminancia relativa
  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  // Función para calcular el ratio de contraste
  const getContrastRatio = (color1: string, color2: string) => {
    const rgb1 = hexToRgb(color1)
    const rgb2 = hexToRgb(color2)

    if (!rgb1 || !rgb2) return 1

    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)

    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)

    return (brightest + 0.05) / (darkest + 0.05)
  }

  // Función para evaluar el nivel de accesibilidad
  const getAccessibilityLevel = (ratio: number): AccessibilityResult => {
    if (ratio >= 7) {
      return { ratio, level: "AAA", score: 100 }
    } else if (ratio >= 4.5) {
      return { ratio, level: "AA", score: 85 }
    } else if (ratio >= 3) {
      return { ratio, level: "A", score: 60 }
    } else {
      return { ratio, level: "FAIL", score: 30 }
    }
  }

  useEffect(() => {
    const primaryOnWhite = getAccessibilityLevel(getContrastRatio(primaryColor, "#ffffff"))
    const secondaryOnWhite = getAccessibilityLevel(getContrastRatio(secondaryColor, "#ffffff"))
    const accentOnWhite = getAccessibilityLevel(getContrastRatio(accentColor, "#ffffff"))
    const primaryOnSecondary = getAccessibilityLevel(getContrastRatio(primaryColor, secondaryColor))

    setResults({
      primaryOnWhite,
      secondaryOnWhite,
      accentOnWhite,
      primaryOnSecondary,
    })
  }, [primaryColor, secondaryColor, accentColor])

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "AAA":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "AA":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "A":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "AAA":
        return "bg-green-100 text-green-800 border-green-200"
      case "AA":
        return "bg-green-50 text-green-700 border-green-200"
      case "A":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      default:
        return "bg-red-50 text-red-700 border-red-200"
    }
  }

  if (!results) return null

  const overallScore = Math.round(
    (results.primaryOnWhite.score +
      results.secondaryOnWhite.score +
      results.accentOnWhite.score +
      results.primaryOnSecondary.score) /
      4,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Verificador de Accesibilidad
        </CardTitle>
        <CardDescription>Verifica que tus colores cumplan con las pautas de accesibilidad WCAG</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Puntuación General</span>
          <Badge
            variant="outline"
            className={`${
              overallScore >= 85
                ? "bg-green-50 text-green-700 border-green-200"
                : overallScore >= 60
                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                  : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {overallScore}/100
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: primaryColor }} />
              <span className="text-sm">Principal sobre blanco</span>
            </div>
            <div className="flex items-center gap-2">
              {getLevelIcon(results.primaryOnWhite.level)}
              <Badge className={getLevelColor(results.primaryOnWhite.level)}>{results.primaryOnWhite.level}</Badge>
              <span className="text-xs text-muted-foreground">{results.primaryOnWhite.ratio.toFixed(1)}:1</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: secondaryColor }} />
              <span className="text-sm">Secundario sobre blanco</span>
            </div>
            <div className="flex items-center gap-2">
              {getLevelIcon(results.secondaryOnWhite.level)}
              <Badge className={getLevelColor(results.secondaryOnWhite.level)}>{results.secondaryOnWhite.level}</Badge>
              <span className="text-xs text-muted-foreground">{results.secondaryOnWhite.ratio.toFixed(1)}:1</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: accentColor }} />
              <span className="text-sm">Acento sobre blanco</span>
            </div>
            <div className="flex items-center gap-2">
              {getLevelIcon(results.accentOnWhite.level)}
              <Badge className={getLevelColor(results.accentOnWhite.level)}>{results.accentOnWhite.level}</Badge>
              <span className="text-xs text-muted-foreground">{results.accentOnWhite.ratio.toFixed(1)}:1</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex">
                <div className="w-2 h-4 rounded-l" style={{ backgroundColor: primaryColor }} />
                <div className="w-2 h-4 rounded-r" style={{ backgroundColor: secondaryColor }} />
              </div>
              <span className="text-sm">Principal sobre secundario</span>
            </div>
            <div className="flex items-center gap-2">
              {getLevelIcon(results.primaryOnSecondary.level)}
              <Badge className={getLevelColor(results.primaryOnSecondary.level)}>
                {results.primaryOnSecondary.level}
              </Badge>
              <span className="text-xs text-muted-foreground">{results.primaryOnSecondary.ratio.toFixed(1)}:1</span>
            </div>
          </div>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Niveles WCAG:</strong> AAA (excelente, 7:1+), AA (bueno, 4.5:1+), A (aceptable, 3:1+), FAIL
            (insuficiente, &lt;3:1)
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
