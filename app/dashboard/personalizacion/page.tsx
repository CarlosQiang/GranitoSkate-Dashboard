"use client"

import { useState, useEffect } from "react"
import { useTheme } from "@/contexts/theme-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Info, RefreshCw, Save, Undo2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { defaultThemeConfig } from "@/types/theme-config"
import { useToast } from "@/components/ui/use-toast"
import { FileUpload } from "@/components/file-upload"
import { Separator } from "@/components/ui/separator"
import { ColorPicker } from "@/components/color-picker"

export default function PersonalizacionPage() {
  const { theme, updateTheme, resetTheme, isDarkMode, toggleDarkMode, saveTheme, isSaving } = useTheme()
  const [isResetting, setIsResetting] = useState(false)
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile" | "tablet">("desktop")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const { toast } = useToast()

  // Detectar cambios no guardados
  useEffect(() => {
    setHasUnsavedChanges(true)
  }, [theme])

  const handleReset = async () => {
    if (!confirm("¿Estás seguro de que quieres restablecer todos los cambios? Esta acción no se puede deshacer.")) {
      return
    }

    setIsResetting(true)

    // Simular una operación asíncrona
    await new Promise((resolve) => setTimeout(resolve, 1000))

    resetTheme()
    setIsResetting(false)
    setHasUnsavedChanges(false)

    toast({
      title: "Configuración restablecida",
      description: "Se han restaurado los valores predeterminados del tema.",
    })
  }

  const handleSave = async () => {
    const success = await saveTheme()
    setHasUnsavedChanges(false)

    if (success) {
      toast({
        title: "Configuración guardada",
        description: "Los cambios se han guardado correctamente en la base de datos.",
      })
    } else {
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar la configuración en la base de datos.",
        variant: "destructive",
      })
    }
  }

  const handleLogoUpload = (url: string) => {
    updateTheme({ logoUrl: url })
  }

  const handleLogoDelete = () => {
    updateTheme({ logoUrl: null })
  }

  const handleFaviconUpload = (url: string) => {
    updateTheme({ favicon: url })
  }

  const handleFaviconDelete = () => {
    updateTheme({ favicon: null })
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Personalización</h1>
          <p className="text-muted-foreground">Personaliza la apariencia de tu panel de administración</p>
        </div>

        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isResetting || isSaving}
            className="flex items-center gap-2"
          >
            {isResetting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Undo2 className="h-4 w-4" />}
            Restablecer
          </Button>

          <Button onClick={handleSave} disabled={isSaving || !hasUnsavedChanges} className="flex items-center gap-2">
            {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </div>

      {hasUnsavedChanges && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Cambios sin guardar</AlertTitle>
          <AlertDescription>
            Has realizado cambios en la configuración. No olvides guardarlos para que se apliquen permanentemente.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="colores">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="colores">Colores</TabsTrigger>
              <TabsTrigger value="tipografia">Tipografía</TabsTrigger>
              <TabsTrigger value="interfaz">Interfaz</TabsTrigger>
              <TabsTrigger value="branding">Branding</TabsTrigger>
            </TabsList>

            <TabsContent value="colores" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Colores principales</CardTitle>
                  <CardDescription>Personaliza los colores principales de tu panel de administración</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Color principal</Label>
                      <div className="flex items-center gap-2">
                        <ColorPicker
                          color={theme.primaryColor}
                          onChange={(color) => updateTheme({ primaryColor: color })}
                          presets={["#c7a04a", "#3182ce", "#38a169", "#e53e3e", "#805ad5"]}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Este color se usa para botones, enlaces y elementos destacados
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">Color secundario</Label>
                      <div className="flex items-center gap-2">
                        <ColorPicker
                          color={theme.secondaryColor}
                          onChange={(color) => updateTheme({ secondaryColor: color })}
                          presets={["#4a5568", "#2c5282", "#276749", "#9b2c2c", "#553c9a"]}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Este color se usa para elementos secundarios y de apoyo
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="accentColor">Color de acento</Label>
                      <div className="flex items-center gap-2">
                        <ColorPicker
                          color={theme.accentColor}
                          onChange={(color) => updateTheme({ accentColor: color })}
                          presets={["#3182ce", "#c7a04a", "#38a169", "#e53e3e", "#805ad5"]}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Este color se usa para destacar elementos importantes o llamar la atención
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="darkMode">Modo oscuro</Label>
                          <p className="text-xs text-muted-foreground">Habilitar el modo oscuro para tu panel</p>
                        </div>
                        <Switch
                          id="darkMode"
                          checked={theme.enableDarkMode}
                          onCheckedChange={(checked) => updateTheme({ enableDarkMode: checked })}
                        />
                      </div>

                      {theme.enableDarkMode && (
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="preferDarkMode">Preferir modo oscuro</Label>
                            <p className="text-xs text-muted-foreground">Usar modo oscuro por defecto</p>
                          </div>
                          <Switch
                            id="preferDarkMode"
                            checked={theme.preferDarkMode}
                            onCheckedChange={(checked) => updateTheme({ preferDarkMode: checked })}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateTheme({
                        primaryColor: defaultThemeConfig.primaryColor,
                        secondaryColor: defaultThemeConfig.secondaryColor,
                        accentColor: defaultThemeConfig.accentColor,
                      })
                    }
                  >
                    Restaurar colores predeterminados
                  </Button>
                </CardFooter>
              </Card>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Consejo</AlertTitle>
                <AlertDescription>
                  Para una mejor experiencia de usuario, asegúrate de que tus colores tengan suficiente contraste entre
                  sí.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="tipografia" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tipografía</CardTitle>
                  <CardDescription>Personaliza las fuentes utilizadas en tu panel de administración</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fontFamily">Fuente principal</Label>
                      <Select value={theme.fontFamily} onValueChange={(value) => updateTheme({ fontFamily: value })}>
                        <SelectTrigger id="fontFamily">
                          <SelectValue placeholder="Selecciona una fuente" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter, sans-serif">Inter (Predeterminado)</SelectItem>
                          <SelectItem value="'Roboto', sans-serif">Roboto</SelectItem>
                          <SelectItem value="'Open Sans', sans-serif">Open Sans</SelectItem>
                          <SelectItem value="'Montserrat', sans-serif">Montserrat</SelectItem>
                          <SelectItem value="'Poppins', sans-serif">Poppins</SelectItem>
                          <SelectItem value="'Lato', sans-serif">Lato</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Esta fuente se usa para el texto general en toda la aplicación
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="headingFontFamily">Fuente para títulos</Label>
                      <Select
                        value={theme.headingFontFamily}
                        onValueChange={(value) => updateTheme({ headingFontFamily: value })}
                      >
                        <SelectTrigger id="headingFontFamily">
                          <SelectValue placeholder="Selecciona una fuente" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter, sans-serif">Inter (Predeterminado)</SelectItem>
                          <SelectItem value="'Roboto', sans-serif">Roboto</SelectItem>
                          <SelectItem value="'Open Sans', sans-serif">Open Sans</SelectItem>
                          <SelectItem value="'Montserrat', sans-serif">Montserrat</SelectItem>
                          <SelectItem value="'Poppins', sans-serif">Poppins</SelectItem>
                          <SelectItem value="'Playfair Display', serif">Playfair Display</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Esta fuente se usa para títulos y encabezados</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="p-4 border rounded-md">
                      <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: theme.headingFontFamily }}>
                        Vista previa de títulos
                      </h3>
                      <p className="mb-2" style={{ fontFamily: theme.fontFamily }}>
                        Este es un ejemplo de texto con la fuente principal seleccionada. Puedes ver cómo se ve el texto
                        normal en tu aplicación.
                      </p>
                      <h4 className="text-md font-medium mb-1" style={{ fontFamily: theme.headingFontFamily }}>
                        Subtítulo de ejemplo
                      </h4>
                      <p className="text-sm" style={{ fontFamily: theme.fontFamily }}>
                        Texto más pequeño para ver cómo se comporta la fuente en diferentes tamaños.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="interfaz" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Interfaz de usuario</CardTitle>
                  <CardDescription>Personaliza la apariencia de los elementos de la interfaz</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="borderRadius">Radio de bordes</Label>
                      <Select
                        value={theme.borderRadius}
                        onValueChange={(value: any) => updateTheme({ borderRadius: value })}
                      >
                        <SelectTrigger id="borderRadius">
                          <SelectValue placeholder="Selecciona un estilo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sin bordes redondeados</SelectItem>
                          <SelectItem value="small">Pequeño</SelectItem>
                          <SelectItem value="medium">Medio (Predeterminado)</SelectItem>
                          <SelectItem value="large">Grande</SelectItem>
                          <SelectItem value="full">Completo</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Define el radio de las esquinas en botones, tarjetas y otros elementos
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="buttonStyle">Estilo de botones</Label>
                      <Select
                        value={theme.buttonStyle}
                        onValueChange={(value: any) => updateTheme({ buttonStyle: value })}
                      >
                        <SelectTrigger id="buttonStyle">
                          <SelectValue placeholder="Selecciona un estilo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solid">Sólido (Predeterminado)</SelectItem>
                          <SelectItem value="outline">Contorno</SelectItem>
                          <SelectItem value="soft">Suave</SelectItem>
                          <SelectItem value="ghost">Fantasma</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Define el estilo visual predeterminado para los botones
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="cardStyle">Estilo de tarjetas</Label>
                      <Select value={theme.cardStyle} onValueChange={(value: any) => updateTheme({ cardStyle: value })}>
                        <SelectTrigger id="cardStyle">
                          <SelectValue placeholder="Selecciona un estilo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flat">Plano</SelectItem>
                          <SelectItem value="raised">Elevado (Predeterminado)</SelectItem>
                          <SelectItem value="bordered">Con borde</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Define el estilo visual para las tarjetas y contenedores
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sidebarStyle">Estilo de barra lateral</Label>
                      <Select
                        value={theme.sidebarStyle}
                        onValueChange={(value: any) => updateTheme({ sidebarStyle: value })}
                      >
                        <SelectTrigger id="sidebarStyle">
                          <SelectValue placeholder="Selecciona un estilo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Predeterminado</SelectItem>
                          <SelectItem value="compact">Compacto</SelectItem>
                          <SelectItem value="expanded">Expandido</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Define el estilo y tamaño de la barra de navegación lateral
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="enableAnimations">Animaciones</Label>
                        <p className="text-xs text-muted-foreground">Habilitar animaciones en la interfaz</p>
                      </div>
                      <Switch
                        id="enableAnimations"
                        checked={theme.enableAnimations}
                        onCheckedChange={(checked) => updateTheme({ enableAnimations: checked })}
                      />
                    </div>

                    {theme.enableAnimations && (
                      <div className="space-y-2 pt-4">
                        <div className="flex justify-between">
                          <Label htmlFor="animationSpeed">Velocidad de animaciones</Label>
                          <span className="text-sm text-muted-foreground">
                            {theme.animationSpeed === "slow"
                              ? "Lenta"
                              : theme.animationSpeed === "normal"
                                ? "Normal"
                                : "Rápida"}
                          </span>
                        </div>
                        <Select
                          value={theme.animationSpeed}
                          onValueChange={(value: any) => updateTheme({ animationSpeed: value })}
                        >
                          <SelectTrigger id="animationSpeed">
                            <SelectValue placeholder="Selecciona una velocidad" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="slow">Lenta</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="fast">Rápida</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="p-4 border rounded-md">
                      <h3 className="text-lg font-semibold mb-2">Vista previa de elementos</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Button>Botón primario</Button>
                        <Button variant="secondary">Botón secundario</Button>
                        <Button variant="outline">Botón outline</Button>
                        <Button variant="ghost">Botón ghost</Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>Tarjeta de ejemplo</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p>Contenido de la tarjeta</p>
                          </CardContent>
                        </Card>
                        <div className="border p-4 rounded-md">
                          <p>Contenedor con borde</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="branding" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Branding</CardTitle>
                  <CardDescription>Personaliza los elementos de marca de tu tienda</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="shopName">Nombre de la tienda</Label>
                    <Input
                      id="shopName"
                      value={theme.shopName}
                      onChange={(e) => updateTheme({ shopName: e.target.value })}
                      placeholder="Nombre de tu tienda"
                    />
                    <p className="text-xs text-muted-foreground">
                      Este nombre se mostrará en la barra lateral y en el título de la página
                    </p>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <Label htmlFor="logoUpload">Logo</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Sube el logo de tu marca. Recomendado: imagen cuadrada de al menos 256x256px
                    </p>

                    <FileUpload
                      assetType="logo"
                      currentUrl={theme.logoUrl}
                      onUploadComplete={handleLogoUpload}
                      onDelete={handleLogoDelete}
                      accept="image/*"
                      maxSize={2 * 1024 * 1024} // 2MB
                      aspectRatio="square"
                      width={200}
                      height={200}
                    />
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <Label htmlFor="faviconUpload">Favicon</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Sube el favicon para tu sitio. Recomendado: imagen cuadrada de 32x32px o 64x64px
                    </p>

                    <FileUpload
                      assetType="favicon"
                      currentUrl={theme.favicon}
                      onUploadComplete={handleFaviconUpload}
                      onDelete={handleFaviconDelete}
                      accept="image/png,image/x-icon,image/svg+xml"
                      maxSize={500 * 1024} // 500KB
                      aspectRatio="square"
                      width={64}
                      height={64}
                    />

                    <p className="text-xs text-muted-foreground mt-2">
                      El favicon se mostrará en la pestaña del navegador y cuando los usuarios guarden tu sitio en
                      favoritos
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Card>
              <CardHeader>
                <CardTitle>Vista previa</CardTitle>
                <CardDescription>Así se verá tu panel con la configuración actual</CardDescription>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Button
                    variant={previewMode === "desktop" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewMode("desktop")}
                  >
                    Escritorio
                  </Button>
                  <Button
                    variant={previewMode === "tablet" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewMode("tablet")}
                  >
                    Tablet
                  </Button>
                  <Button
                    variant={previewMode === "mobile" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewMode("mobile")}
                  >
                    Móvil
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className={`
                  border rounded-lg overflow-hidden transition-all duration-300
                  ${
                    previewMode === "desktop"
                      ? "w-full"
                      : previewMode === "tablet"
                        ? "w-[768px] max-w-full mx-auto"
                        : "w-[375px] max-w-full mx-auto"
                  }
                `}
                >
                  <div className="border-b bg-background flex items-center justify-between p-2">
                    <div className="flex items-center gap-2">
                      {theme.logoUrl ? (
                        <img
                          src={theme.logoUrl || "/placeholder.svg"}
                          alt={theme.shopName}
                          className="h-6 w-6 rounded-md object-contain"
                        />
                      ) : (
                        <div
                          className="h-6 w-6 rounded-md flex items-center justify-center"
                          style={{ backgroundColor: theme.primaryColor }}
                        >
                          <span className="text-white text-xs font-bold">{theme.shopName.charAt(0)}</span>
                        </div>
                      )}
                      <span className="text-sm font-medium">{theme.shopName}</span>
                    </div>
                    <Button size="sm" variant="ghost" onClick={toggleDarkMode}>
                      {isDarkMode ? "☀️" : "🌙"}
                    </Button>
                  </div>

                  <div className="flex">
                    <div className="w-1/4 border-r p-2 bg-muted/40">
                      <div className="space-y-1">
                        <div
                          className={`
                          rounded-md px-2 py-1 text-xs font-medium
                          ${theme.buttonStyle === "solid" ? "text-white" : "text-primary"}
                        `}
                          style={{
                            backgroundColor: theme.buttonStyle === "solid" ? theme.primaryColor : "transparent",
                            borderColor: theme.primaryColor,
                            borderWidth: theme.buttonStyle === "outline" ? "1px" : "0",
                          }}
                        >
                          Dashboard
                        </div>
                        <div className="rounded-md px-2 py-1 text-xs text-muted-foreground">Productos</div>
                        <div className="rounded-md px-2 py-1 text-xs text-muted-foreground">Pedidos</div>
                      </div>
                    </div>

                    <div className="w-3/4 p-3">
                      <h3 className="text-sm font-medium mb-2">Vista previa</h3>

                      <div
                        className={`
                        p-2 rounded-md mb-2
                        ${
                          theme.cardStyle === "flat"
                            ? "bg-muted"
                            : theme.cardStyle === "raised"
                              ? "bg-card shadow-sm"
                              : "bg-card border"
                        }
                      `}
                      >
                        <div className="text-xs">Tarjeta de ejemplo</div>
                      </div>

                      <div className="flex gap-2 mb-2">
                        <button
                          className={`
                          text-xs px-2 py-1 rounded-md
                          ${theme.buttonStyle === "solid" ? "text-white" : "text-primary"}
                        `}
                          style={{
                            backgroundColor:
                              theme.buttonStyle === "solid"
                                ? theme.primaryColor
                                : theme.buttonStyle === "soft"
                                  ? `${theme.primaryColor}20`
                                  : "transparent",
                            borderColor: theme.buttonStyle === "outline" ? theme.primaryColor : "transparent",
                            borderWidth: theme.buttonStyle === "outline" ? "1px" : "0",
                          }}
                        >
                          Botón primario
                        </button>

                        <button
                          className={`
                          text-xs px-2 py-1 rounded-md
                        `}
                          style={{
                            backgroundColor:
                              theme.buttonStyle === "solid"
                                ? theme.secondaryColor
                                : theme.buttonStyle === "soft"
                                  ? `${theme.secondaryColor}20`
                                  : "transparent",
                            color: theme.buttonStyle === "solid" ? "white" : theme.secondaryColor,
                            borderColor: theme.buttonStyle === "outline" ? theme.secondaryColor : "transparent",
                            borderWidth: theme.buttonStyle === "outline" ? "1px" : "0",
                          }}
                        >
                          Botón secundario
                        </button>
                      </div>

                      <div className="flex items-center gap-1 text-xs">
                        <span className="font-medium">Etiqueta:</span>
                        <span
                          className={`
                          px-1.5 py-0.5 rounded-full text-[10px]
                        `}
                          style={{
                            backgroundColor: `${theme.accentColor}20`,
                            color: theme.accentColor,
                          }}
                        >
                          Ejemplo
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" onClick={toggleDarkMode}>
                  {isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
