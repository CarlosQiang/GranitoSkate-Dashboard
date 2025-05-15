"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle, CheckCircle, Package, Tag, ImageIcon, VariableIcon as Variants } from "lucide-react"

interface ProductDetailProps {
  productId: number
}

export default function ProductDetail({ productId }: ProductDetailProps) {
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/db/productos/${productId}`)

        if (!response.ok) {
          throw new Error("Error al cargar el producto")
        }

        const data = await response.json()
        setProduct(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-40">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-2/3 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-40 text-red-500">
            <AlertCircle className="mr-2" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!product) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-40 text-gray-500">
            <span>No se encontró el producto</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{product.titulo}</CardTitle>
            <CardDescription>
              {product.shopify_id ? (
                <span className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Sincronizado con Shopify
                </span>
              ) : (
                <span className="flex items-center text-amber-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  No sincronizado con Shopify
                </span>
              )}
            </CardDescription>
          </div>
          <Badge variant={product.publicado ? "default" : "outline"}>
            {product.publicado ? "Publicado" : "Borrador"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="variants">
              <Variants className="h-4 w-4 mr-1" />
              Variantes ({product.variantes?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="images">
              <ImageIcon className="h-4 w-4 mr-1" />
              Imágenes ({product.imagenes?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="collections">
              <Package className="h-4 w-4 mr-1" />
              Colecciones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Descripción</h3>
                <div className="mt-1 text-sm text-gray-500">
                  {product.descripcion ? (
                    <div dangerouslySetInnerHTML={{ __html: product.descripcion }} />
                  ) : (
                    <span className="text-gray-400 italic">Sin descripción</span>
                  )}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Tipo de producto</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {product.tipo_producto || <span className="text-gray-400 italic">No especificado</span>}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Proveedor</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {product.proveedor || <span className="text-gray-400 italic">No especificado</span>}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium">Etiquetas</h3>
                <div className="mt-1 flex flex-wrap gap-1">
                  {product.etiquetas && product.etiquetas.length > 0 ? (
                    product.etiquetas.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="flex items-center">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-400 italic">Sin etiquetas</span>
                  )}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Precio base</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {product.precio_base ? (
                      `${product.precio_base} €`
                    ) : (
                      <span className="text-gray-400 italic">No especificado</span>
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Precio de comparación</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {product.precio_comparacion ? (
                      `${product.precio_comparacion} €`
                    ) : (
                      <span className="text-gray-400 italic">No especificado</span>
                    )}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">SKU</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {product.sku || <span className="text-gray-400 italic">No especificado</span>}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Código de barras</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {product.codigo_barras || <span className="text-gray-400 italic">No especificado</span>}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Inventario disponible</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {product.inventario_disponible !== null ? (
                      product.inventario_disponible
                    ) : (
                      <span className="text-gray-400 italic">No especificado</span>
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Política de inventario</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {product.politica_inventario || <span className="text-gray-400 italic">No especificado</span>}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Requiere envío</h3>
                  <p className="mt-1 text-sm text-gray-500">{product.requiere_envio ? "Sí" : "No"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Peso</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {product.peso ? (
                      `${product.peso} ${product.unidad_peso}`
                    ) : (
                      <span className="text-gray-400 italic">No especificado</span>
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">URL Handle</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {product.url_handle || <span className="text-gray-400 italic">No especificado</span>}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="variants">
            {product.variantes && product.variantes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Inventario</TableHead>
                    <TableHead>Opciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {product.variantes.map((variant: any) => (
                    <TableRow key={variant.id}>
                      <TableCell className="font-medium">{variant.titulo}</TableCell>
                      <TableCell>
                        {variant.precio} €
                        {variant.precio_comparacion && (
                          <span className="text-gray-400 line-through ml-2">{variant.precio_comparacion} €</span>
                        )}
                      </TableCell>
                      <TableCell>{variant.sku || "-"}</TableCell>
                      <TableCell>
                        {variant.inventario_disponible !== null ? variant.inventario_disponible : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          {variant.opcion1_nombre && (
                            <div>
                              <span className="font-medium">{variant.opcion1_nombre}:</span> {variant.opcion1_valor}
                            </div>
                          )}
                          {variant.opcion2_nombre && (
                            <div>
                              <span className="font-medium">{variant.opcion2_nombre}:</span> {variant.opcion2_valor}
                            </div>
                          )}
                          {variant.opcion3_nombre && (
                            <div>
                              <span className="font-medium">{variant.opcion3_nombre}:</span> {variant.opcion3_valor}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">Este producto no tiene variantes</div>
            )}
          </TabsContent>

          <TabsContent value="images">
            {product.imagenes && product.imagenes.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {product.imagenes.map((image: any) => (
                  <div key={image.id} className="relative">
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={image.texto_alternativo || product.titulo}
                      className="rounded-md object-cover aspect-square w-full"
                    />
                    {image.es_destacada && <Badge className="absolute top-2 right-2">Destacada</Badge>}
                    <div className="mt-1 text-xs text-gray-500">
                      {image.texto_alternativo || "Sin texto alternativo"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">Este producto no tiene imágenes</div>
            )}
          </TabsContent>

          <TabsContent value="collections">
            <div className="py-4">
              <h3 className="text-sm font-medium mb-2">Colecciones</h3>
              {/* Aquí iría la lista de colecciones, pero necesitaríamos cargarlas por separado */}
              <div className="text-center py-8 text-gray-500">Funcionalidad en desarrollo</div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-xs text-gray-500">
        <div className="w-full flex justify-between">
          <span>Creado: {new Date(product.fecha_creacion).toLocaleString()}</span>
          <span>Actualizado: {new Date(product.fecha_actualizacion).toLocaleString()}</span>
          {product.ultima_sincronizacion && (
            <span>Sincronizado: {new Date(product.ultima_sincronizacion).toLocaleString()}</span>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
