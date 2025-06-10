import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database, Table, Code, LinkIcon } from "lucide-react"

export const metadata: Metadata = {
  title: "Documentación de Base de Datos - GranitoSkate",
  description: "Documentación completa del sistema de base de datos",
}

export default function BaseDatosPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Database className="h-8 w-8 text-green-600" />
          Documentación de Base de Datos
        </h1>
        <p className="text-muted-foreground">
          Documentación completa del sistema SQL, estructura de base de datos y endpoints de la API
        </p>
      </div>

      {/* Esquema de Base de Datos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Table className="h-6 w-6" />
            Esquema de Base de Datos
          </CardTitle>
          <CardDescription>Estructura completa de las tablas y relaciones</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Tabla Productos */}
            <div className="space-y-2">
              <h4 className="font-semibold text-lg">productos</h4>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm">
                  {`CREATE TABLE productos (
  id SERIAL PRIMARY KEY,
  shopify_id VARCHAR(255) UNIQUE,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2),
  precio_comparacion DECIMAL(10,2),
  inventario INTEGER DEFAULT 0,
  sku VARCHAR(255),
  codigo_barras VARCHAR(255),
  peso DECIMAL(8,2),
  imagen_url TEXT,
  estado VARCHAR(50) DEFAULT 'ACTIVE',
  tipo_producto VARCHAR(255),
  proveedor VARCHAR(255),
  etiquetas TEXT,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP DEFAULT NOW()
);`}
                </pre>
              </div>
            </div>

            {/* Tabla Colecciones */}
            <div className="space-y-2">
              <h4 className="font-semibold text-lg">colecciones</h4>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm">
                  {`CREATE TABLE colecciones (
  id SERIAL PRIMARY KEY,
  shopify_id VARCHAR(255) UNIQUE,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  imagen_url TEXT,
  estado VARCHAR(50) DEFAULT 'ACTIVE',
  tipo VARCHAR(50) DEFAULT 'MANUAL',
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP DEFAULT NOW()
);`}
                </pre>
              </div>
            </div>

            {/* Tabla Clientes */}
            <div className="space-y-2">
              <h4 className="font-semibold text-lg">clientes</h4>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm">
                  {`CREATE TABLE clientes (
  id SERIAL PRIMARY KEY,
  shopify_id VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE,
  nombre VARCHAR(255),
  apellidos VARCHAR(255),
  telefono VARCHAR(255),
  estado VARCHAR(50) DEFAULT 'ENABLED',
  total_gastado DECIMAL(10,2) DEFAULT 0,
  numero_pedidos INTEGER DEFAULT 0,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP DEFAULT NOW()
);`}
                </pre>
              </div>
            </div>

            {/* Tabla Pedidos */}
            <div className="space-y-2">
              <h4 className="font-semibold text-lg">pedidos</h4>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm">
                  {`CREATE TABLE pedidos (
  id SERIAL PRIMARY KEY,
  shopify_id VARCHAR(255) UNIQUE,
  numero_pedido VARCHAR(255),
  cliente_id INTEGER REFERENCES clientes(id),
  cliente_email VARCHAR(255),
  estado VARCHAR(50),
  estado_financiero VARCHAR(50),
  estado_cumplimiento VARCHAR(50),
  total DECIMAL(10,2),
  subtotal DECIMAL(10,2),
  impuestos DECIMAL(10,2),
  envio DECIMAL(10,2),
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP DEFAULT NOW()
);`}
                </pre>
              </div>
            </div>

            {/* Tabla Promociones */}
            <div className="space-y-2">
              <h4 className="font-semibold text-lg">promociones</h4>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm">
                  {`CREATE TABLE promociones (
  id SERIAL PRIMARY KEY,
  shopify_id VARCHAR(255) UNIQUE,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  codigo VARCHAR(255),
  tipo VARCHAR(50),
  valor DECIMAL(10,2),
  estado VARCHAR(50) DEFAULT 'ACTIVE',
  fecha_inicio TIMESTAMP,
  fecha_fin TIMESTAMP,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP DEFAULT NOW()
);`}
                </pre>
              </div>
            </div>

            {/* Tabla Administradores */}
            <div className="space-y-2">
              <h4 className="font-semibold text-lg">administradores</h4>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm">
                  {`CREATE TABLE administradores (
  id SERIAL PRIMARY KEY,
  usuario VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(50) DEFAULT 'ADMIN',
  activo BOOLEAN DEFAULT true,
  ultimo_acceso TIMESTAMP,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP DEFAULT NOW()
);`}
                </pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints de la API */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-6 w-6" />
            Endpoints de la API
          </CardTitle>
          <CardDescription>Todos los endpoints disponibles para interactuar con la base de datos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Productos API */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Productos</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50">
                  GET
                </Badge>
                <code>/api/db/productos</code>
                <span className="text-sm text-muted-foreground">- Obtener todos los productos</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50">
                  GET
                </Badge>
                <code>/api/db/productos/[id]</code>
                <span className="text-sm text-muted-foreground">- Obtener producto por ID</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50">
                  POST
                </Badge>
                <code>/api/db/productos</code>
                <span className="text-sm text-muted-foreground">- Crear nuevo producto</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-yellow-50">
                  PUT
                </Badge>
                <code>/api/db/productos/[id]</code>
                <span className="text-sm text-muted-foreground">- Actualizar producto</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-red-50">
                  DELETE
                </Badge>
                <code>/api/db/productos/[id]</code>
                <span className="text-sm text-muted-foreground">- Eliminar producto</span>
              </div>
            </div>
          </div>

          {/* Colecciones API */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Colecciones</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50">
                  GET
                </Badge>
                <code>/api/db/colecciones</code>
                <span className="text-sm text-muted-foreground">- Obtener todas las colecciones</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50">
                  POST
                </Badge>
                <code>/api/db/colecciones</code>
                <span className="text-sm text-muted-foreground">- Crear nueva colección</span>
              </div>
            </div>
          </div>

          {/* Sincronización API */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Sincronización</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50">
                  POST
                </Badge>
                <code>/api/sync/products</code>
                <span className="text-sm text-muted-foreground">- Sincronizar productos</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50">
                  POST
                </Badge>
                <code>/api/sync/collections</code>
                <span className="text-sm text-muted-foreground">- Sincronizar colecciones</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50">
                  POST
                </Badge>
                <code>/api/sync/customers</code>
                <span className="text-sm text-muted-foreground">- Sincronizar clientes</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50">
                  POST
                </Badge>
                <code>/api/sync/orders</code>
                <span className="text-sm text-muted-foreground">- Sincronizar pedidos</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50">
                  POST
                </Badge>
                <code>/api/sync/promotions</code>
                <span className="text-sm text-muted-foreground">- Sincronizar promociones</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Repositorios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-6 w-6" />
            Repositorios y Servicios
          </CardTitle>
          <CardDescription>Clases y servicios para interactuar con la base de datos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Repositorios</h4>
              <ul className="text-sm space-y-1">
                <li>
                  <code>lib/db/repositories/productos-repository.ts</code>
                </li>
                <li>
                  <code>lib/db/repositories/colecciones-repository.ts</code>
                </li>
                <li>
                  <code>lib/db/repositories/clientes-repository.ts</code>
                </li>
                <li>
                  <code>lib/db/repositories/pedidos-repository.ts</code>
                </li>
                <li>
                  <code>lib/db/repositories/promociones-repository.ts</code>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Servicios</h4>
              <ul className="text-sm space-y-1">
                <li>
                  <code>lib/services/sync-service.ts</code>
                </li>
                <li>
                  <code>lib/services/db-init-service.ts</code>
                </li>
                <li>
                  <code>lib/services/customer-sync-service.ts</code>
                </li>
                <li>
                  <code>lib/services/shopify-data-service.ts</code>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
