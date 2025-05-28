"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Palette, Shuffle, Download, Eye, EyeOff } from "lucide-react"

interface ColorPalette {
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    success: string
    warning: string
    error: string
  }
  description: string
}

const predefinedPalettes: ColorPalette[] = [
  {
    name: "Granito Clásico",
    colors: {
      primary: "#c7a04a",
      secondary: "#4a5568",
      accent: "#3182ce",
      success: "#38a169",
      warning: "#d69e2e",
      error: "#e53e3e",
    },
    description: "Paleta original de GranitoSkate con tonos dorados y elegantes",
  },
  {
    name: "Océano Profundo",
    colors: {
      primary: "#2b6cb0",
      secondary: "#4299e1",
      accent: "#0bc5ea",
      success: "#38b2ac",
      warning: "#ed8936",
      error: "#f56565",
    },
    description: "Inspirada en los tonos del océano, perfecta para un look moderno",
  },
  {
    name: "Bosque Urbano",
    colors: {
      primary: "#38a169",
      secondary: "#68d391",
      accent: "#9ae6b4",
      success: "#48bb78",
      warning: "#ed8936",
      error: "#f56565",
    },
    description: "Tonos verdes naturales que transmiten frescura y sostenibilidad",
  },
  {
    name: "Atardecer Vibrante",
    colors: {
      primary: "#e53e3e",
      secondary: "#fc8181",
      accent: "#feb2b2",
      success: "#38a169",
      warning: "#d69e2e",
      error: "#c53030",
    },
    description: "Colores cálidos y energéticos inspirados en un atardecer",
  },
  {
    name: "Minimalista",
    colors: {
      primary: "#2d3748",
      secondary: "#4a5568",
      accent: "#718096",
      success: "#38a169",
      warning: "#d69e2e",
      error: "#e53e3e",
    },
    description: "Paleta neutra y elegante para un diseño minimalista",
  },
  {
    name: "Neón Cyber",
    colors: {
      primary: "#805ad5",
      secondary: "#9f7aea",
      accent: "#b794f6",
      success: "#38b2ac",
      warning: "#ed8936",
      error: "#f56565",
    },
    description: "Colores vibrantes inspirados en la estética cyberpunk",
  },
]

interface ColorPaletteGeneratorProps {
  onPaletteSelect: (palette: ColorPalette) => void
  currentColors: {
    primary: string
    secondary: string
    accent: string
  }
}

export function ColorPaletteGenerator({ onPaletteSelect, currentColors }: ColorPaletteGeneratorProps) {
  const [selectedPalette, setSelectedPalette] = useState<ColorPalette | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const generateRandomPalette = () => {
    const hue = Math.floor(Math.random() * 360)
    const palette: ColorPalette = {
      name: "Paleta Generada",
      colors: {
        primary: `hsl(${hue}, 65%, 50%)`,
        secondary: `hsl(${(hue + 30) % 360}, 55%, 60%)`,
        accent: `hsl(${(hue + 60) % 360}, 70%, 55%)`,
        success: `hsl(120, 65%, 50%)`,
        warning: `hsl(45, 75%, 55%)`,
        error: `hsl(0, 70%, 55%)`,
      },
      description: "Paleta generada automáticamente",
    }
    setSelectedPalette(palette)
  }

  const exportPalette = () => {
    if (!selectedPalette) return

    const dataStr = JSON.stringify(selectedPalette, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${selectedPalette.name.toLowerCase().replace(/\s+/g, "-")}-palette.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const ColorSwatch = ({ color, label }: { color: string; label: string }) => (
    <div className="flex flex-col items-center gap-1">
      <div className="w-8 h-8 rounded-md border shadow-sm" style={{ backgroundColor: color }} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Generador de Paletas
        </CardTitle>
        <CardDescription>Explora paletas predefinidas o genera nuevas combinaciones de colores</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="predefined" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="predefined">Paletas Predefinidas</TabsTrigger>
            <TabsTrigger value="generator">Generador</TabsTrigger>
          </TabsList>

          <TabsContent value="predefined" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {predefinedPalettes.map((palette, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedPalette?.name === palette.name ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedPalette(palette)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{palette.name}</CardTitle>
                    <CardDescription className="text-xs">{palette.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-1">
                        <ColorSwatch color={palette.colors.primary} label="P" />
                        <ColorSwatch color={palette.colors.secondary} label="S" />
                        <ColorSwatch color={palette.colors.accent} label="A" />
                      </div>
                      <div className="flex gap-1">
                        <ColorSwatch color={palette.colors.success} label="✓" />
                        <ColorSwatch color={palette.colors.warning} label="⚠" />
                        <ColorSwatch color={palette.colors.error} label="✗" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="generator" className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <Button onClick={generateRandomPalette} className="flex items-center gap-2">
                <Shuffle className="h-4 w-4" />
                Generar Paleta Aleatoria
              </Button>

              {selectedPalette && (
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle className="text-sm">{selectedPalette.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between">
                      <ColorSwatch color={selectedPalette.colors.primary} label="Principal" />
                      <ColorSwatch color={selectedPalette.colors.secondary} label="Secundario" />
                      <ColorSwatch color={selectedPalette.colors.accent} label="Acento" />
                      <ColorSwatch color={selectedPalette.colors.success} label="Éxito" />
                      <ColorSwatch color={selectedPalette.colors.warning} label="Advertencia" />
                      <ColorSwatch color={selectedPalette.colors.error} label="Error" />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {selectedPalette && (
          <div className="flex flex-col gap-3 mt-6 pt-4 border-t">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="flex items-center gap-1">
                <Palette className="h-3 w-3" />
                {selectedPalette.name}
              </Badge>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-1"
                >
                  {showPreview ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {showPreview ? "Ocultar" : "Vista previa"}
                </Button>
                <Button variant="outline" size="sm" onClick={exportPalette} className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  Exportar
                </Button>
                <Button size="sm" onClick={() => onPaletteSelect(selectedPalette)}>
                  Aplicar Paleta
                </Button>
              </div>
            </div>

            {showPreview && (
              <div className="p-4 border rounded-lg bg-muted/20">
                <h4 className="text-sm font-medium mb-2">Vista previa de la interfaz</h4>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 rounded text-white text-xs"
                      style={{ backgroundColor: selectedPalette.colors.primary }}
                    >
                      Botón Principal
                    </button>
                    <button
                      className="px-3 py-1 rounded text-white text-xs"
                      style={{ backgroundColor: selectedPalette.colors.secondary }}
                    >
                      Botón Secundario
                    </button>
                    <button
                      className="px-3 py-1 rounded text-white text-xs"
                      style={{ backgroundColor: selectedPalette.colors.accent }}
                    >
                      Acento
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className="px-2 py-1 rounded text-white text-xs"
                      style={{ backgroundColor: selectedPalette.colors.success }}
                    >
                      Éxito
                    </span>
                    <span
                      className="px-2 py-1 rounded text-white text-xs"
                      style={{ backgroundColor: selectedPalette.colors.warning }}
                    >
                      Advertencia
                    </span>
                    <span
                      className="px-2 py-1 rounded text-white text-xs"
                      style={{ backgroundColor: selectedPalette.colors.error }}
                    >
                      Error
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
