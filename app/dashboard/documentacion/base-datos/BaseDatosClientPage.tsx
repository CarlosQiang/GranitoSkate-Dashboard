"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Database, Code, Download } from "lucide-react"

export default function BaseDatosClientPage() {
  const handleDownloadSchema = () => {
    const schemaSQL = `-- Esquema de Base de Datos GranitoSkate
-- Generado automáticamente

CREATE TABLE productos (
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
);

CREATE TABLE colecciones (
  id SERIAL PRIMARY KEY,
  shopify_id VARCHAR(255) UNIQUE,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  imagen_url TEXT,
  estado VARCHAR(50) DEFAULT 'ACTIVE',
  tipo VARCHAR(50) DEFAULT 'MANUAL',
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP DEFAULT NOW()
);

CREATE TABLE clientes (
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
);

CREATE TABLE pedidos (
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
);

CREATE TABLE promociones (
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
);

CREATE TABLE administradores (
  id SERIAL PRIMARY KEY,
  usuario VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(50) DEFAULT 'ADMIN',
  activo BOOLEAN DEFAULT true,
  ultimo_acceso TIMESTAMP,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP DEFAULT NOW()
);`

    const blob = new Blob([schemaSQL], { type: "text/sql" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "granitoskate-schema.sql"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

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
            <Database className="h-6 w-6" />
            Esquema de Base de Datos
          </CardTitle>
          <CardDescription>Descarga el esquema SQL completo de la base de datos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1 mb-2 sm:mb-0">
              <h4 className="font-semibold">granitoskate-schema.sql</h4>
              <p className="text-sm text-muted-foreground">
                Esquema completo con todas las tablas: productos, colecciones, clientes, pedidos, promociones y
                administradores
              </p>
            </div>
            <Button onClick={handleDownloadSchema} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Descargar SQL
            </Button>
          </div>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-semibold text-lg">6</div>
              <div className="text-sm text-muted-foreground">Tablas</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-semibold text-lg">PostgreSQL</div>
              <div className="text-sm text-muted-foreground">Base de Datos</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-semibold text-lg">Neon</div>
              <div className="text-sm text-muted-foreground">Proveedor</div>
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
          <CardDescription>Todos los endpoints disponibles para desarrolladores externos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Productos API */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Productos</h4>
            <div className="space-y-3">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-green-50">
                    GET
                  </Badge>
                  <code className="text-sm">/api/db/productos</code>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Obtener todos los productos</p>
                <div className="text-xs">
                  <strong>Respuesta:</strong> Array de productos con id, titulo, precio, inventario, etc.
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-green-50">
                    GET
                  </Badge>
                  <code className="text-sm">/api/db/productos/[id]</code>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Obtener producto específico por ID</p>
                <div className="text-xs">
                  <strong>Parámetros:</strong> id (integer)
                  <br />
                  <strong>Respuesta:</strong> Objeto producto completo
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-blue-50">
                    POST
                  </Badge>
                  <code className="text-sm">/api/db/productos</code>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Crear nuevo producto</p>
                <div className="text-xs">
                  <strong>Body:</strong> {`{titulo, descripcion, precio, inventario, sku, etc.}`}
                  <br />
                  <strong>Respuesta:</strong> Producto creado con ID asignado
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-yellow-50">
                    PUT
                  </Badge>
                  <code className="text-sm">/api/db/productos/[id]</code>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Actualizar producto existente</p>
                <div className="text-xs">
                  <strong>Parámetros:</strong> id (integer)
                  <br />
                  <strong>Body:</strong> Campos a actualizar
                  <br />
                  <strong>Respuesta:</strong> Producto actualizado
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-red-50">
                    DELETE
                  </Badge>
                  <code className="text-sm">/api/db/productos/[id]</code>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Eliminar producto</p>
                <div className="text-xs">
                  <strong>Parámetros:</strong> id (integer)
                  <br />
                  <strong>Respuesta:</strong> Confirmación de eliminación
                </div>
              </div>
            </div>
          </div>

          {/* Colecciones API */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Colecciones</h4>
            <div className="space-y-3">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-green-50">
                    GET
                  </Badge>
                  <code className="text-sm">/api/db/colecciones</code>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Obtener todas las colecciones</p>
                <div className="text-xs">
                  <strong>Respuesta:</strong> Array de colecciones con id, titulo, descripcion, etc.
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-blue-50">
                    POST
                  </Badge>
                  <code className="text-sm">/api/db/colecciones</code>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Crear nueva colección</p>
                <div className="text-xs">
                  <strong>Body:</strong> {`{titulo, descripcion, imagen_url, tipo}`}
                  <br />
                  <strong>Respuesta:</strong> Colección creada con ID asignado
                </div>
              </div>
            </div>
          </div>

          {/* Clientes API */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Clientes</h4>
            <div className="space-y-3">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-green-50">
                    GET
                  </Badge>
                  <code className="text-sm">/api/db/clientes</code>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Obtener todos los clientes</p>
                <div className="text-xs">
                  <strong>Respuesta:</strong> Array de clientes con id, email, nombre, total_gastado, etc.
                </div>
              </div>
            </div>
          </div>

          {/* Pedidos API */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Pedidos</h4>
            <div className="space-y-3">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-green-50">
                    GET
                  </Badge>
                  <code className="text-sm">/api/db/pedidos</code>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Obtener todos los pedidos</p>
                <div className="text-xs">
                  <strong>Respuesta:</strong> Array de pedidos con id, numero_pedido, total, estado, etc.
                </div>
              </div>
            </div>
          </div>

          {/* Promociones API */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Promociones</h4>
            <div className="space-y-3">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-green-50">
                    GET
                  </Badge>
                  <code className="text-sm">/api/db/promociones</code>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Obtener todas las promociones</p>
                <div className="text-xs">
                  <strong>Respuesta:</strong> Array de promociones con id, titulo, codigo, valor, estado, etc.
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-blue-50">
                    POST
                  </Badge>
                  <code className="text-sm">/api/db/promociones</code>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Crear nueva promoción</p>
                <div className="text-xs">
                  <strong>Body:</strong> {`{titulo, codigo, tipo, valor, fecha_inicio, fecha_fin}`}
                  <br />
                  <strong>Respuesta:</strong> Promoción creada con ID asignado
                </div>
              </div>
            </div>
          </div>

          {/* Sincronización API */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Sincronización</h4>
            <div className="space-y-3">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-blue-50">
                    POST
                  </Badge>
                  <code className="text-sm">/api/sync/products</code>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Sincronizar productos desde Shopify</p>
                <div className="text-xs">
                  <strong>Respuesta:</strong> {`{success: boolean, message: string, totalEnBD: number}`}
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-blue-50">
                    POST
                  </Badge>
                  <code className="text-sm">/api/sync/collections</code>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Sincronizar colecciones desde Shopify</p>
                <div className="text-xs">
                  <strong>Respuesta:</strong> {`{success: boolean, message: string, totalEnBD: number}`}
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-blue-50">
                    POST
                  </Badge>
                  <code className="text-sm">/api/sync/customers</code>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Sincronizar clientes desde Shopify</p>
                <div className="text-xs">
                  <strong>Respuesta:</strong> {`{success: boolean, message: string, totalEnBD: number}`}
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-blue-50">
                    POST
                  </Badge>
                  <code className="text-sm">/api/sync/orders</code>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Sincronizar pedidos desde Shopify</p>
                <div className="text-xs">
                  <strong>Respuesta:</strong> {`{success: boolean, message: string, totalEnBD: number}`}
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-blue-50">
                    POST
                  </Badge>
                  <code className="text-sm">/api/sync/promotions</code>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Sincronizar promociones desde Shopify</p>
                <div className="text-xs">
                  <strong>Respuesta:</strong> {`{success: boolean, message: string, totalEnBD: number}`}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
