import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Globe, Key, Webhook, Code } from "lucide-react"

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
          Documentación completa de la integración con Shopify API, configuración y endpoints
        </p>
      </div>

      {/* Configuración */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-6 w-6" />
            Configuración de la API
          </CardTitle>
          <CardDescription>Variables de entorno y configuración necesaria</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Variables de Entorno Requeridas</h4>
            <pre className="text-sm">
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

          <div className="space-y-2">
            <h4 className="font-semibold">Archivos de Configuración</h4>
            <ul className="text-sm space-y-1">
              <li>
                <code>lib/config/shopify.ts</code> - Configuración principal
              </li>
              <li>
                <code>lib/shopify.ts</code> - Cliente de Shopify
              </li>
              <li>
                <code>lib/shopify-client.ts</code> - Cliente GraphQL
              </li>
              <li>
                <code>lib/server-shopify.ts</code> - Funciones del servidor
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints GraphQL */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-6 w-6" />
            Endpoints GraphQL
          </CardTitle>
          <CardDescription>Consultas GraphQL utilizadas para obtener datos de Shopify</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Productos GraphQL */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Productos</h4>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm">
                {`query GetProducts($first: Int!, $sortKey: ProductSortKeys!, $reverse: Boolean!) {
  products(first: $first, sortKey: $sortKey, reverse: $reverse) {
    edges {
      node {
        id
        title
        description
        status
        featuredImage {
          url
        }
        variants(first: 1) {
          edges {
            node {
              price
              inventoryQuantity
              compareAtPrice
              sku
              barcode
              weight
            }
          }
        }
        productType
        vendor
        tags
        createdAt
        updatedAt
      }
    }
  }
}`}
              </pre>
            </div>
          </div>

          {/* Colecciones GraphQL */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Colecciones</h4>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm">
                {`query GetCollections($first: Int!) {
  collections(first: $first) {
    edges {
      node {
        id
        title
        description
        image {
          url
        }
        productsCount
        createdAt
        updatedAt
      }
    }
  }
}`}
              </pre>
            </div>
          </div>

          {/* Clientes GraphQL */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Clientes</h4>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm">
                {`query GetCustomers($first: Int!) {
  customers(first: $first) {
    edges {
      node {
        id
        email
        firstName
        lastName
        phone
        defaultAddress {
          address1
          city
          country
          zip
        }
        createdAt
        updatedAt
      }
    }
  }
}`}
              </pre>
            </div>
          </div>

          {/* Pedidos GraphQL */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Pedidos</h4>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm">
                {`query GetOrders($first: Int!, $sortKey: OrderSortKeys!, $reverse: Boolean!) {
  orders(first: $first, sortKey: $sortKey, reverse: $reverse) {
    edges {
      node {
        id
        name
        email
        totalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        subtotalPriceSet {
          shopMoney {
            amount
          }
        }
        totalTaxSet {
          shopMoney {
            amount
          }
        }
        totalShippingPriceSet {
          shopMoney {
            amount
          }
        }
        financialStatus
        fulfillmentStatus
        processedAt
        createdAt
        updatedAt
      }
    }
  }
}`}
              </pre>
            </div>
          </div>

          {/* Promociones GraphQL */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Promociones</h4>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm">
                {`query GetDiscountCodes {
  discountNodes(first: 100) {
    edges {
      node {
        id
        discount {
          ... on DiscountCodeBasic {
            title
            status
            codes(first: 1) {
              edges {
                node {
                  code
                }
              }
            }
            customerGets {
              value {
                ... on DiscountPercentage {
                  percentage
                }
                ... on DiscountAmount {
                  amount {
                    amount
                  }
                }
              }
            }
            startsAt
            endsAt
            createdAt
            updatedAt
          }
        }
      }
    }
  }
}`}
              </pre>
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
          <CardDescription>Endpoints REST utilizados para operaciones específicas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Shopify REST API</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50">
                  GET
                </Badge>
                <code>/admin/api/2024-01/products.json</code>
                <span className="text-sm text-muted-foreground">- Obtener productos</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50">
                  GET
                </Badge>
                <code>/admin/api/2024-01/collections.json</code>
                <span className="text-sm text-muted-foreground">- Obtener colecciones</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50">
                  GET
                </Badge>
                <code>/admin/api/2024-01/customers.json</code>
                <span className="text-sm text-muted-foreground">- Obtener clientes</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50">
                  GET
                </Badge>
                <code>/admin/api/2024-01/orders.json</code>
                <span className="text-sm text-muted-foreground">- Obtener pedidos</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50">
                  GET
                </Badge>
                <code>/admin/api/2024-01/discount_codes.json</code>
                <span className="text-sm text-muted-foreground">- Obtener códigos de descuento</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Endpoints Internos</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50">
                  POST
                </Badge>
                <code>/api/shopify/products</code>
                <span className="text-sm text-muted-foreground">- Proxy para productos</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50">
                  POST
                </Badge>
                <code>/api/shopify/collections</code>
                <span className="text-sm text-muted-foreground">- Proxy para colecciones</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50">
                  GET
                </Badge>
                <code>/api/shopify/check</code>
                <span className="text-sm text-muted-foreground">- Verificar conexión</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50">
                  GET
                </Badge>
                <code>/api/shopify/test-connection</code>
                <span className="text-sm text-muted-foreground">- Probar conexión</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Autenticación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-6 w-6" />
            Autenticación y Permisos
          </CardTitle>
          <CardDescription>Configuración de autenticación y permisos necesarios</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-semibold">Permisos Requeridos en Shopify</h4>
            <div className="grid gap-2 md:grid-cols-2">
              <ul className="text-sm space-y-1">
                <li>
                  • <code>read_products</code> - Leer productos
                </li>
                <li>
                  • <code>write_products</code> - Escribir productos
                </li>
                <li>
                  • <code>read_collections</code> - Leer colecciones
                </li>
                <li>
                  • <code>write_collections</code> - Escribir colecciones
                </li>
                <li>
                  • <code>read_customers</code> - Leer clientes
                </li>
                <li>
                  • <code>read_orders</code> - Leer pedidos
                </li>
              </ul>
              <ul className="text-sm space-y-1">
                <li>
                  • <code>read_discounts</code> - Leer descuentos
                </li>
                <li>
                  • <code>write_discounts</code> - Escribir descuentos
                </li>
                <li>
                  • <code>read_inventory</code> - Leer inventario
                </li>
                <li>
                  • <code>write_inventory</code> - Escribir inventario
                </li>
                <li>
                  • <code>read_price_rules</code> - Leer reglas de precio
                </li>
                <li>
                  • <code>write_price_rules</code> - Escribir reglas de precio
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Headers de Autenticación</h4>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm">
                {`// Para GraphQL
headers: {
  'Content-Type': 'application/json',
  'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN
}

// Para REST API
headers: {
  'Content-Type': 'application/json',
  'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-6 w-6" />
            Webhooks (Futuro)
          </CardTitle>
          <CardDescription>Configuración de webhooks para sincronización automática</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-semibold">Webhooks Recomendados</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">POST</Badge>
                <code>products/create</code>
                <span className="text-sm text-muted-foreground">- Producto creado</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">POST</Badge>
                <code>products/update</code>
                <span className="text-sm text-muted-foreground">- Producto actualizado</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">POST</Badge>
                <code>orders/create</code>
                <span className="text-sm text-muted-foreground">- Pedido creado</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">POST</Badge>
                <code>customers/create</code>
                <span className="text-sm text-muted-foreground">- Cliente creado</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> Los webhooks no están implementados actualmente. La sincronización se realiza
              manualmente desde el panel de administración.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
