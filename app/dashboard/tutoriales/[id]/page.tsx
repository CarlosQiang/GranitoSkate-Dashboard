import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, Trash, Eye, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { getTutorialById } from "@/lib/api/tutoriales"
import ReactMarkdown from "react-markdown"

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const tutorial = await getTutorialById(Number.parseInt(params.id))

  if (!tutorial) {
    return {
      title: "Tutorial no encontrado - GranitoSkate",
    }
  }

  return {
    title: `${tutorial.titulo} - GranitoSkate`,
    description: tutorial.descripcion,
  }
}

export default async function TutorialPage({ params }: { params: { id: string } }) {
  const tutorial = await getTutorialById(Number.parseInt(params.id))

  if (!tutorial) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/tutoriales">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{tutorial.titulo}</h1>
          {tutorial.destacado && <Badge variant="secondary">Destacado</Badge>}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/tutoriales/${tutorial.id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/tutoriales/${tutorial.id}/eliminar`}>
              <Trash className="mr-2 h-4 w-4" />
              Eliminar
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/api/tutoriales/${tutorial.id}/sincronizar`}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sincronizar
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="contenido">
            <TabsList>
              <TabsTrigger value="contenido">Contenido</TabsTrigger>
              <TabsTrigger value="metadatos">Metadatos</TabsTrigger>
            </TabsList>

            <TabsContent value="contenido" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Contenido del tutorial</CardTitle>
                  <CardDescription>{tutorial.descripcion}</CardDescription>
                </CardHeader>
                <CardContent className="prose max-w-none dark:prose-invert">
                  <ReactMarkdown>{tutorial.contenido}</ReactMarkdown>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metadatos" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Metadatos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium">Nivel de dificultad</h3>
                      <p className="capitalize">{tutorial.nivel_dificultad}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium">Tiempo estimado</h3>
                      <p>{tutorial.tiempo_estimado} minutos</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium">Categorías</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {tutorial.categorias.map((categoria: string) => (
                        <Badge key={categoria} variant="outline">
                          {categoria}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium">Etiquetas</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {tutorial.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {tutorial.metadatos && (
                    <div>
                      <h3 className="text-sm font-medium">Metadatos adicionales</h3>
                      <pre className="mt-1 p-2 bg-muted rounded-md text-xs overflow-auto">
                        {JSON.stringify(tutorial.metadatos, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Estado</h3>
                <div className="mt-1">
                  {tutorial.publicado ? (
                    <Badge variant="success">Publicado</Badge>
                  ) : (
                    <Badge variant="secondary">Borrador</Badge>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium">ID en Shopify</h3>
                <p className="text-sm break-all">{tutorial.shopify_id || "No sincronizado"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium">Fecha de creación</h3>
                <p className="text-sm">{format(new Date(tutorial.fecha_creacion), "PPP", { locale: es })}</p>
              </div>

              {tutorial.fecha_actualizacion && (
                <div>
                  <h3 className="text-sm font-medium">Última actualización</h3>
                  <p className="text-sm">{format(new Date(tutorial.fecha_actualizacion), "PPP", { locale: es })}</p>
                </div>
              )}

              {tutorial.fecha_publicacion && (
                <div>
                  <h3 className="text-sm font-medium">Fecha de publicación</h3>
                  <p className="text-sm">{format(new Date(tutorial.fecha_publicacion), "PPP", { locale: es })}</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link
                  href={
                    tutorial.shopify_id
                      ? `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/products/${tutorial.slug}`
                      : "#"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {tutorial.shopify_id ? "Ver en tienda" : "No disponible en tienda"}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
