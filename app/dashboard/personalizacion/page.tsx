"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "@/contexts/theme-context"
import { ColorPicker } from "@/components/color-picker"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PersonalizacionPage() {
  const { theme, updateTheme } = useTheme()
  const [isSaving, setIsSaving] = useState(false)
  const [localTheme, setLocalTheme] = useState(theme)

  // Actualizar el tema local cuando cambia el tema global
  useEffect(() => {
    setLocalTheme(theme)
  }, [theme])

  // Manejar cambios en los campos del tema
  const handleChange = (field: string, value: string | number) => {
    setLocalTheme((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Guardar cambios
  const saveChanges = async () => {
    setIsSaving(true)
    try {
      await updateTheme(localTheme)
      alert("Tema actualizado correctamente")
    } catch (error) {
      console.error("Error al guardar el tema:", error)
      alert("Error al guardar el tema")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Personalización</h1>

      <Tabs defaultValue="colors">
        <TabsList className="mb-4">
          <TabsTrigger value="colors">Colores</TabsTrigger>
          <TabsTrigger value="typography">Tipografía</TabsTrigger>
          <TabsTrigger value="branding">Marca</TabsTrigger>
          <TabsTrigger value="preview">Vista Previa</TabsTrigger>
        </TabsList>

        <TabsContent value="colors">
          <Card>
            <CardHeader>
              <CardTitle>Colores del Tema</CardTitle>
              <CardDescription>Personaliza los colores principales de la aplicación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <Label>Color Primario</Label>
                <ColorPicker
                  color={localTheme.primaryColor}
                  onChange={(color) => handleChange("primaryColor", color)}
                />
                <p className="text-sm text-gray-500">Este color se usa para botones, enlaces y elementos destacados</p>
              </div>

              <div className="grid gap-4">
                <Label>Color Secundario</Label>
                <ColorPicker
                  color={localTheme.secondaryColor}
                  onChange={(color) => handleChange("secondaryColor", color)}
                />
                <p className="text-sm text-gray-500">Este color se usa para acentos y elementos secundarios</p>
              </div>

              <div className="grid gap-4">
                <Label>Color de Fondo</Label>
                <ColorPicker
                  color={localTheme.backgroundColor}
                  onChange={(color) => handleChange("backgroundColor", color)}
                />
                <p className="text-sm text-gray-500">Color de fondo principal de la aplicación</p>
              </div>

              <div className="grid gap-4">
                <Label>Color de Texto Principal</Label>
                <ColorPicker
                  color={localTheme.textColor || "#000000"}
                  onChange={(color) => handleChange("textColor", color)}
                />
                <p className="text-sm text-gray-500">Color para el texto principal de la aplicación</p>
              </div>

              <div className="grid gap-4">
                <Label>Color de Texto Secundario</Label>
                <ColorPicker
                  color={localTheme.textSecondaryColor || "#666666"}
                  onChange={(color) => handleChange("textSecondaryColor", color)}
                />
                <p className="text-sm text-gray-500">Color para textos secundarios y descripciones</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography">
          <Card>
            <CardHeader>
              <CardTitle>Tipografía</CardTitle>
              <CardDescription>Personaliza las fuentes y estilos de texto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <Label>Fuente Principal</Label>
                <Select
                  value={localTheme.fontFamily || "Inter"}
                  onValueChange={(value) => handleChange("fontFamily", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una fuente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Poppins">Poppins</SelectItem>
                    <SelectItem value="Montserrat">Montserrat</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4">
                <Label>Tamaño de Fuente Base ({localTheme.baseFontSize || 16}px)</Label>
                <Slider
                  value={[Number(localTheme.baseFontSize || 16)]}
                  min={12}
                  max={20}
                  step={1}
                  onValueChange={(value) => handleChange("baseFontSize", value[0])}
                />
              </div>

              <div className="grid gap-4">
                <Label>Altura de Línea ({localTheme.lineHeight || 1.5})</Label>
                <Slider
                  value={[Number(localTheme.lineHeight || 1.5) * 10]}
                  min={10}
                  max={20}
                  step={1}
                  onValueChange={(value) => handleChange("lineHeight", value[0] / 10)}
                />
              </div>

              <div className="grid gap-4">
                <Label>Peso de Fuente para Títulos</Label>
                <Select
                  value={localTheme.headingFontWeight || "600"}
                  onValueChange={(value) => handleChange("headingFontWeight", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un peso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="400">Regular (400)</SelectItem>
                    <SelectItem value="500">Medium (500)</SelectItem>
                    <SelectItem value="600">Semibold (600)</SelectItem>
                    <SelectItem value="700">Bold (700)</SelectItem>
                    <SelectItem value="800">Extrabold (800)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Marca</CardTitle>
              <CardDescription>Personaliza los elementos de marca de tu tienda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <Label htmlFor="shopName">Nombre de la Tienda</Label>
                <Input
                  id="shopName"
                  value={localTheme.shopName || ""}
                  onChange={(e) => handleChange("shopName", e.target.value)}
                  placeholder="Nombre de tu tienda"
                />
              </div>

              <div className="grid gap-4">
                <Label htmlFor="logoUrl">URL del Logo</Label>
                <Input
                  id="logoUrl"
                  value={localTheme.logoUrl || ""}
                  onChange={(e) => handleChange("logoUrl", e.target.value)}
                  placeholder="https://ejemplo.com/logo.png"
                />
                <p className="text-sm text-gray-500">URL de la imagen de tu logo. Recomendado: 200x50px</p>
              </div>

              <div className="grid gap-4">
                <Label htmlFor="faviconUrl">URL del Favicon</Label>
                <Input
                  id="faviconUrl"
                  value={localTheme.faviconUrl || ""}
                  onChange={(e) => handleChange("faviconUrl", e.target.value)}
                  placeholder="https://ejemplo.com/favicon.ico"
                />
                <p className="text-sm text-gray-500">URL del favicon de tu sitio. Recomendado: 32x32px</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Vista Previa</CardTitle>
              <CardDescription>Así se verá tu aplicación con los cambios aplicados</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="p-6 rounded-md border"
                style={{
                  backgroundColor: localTheme.backgroundColor,
                  color: localTheme.textColor,
                  fontFamily: localTheme.fontFamily,
                  fontSize: `${localTheme.baseFontSize || 16}px`,
                  lineHeight: localTheme.lineHeight || 1.5,
                }}
              >
                <h1
                  className="text-2xl mb-4"
                  style={{
                    color: localTheme.textColor,
                    fontWeight: localTheme.headingFontWeight || 600,
                  }}
                >
                  {localTheme.shopName || "Nombre de la Tienda"}
                </h1>

                <p className="mb-4" style={{ color: localTheme.textSecondaryColor }}>
                  Este es un ejemplo de texto secundario con el estilo personalizado.
                </p>

                <div className="flex gap-4 mb-6">
                  <button
                    className="px-4 py-2 rounded-md"
                    style={{
                      backgroundColor: localTheme.primaryColor,
                      color: "#ffffff",
                    }}
                  >
                    Botón Primario
                  </button>

                  <button
                    className="px-4 py-2 rounded-md"
                    style={{
                      backgroundColor: localTheme.secondaryColor,
                      color: "#ffffff",
                    }}
                  >
                    Botón Secundario
                  </button>
                </div>

                <div
                  className="p-4 rounded-md"
                  style={{
                    backgroundColor: "#ffffff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <h2
                    className="text-xl mb-2"
                    style={{
                      color: localTheme.textColor,
                      fontWeight: localTheme.headingFontWeight || 600,
                    }}
                  >
                    Tarjeta de Ejemplo
                  </h2>

                  <p style={{ color: localTheme.textColor }}>Este es un ejemplo de contenido dentro de una tarjeta.</p>

                  <a href="#" className="mt-2 inline-block" style={{ color: localTheme.primaryColor }}>
                    Enlace de ejemplo
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button onClick={saveChanges} disabled={isSaving}>
          {isSaving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </div>
  )
}
