import { ShopifyTokenChecker } from "@/components/shopify-token-checker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, AlertCircle } from "lucide-react"

export default function ShopifySettingsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Configuración de Shopify</h1>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Información importante</AlertTitle>
        <AlertDescription>
          Para que la sincronización de tutoriales funcione correctamente, el token de acceso de Shopify debe tener los
          siguientes permisos: read_products, write_products, read_product_listings, read_collections,
          write_collections.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Variables de entorno actuales</CardTitle>
            <CardDescription>Estas son las variables de entorno configuradas actualmente para Shopify</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN</h3>
                <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                  {process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || "No configurado"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium">SHOPIFY_ACCESS_TOKEN</h3>
                <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                  {process.env.SHOPIFY_ACCESS_TOKEN ? "********" : "No configurado"}
                </p>
              </div>

              <Alert
                variant={
                  !process.env.SHOPIFY_ACCESS_TOKEN || !process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
                    ? "destructive"
                    : "default"
                }
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Estado de la configuración</AlertTitle>
                <AlertDescription>
                  {!process.env.SHOPIFY_ACCESS_TOKEN || !process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
                    ? "Faltan variables de entorno necesarias para la conexión con Shopify."
                    : "Variables de entorno configuradas correctamente."}
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        <ShopifyTokenChecker />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Guía de configuración</CardTitle>
          <CardDescription>Sigue estos pasos para configurar correctamente la conexión con Shopify</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-5 space-y-4">
            <li>
              <p className="font-medium">Accede al panel de administración de Shopify</p>
              <p className="text-sm text-muted-foreground">
                Inicia sesión en tu tienda Shopify y ve al panel de administración.
              </p>
            </li>
            <li>
              <p className="font-medium">Crea una App privada</p>
              <p className="text-sm text-muted-foreground">
                Ve a Apps &gt; Desarrollar apps &gt; Crear una app &gt; Crear una app privada.
              </p>
            </li>
            <li>
              <p className="font-medium">Configura los permisos</p>
              <p className="text-sm text-muted-foreground">
                En la sección de permisos de la API, asegúrate de habilitar los siguientes permisos:
              </p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground mt-1">
                <li>read_products, write_products</li>
                <li>read_product_listings</li>
                <li>read_collections, write_collections</li>
              </ul>
            </li>
            <li>
              <p className="font-medium">Obtén el token de acceso</p>
              <p className="text-sm text-muted-foreground">
                Después de crear la app, copia el token de acceso (Admin API access token).
              </p>
            </li>
            <li>
              <p className="font-medium">Configura las variables de entorno</p>
              <p className="text-sm text-muted-foreground">Añade las siguientes variables de entorno a tu proyecto:</p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground mt-1">
                <li>NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN: tu-tienda.myshopify.com</li>
                <li>SHOPIFY_ACCESS_TOKEN: el token de acceso que obtuviste</li>
              </ul>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
