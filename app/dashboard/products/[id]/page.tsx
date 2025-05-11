import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getProductById } from "@/lib/api/products"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingState } from "@/components/loading-state"
import { ProductForm } from "@/components/product-form"
import { ProductSeoForm } from "@/components/product-seo-form"
import { ProductCollections } from "@/components/product-collections"

export const dynamic = "force-dynamic"
export const revalidate = 0

async function getProduct(id) {
  try {
    return await getProductById(id)
  } catch (error) {
    console.error(`Error al cargar el producto ${id}:`, error)
    return null
  }
}

export default async function ProductPage({ params }) {
  const product = await getProduct(params.id)

  if (!product) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div>
        <h1 className="text-2xl font-bold">{product.title}</h1>
        <p className="text-muted-foreground">Gestiona los detalles del producto</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="collections">Colecciones</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Información del producto</CardTitle>
              <CardDescription>Edita la información básica del producto</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductForm product={product} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="seo" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO del producto</CardTitle>
              <CardDescription>Optimiza el SEO para este producto</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<LoadingState message="Cargando datos SEO..." />}>
                <ProductSeoForm product={product} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="collections" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Colecciones</CardTitle>
              <CardDescription>Gestiona las colecciones a las que pertenece este producto</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<LoadingState message="Cargando colecciones..." />}>
                <ProductCollections productId={params.id} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
