"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function ContentPage() {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)

    // Simulación de guardado
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Contenido guardado",
        description: "El contenido ha sido guardado correctamente",
      })
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contenido</h1>
          <p className="text-muted-foreground">Gestiona el contenido de tu tienda</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>

      <Tabs defaultValue="pages">
        <TabsList>
          <TabsTrigger value="pages">Páginas</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
          <TabsTrigger value="media">Multimedia</TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Página de inicio</CardTitle>
              <CardDescription>Edita el contenido de la página principal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Título principal</label>
                <Input placeholder="Título de tu página principal" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subtítulo</label>
                <Input placeholder="Subtítulo de tu página principal" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción</label>
                <Textarea rows={5} placeholder="Descripción de tu página principal" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Página Acerca de</CardTitle>
              <CardDescription>Edita la información sobre tu empresa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contenido</label>
                <Textarea rows={8} placeholder="Información sobre tu empresa" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blog" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Artículos del blog</CardTitle>
              <CardDescription>Gestiona los artículos de tu blog</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <p>No hay artículos de blog todavía</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo artículo
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Biblioteca de medios</CardTitle>
              <CardDescription>Gestiona las imágenes y videos de tu tienda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <p>No hay archivos multimedia todavía</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Subir archivo
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
