"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, ImageIcon, Save } from "lucide-react"
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
                <Input defaultValue="GranitoSkate - Tienda de skate" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subtítulo</label>
                <Input defaultValue="La mejor selección de productos para skaters" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción</label>
                <Textarea
                  rows={5}
                  defaultValue="Bienvenido a GranitoSkate, tu tienda especializada en productos de skateboarding. Ofrecemos una amplia selección de tablas, ruedas, ejes y accesorios de las mejores marcas del mercado."
                />
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
                <Textarea
                  rows={8}
                  defaultValue="GranitoSkate nació en 2020 con la misión de ofrecer productos de calidad para la comunidad skater. Fundada por apasionados del skateboarding, nuestra tienda se ha convertido en un referente para los amantes de este deporte."
                />
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
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div>
                    <p className="font-medium">Cómo elegir tu primera tabla de skate</p>
                    <p className="text-sm text-muted-foreground">Publicado el 15/04/2023</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-1" /> Editar
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div>
                    <p className="font-medium">Los mejores spots para patinar en la ciudad</p>
                    <p className="text-sm text-muted-foreground">Publicado el 22/05/2023</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-1" /> Editar
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div>
                    <p className="font-medium">Mantenimiento básico de tu skate</p>
                    <p className="text-sm text-muted-foreground">Publicado el 10/06/2023</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-1" /> Editar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Nuevo artículo</Button>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                  <div key={item} className="aspect-square rounded-md bg-muted flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button>Subir archivo</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
