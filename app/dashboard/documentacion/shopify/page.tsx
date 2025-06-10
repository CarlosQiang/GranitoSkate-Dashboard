import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Key, Code } from "lucide-react"

export const metadata: Metadata = {
  title: "Documentación de Shopify - GranitoSkate",
  description: "Documentación completa de la integración con Shopify",
}

export default function ShopifyPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Zap className="h-8 w-8 text-purple-600" />
          Documentación de Shopify
        </h1>
        <p className="text-muted-foreground">
          Documentación completa de la integración con Shopify API y endpoints REST
        </p>
      </div>

      {/* Configuración */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-6 w-6" />
            Configuración de la API
          </CardTitle>
          <CardDescription>Variables de entorno necesarias para la integración</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Variables de Entorno Requeridas</h4>
            <pre className="text-sm overflow-x-auto">
              {`# Shopify Configuration
NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN=tu-tienda.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxxxxx
SHOPIFY_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
SHOPIFY_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxxxxx

# API URLs
SHOPIFY_API_URL=https://tu-tienda.myshopify.com/admin/api/2024-01
NEXT_PUBLIC_API_URL=https://tu-dominio.com/api`}
            </pre>
          </div>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-semibold text-lg">REST API</div>
              <div className="text-sm text-muted-foreground">Protocolo</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-semibold text-lg">2024-01</div>
              <div className="text-sm text-muted-foreground">Versión API</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-semibold text-lg">JSON</div>
              <div className="text-sm text-muted-foreground">Formato</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints REST */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-6 w-6" />
            Endpoints REST
          </CardTitle>
          <CardDescription>Endpoints REST utilizados para obtener datos de Shopify</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Productos REST */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Productos</h4>
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="outline" className="bg-green-50">
                  GET
                </Badge>
                <code className="text-sm break-all">/admin/api/2024-01/products.json</code>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Obtener productos de Shopify</p>

              <div className="space-y-2 text-xs">
                <div>
                  <strong>Headers:</strong>
                  <pre className="bg-muted p-2 rounded mt-1 overflow-x-auto">{`{
  "Content-Type": "application/json",
  "X-Shopify-Access-Token": "tu_access_token"
}`}</pre>
                </div>

                <div>
                  <strong>Parámetros de consulta:</strong>
                  <pre className="bg-muted p-2 rounded mt-1 overflow-x-auto">{`?limit=250&status=active&fields=id,title,body_html,vendor,product_type,created_at,updated_at,published_at,tags,variants`}</pre>
                </div>

                <div>
                  <strong>Respuesta:</strong>
                  <pre className="bg-muted p-2 rounded mt-1 overflow-x-auto">{`{
  "products": [
    {
      "id": 123456789,
      "title": "Producto Ejemplo",
      "body_html": "<p>Descripción del producto</p>",
      "vendor": "Mi Marca",
      "product_type": "Skateboard",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "published_at": "2024-01-01T00:00:00Z",
      "tags": "skate, deporte",
      "variants": [
        {
          "id": 987654321,
          "price": "99.99",
          "compare_at_price": "129.99",
          "sku": "SKU123",
          "barcode": "123456789",
          "inventory_quantity": 10,
          "weight": 2.5
        }
      ]
    }
  ]
}`}</pre>
                </div>
              </div>
            </div>
          </div>

          {/* Colecciones REST */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Colecciones</h4>
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="outline" className="bg-green-50">
                  GET
                </Badge>
                <code className="text-sm break-all">/admin/api/2024-01/collections.json</code>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Obtener colecciones de Shopify</p>

              <div className="space-y-2 text-xs">
                <div>
                  <strong>Headers:</strong>
                  <pre className="bg-muted p-2 rounded mt-1 overflow-x-auto">{`{
  "Content-Type": "application/json",
  "X-Shopify-Access-Token": "tu_access_token"
}`}</pre>
                </div>

                <div>
                  <strong>Respuesta:</strong>
                  <pre className="bg-muted p-2 rounded mt-1 overflow-x-auto">{`{
  "collections": [
    {
      "id": 123456789,
      "title": "Skateboards",
      "body_html": "<p>Colección de skateboards</p>",
      "sort_order": "manual",
      "template_suffix": null,
      "products_count": 15,
      "collection_type": "smart",
      "published_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}`}</pre>
                </div>
              </div>
            </div>
          </div>

          {/* Clientes REST */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Clientes</h4>
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="outline" className="bg-green-50">
                  GET
                </Badge>
                <code className="text-sm break-all">/admin/api/2024-01/customers.json</code>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Obtener clientes de Shopify</p>

              <div className="space-y-2 text-xs">
                <div>
                  <strong>Headers:</strong>
                  <pre className="bg-muted p-2 rounded mt-1 overflow-x-auto">{`{
  "Content-Type": "application/json",
  "X-Shopify-Access-Token": "tu_access_token"
}`}</pre>
                </div>

                <div>
                  <strong>Respuesta:</strong>
                  <pre className="bg-muted p-2 rounded mt-1 overflow-x-auto">{`{
  "customers": [
    {
      "id": 123456789,
      "email": "cliente@ejemplo.com",
      "first_name": "Juan",
      "last_name": "Pérez",
      "phone": "+34123456789",
      "total_spent": "299.99",
      "orders_count": 3,
      "state": "enabled",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "default_address": {
        "address1": "Calle Principal 123",
        "city": "Madrid",
        "country": "Spain",
        "zip": "28001"
      }
    }
  ]
}`}</pre>
                </div>
              </div>
            </div>
          </div>

          {/* Pedidos REST */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Pedidos</h4>
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="outline" className="bg-green-50">
                  GET
                </Badge>
                <code className="text-sm break-all">/admin/api/2024-01/orders.json</code>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Obtener pedidos de Shopify</p>

              <div className="space-y-2 text-xs">
                <div>
                  <strong>Headers:</strong>
                  <pre className="bg-muted p-2 rounded mt-1 overflow-x-auto">{`{
  "Content-Type": "application/json",
  "X-Shopify-Access-Token": "tu_access_token"
}`}</pre>
                </div>

                <div>
                  <strong>Parámetros de consulta:</strong>
                  <pre className="bg-muted p-2 rounded mt-1 overflow-x-auto">{`?status=any&limit=250&fields=id,name,email,total_price,subtotal_price,total_tax,shipping_price,financial_status,fulfillment_status,created_at,updated_at,processed_at`}</pre>
                </div>

                <div>
                  <strong>Respuesta:</strong>
                  <pre className="bg-muted p-2 rounded mt-1 overflow-x-auto">{`{
  "orders": [
    {
      "id": 123456789,
      "name": "#1001",
      "email": "cliente@ejemplo.com",
      "total_price": "129.99",
      "subtotal_price": "99.99",
      "total_tax": "21.00",
      "shipping_price": "9.00",
      "financial_status": "paid",
      "fulfillment_status": "fulfilled",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "processed_at": "2024-01-01T00:00:00Z"
    }
  ]
}`}</pre>
                </div>
              </div>
            </div>
          </div>

          {/* Promociones REST */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Promociones</h4>
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="outline" className="bg-green-50">
                  GET
                </Badge>
                <code className="text-sm break-all">/admin/api/2024-01/discount_codes.json</code>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Obtener códigos de descuento de Shopify</p>

              <div className="space-y-2 text-xs">
                <div>
                  <strong>Headers:</strong>
                  <pre className="bg-muted p-2 rounded mt-1 overflow-x-auto">{`{
  "Content-Type": "application/json",
  "X-Shopify-Access-Token": "tu_access_token"
}`}</pre>
                </div>

                <div>
                  <strong>Respuesta:</strong>
                  <pre className="bg-muted p-2 rounded mt-1 overflow-x-auto">{`{
  "discount_codes": [
    {
      "id": 123456789,
      "code": "VERANO2024",
      "amount": "10.00",
      "type": "percentage",
      "status": "enabled",
      "starts_at": "2024-06-01T00:00:00Z",
      "ends_at": "2024-08-31T23:59:59Z",
      "created_at": "2024-05-01T00:00:00Z",
      "updated_at": "2024-05-01T00:00:00Z"
    }
  ]
}`}</pre>
                </div>
              </div>
            </div>
          </div>

          {/* Endpoints Internos */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Endpoints Internos de la Aplicación</h4>
            <div className="space-y-3">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="outline" className="bg-blue-50">
                    POST
                  </Badge>
                  <code className="text-sm break-all">/api/shopify/products</code>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Proxy interno para obtener productos</p>
                <div className="text-xs">
                  <strong>Respuesta:</strong> Productos formateados para la aplicación
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="outline" className="bg-blue-50">
                    POST
                  </Badge>
                  <code className="text-sm break-all">/api/shopify/collections</code>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Proxy interno para obtener colecciones</p>
                <div className="text-xs">
                  <strong>Respuesta:</strong> Colecciones formateadas para la aplicación
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="outline" className="bg-green-50">
                    GET
                  </Badge>
                  <code className="text-sm break-all">/api/shopify/check</code>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Verificar conexión con Shopify</p>
                <div className="text-xs">
                  <strong>Respuesta:</strong> {`{connected: boolean, shop: string}`}
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="outline" className="bg-green-50">
                    GET
                  </Badge>
                  <code className="text-sm break-all">/api/shopify/test-connection</code>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Probar conexión con Shopify</p>
                <div className="text-xs">
                  <strong>Respuesta:</strong> Estado detallado de la conexión
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
