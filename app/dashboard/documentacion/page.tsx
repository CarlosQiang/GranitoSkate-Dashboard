import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, BookOpen, Settings, ShoppingBag, Users, FileText, BarChart2 } from "lucide-react"

export default function DocumentacionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Documentación</h1>
        <p className="text-muted-foreground">Guía completa para configurar y utilizar la aplicación GestionGranito</p>
      </div>

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Importante</AlertTitle>
        <AlertDescription>
          Esta documentación te ayudará a configurar y utilizar correctamente todas las funcionalidades de la
          aplicación.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="inicio" className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="inicio">
            <BookOpen className="h-4 w-4 mr-2" />
            Inicio
          </TabsTrigger>
          <TabsTrigger value="configuracion">
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </TabsTrigger>
          <TabsTrigger value="productos">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Productos
          </TabsTrigger>
          <TabsTrigger value="clientes">
            <Users className="h-4 w-4 mr-2" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="pedidos">
            <FileText className="h-4 w-4 mr-2" />
            Pedidos
          </TabsTrigger>
          <TabsTrigger value="analiticas">
            <BarChart2 className="h-4 w-4 mr-2" />
            Analíticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inicio">
          <Card>
            <CardHeader>
              <CardTitle>Bienvenido a GestionGranito</CardTitle>
              <CardDescription>Introducción a la aplicación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">¿Qué es GestionGranito?</h3>
              <p>
                GestionGranito es una aplicación de gestión para tiendas Shopify que te permite administrar tus
                productos, colecciones, clientes y pedidos de manera eficiente. La aplicación se sincroniza con tu
                tienda Shopify para mantener la información actualizada.
              </p>

              <h3 className="text-lg font-medium">Características principales</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Gestión de productos y colecciones</li>
                <li>Seguimiento de clientes y pedidos</li>
                <li>Análisis de ventas y rendimiento</li>
                <li>Sincronización automática con Shopify</li>
                <li>Gestión de promociones y descuentos</li>
                <li>Optimización SEO para productos y colecciones</li>
              </ul>

              <h3 className="text-lg font-medium">Primeros pasos</h3>
              <p>
                Para comenzar a utilizar GestionGranito, primero debes configurar la conexión con tu tienda Shopify. Ve
                a la sección de Configuración y sigue las instrucciones para conectar tu tienda.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuracion">
          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
              <CardDescription>Configura la conexión con Shopify y otras opciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">Conexión con Shopify</h3>
              <p>
                Para conectar GestionGranito con tu tienda Shopify, necesitas configurar las siguientes variables de
                entorno:
              </p>

              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN</strong>: El dominio de tu tienda Shopify (sin https://)
                </li>
                <li>
                  <strong>SHOPIFY_ACCESS_TOKEN</strong>: Tu token de acceso de Shopify
                </li>
                <li>
                  <strong>SHOPIFY_API_URL</strong>: URL de la API de Shopify (opcional, se genera automáticamente)
                </li>
              </ul>

              <h3 className="text-lg font-medium">Configuración de la base de datos</h3>
              <p>
                GestionGranito utiliza una base de datos PostgreSQL para almacenar la información sincronizada de
                Shopify. Configura la conexión con la base de datos mediante la variable de entorno:
              </p>

              <ul className="list-disc pl-5">
                <li>
                  <strong>POSTGRES_URL</strong>: URL de conexión a tu base de datos PostgreSQL
                </li>
              </ul>

              <h3 className="text-lg font-medium">Configuración de autenticación</h3>
              <p>Para la autenticación de usuarios, configura las siguientes variables de entorno:</p>

              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>NEXTAUTH_SECRET</strong>: Clave secreta para NextAuth
                </li>
                <li>
                  <strong>NEXTAUTH_URL</strong>: URL de tu aplicación
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="productos">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Productos</CardTitle>
              <CardDescription>Administra los productos de tu tienda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">Visualización de productos</h3>
              <p>
                En la sección de Productos, puedes ver todos los productos de tu tienda Shopify. Puedes filtrar los
                productos por nombre, tipo, proveedor y estado.
              </p>

              <h3 className="text-lg font-medium">Sincronización de productos</h3>
              <p>
                Para mantener la información de productos actualizada, ve a la sección de Sincronización y selecciona la
                pestaña de Productos. Haz clic en el botón "Sincronizar productos" para actualizar la información desde
                Shopify.
              </p>

              <h3 className="text-lg font-medium">Edición de productos</h3>
              <p>
                Puedes editar la información de un producto haciendo clic en el botón "Editar" en la lista de productos.
                Los cambios se sincronizarán automáticamente con Shopify.
              </p>

              <h3 className="text-lg font-medium">Gestión de colecciones</h3>
              <p>
                En la sección de Colecciones, puedes ver y administrar las colecciones de productos. Puedes asignar
                productos a colecciones y crear nuevas colecciones.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clientes">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Clientes</CardTitle>
              <CardDescription>Administra los clientes de tu tienda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">Visualización de clientes</h3>
              <p>
                En la sección de Clientes, puedes ver todos los clientes de tu tienda Shopify. Puedes filtrar los
                clientes por nombre, email y estado.
              </p>

              <h3 className="text-lg font-medium">Sincronización de clientes</h3>
              <p>
                Para mantener la información de clientes actualizada, ve a la sección de Sincronización y selecciona la
                pestaña de Clientes. Haz clic en el botón "Sincronizar clientes" para actualizar la información desde
                Shopify.
              </p>

              <h3 className="text-lg font-medium">Detalles de cliente</h3>
              <p>
                Puedes ver los detalles de un cliente haciendo clic en su nombre en la lista de clientes. Verás su
                información de contacto, direcciones y pedidos realizados.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pedidos">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Pedidos</CardTitle>
              <CardDescription>Administra los pedidos de tu tienda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">Visualización de pedidos</h3>
              <p>
                En la sección de Pedidos, puedes ver todos los pedidos de tu tienda Shopify. Puedes filtrar los pedidos
                por número, estado y fecha.
              </p>

              <h3 className="text-lg font-medium">Sincronización de pedidos</h3>
              <p>
                Para mantener la información de pedidos actualizada, ve a la sección de Sincronización y selecciona la
                pestaña de Pedidos. Haz clic en el botón "Sincronizar pedidos" para actualizar la información desde
                Shopify.
              </p>

              <h3 className="text-lg font-medium">Detalles de pedido</h3>
              <p>
                Puedes ver los detalles de un pedido haciendo clic en su número en la lista de pedidos. Verás los
                productos incluidos, información de envío, pagos y estado del pedido.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analiticas">
          <Card>
            <CardHeader>
              <CardTitle>Analíticas</CardTitle>
              <CardDescription>Visualiza el rendimiento de tu tienda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">Dashboard</h3>
              <p>
                El Dashboard principal muestra un resumen del rendimiento de tu tienda, incluyendo ventas totales,
                número de pedidos, clientes y productos.
              </p>

              <h3 className="text-lg font-medium">Análisis de ventas</h3>
              <p>
                En la sección de Analíticas, puedes ver gráficos detallados de ventas por período, productos más
                vendidos, clientes más activos y otros indicadores clave.
              </p>

              <h3 className="text-lg font-medium">Exportación de datos</h3>
              <p>
                Puedes exportar los datos de análisis en formato CSV o Excel para realizar análisis más detallados en
                otras herramientas.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
