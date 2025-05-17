import { NextResponse } from "next/server"
import { shopifyFetch } from "@/lib/shopify"
import { Pool } from "pg"

// Crear una conexión directa a la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

// Función para ejecutar consultas SQL
async function query(text: string, params?: any[]) {
  try {
    console.log("Ejecutando consulta SQL:", { text, params })
    const start = Date.now()
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log("Consulta SQL ejecutada en", duration, "ms. Filas:", res.rowCount)
    return res
  } catch (error) {
    console.error("Error al ejecutar consulta SQL:", error)
    throw error
  }
}

// Función para verificar la conexión a la base de datos
async function checkConnection() {
  try {
    const result = await query("SELECT NOW()")
    return { connected: true, result: result.rows[0] }
  } catch (error) {
    console.error("Error al verificar la conexión a la base de datos:", error)
    return { connected: false, error: error.message }
  }
}

// Función para inicializar las tablas necesarias
async function initTables() {
  try {
    // Verificar si la tabla productos existe
    const tableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'productos'
      );
    `)

    // Si la tabla no existe, crearla
    if (!tableExists.rows[0].exists) {
      console.log("Creando tabla productos...")
      await query(`
        CREATE TABLE IF NOT EXISTS productos (
          id SERIAL PRIMARY KEY,
          shopify_id VARCHAR(255),
          titulo VARCHAR(255) NOT NULL,
          descripcion TEXT,
          tipo_producto VARCHAR(100),
          proveedor VARCHAR(100),
          estado VARCHAR(50),
          publicado BOOLEAN DEFAULT false,
          destacado BOOLEAN DEFAULT false,
          etiquetas TEXT[],
          imagen_destacada_url TEXT,
          precio_base DECIMAL(10, 2),
          precio_comparacion DECIMAL(10, 2),
          sku VARCHAR(100),
          codigo_barras VARCHAR(100),
          inventario_disponible INTEGER,
          politica_inventario VARCHAR(50),
          requiere_envio BOOLEAN DEFAULT true,
          peso DECIMAL(10, 2),
          unidad_peso VARCHAR(10),
          url_handle VARCHAR(255),
          fecha_publicacion TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_productos_shopify_id ON productos(shopify_id);
      `)
    }

    return { success: true, message: "Tablas inicializadas correctamente" }
  } catch (error) {
    console.error("Error al inicializar tablas:", error)
    return { success: false, error: error.message }
  }
}

// Función para obtener productos de Shopify
async function obtenerProductosDeShopify(limit = 10) {
  try {
    // Consulta GraphQL para obtener productos
    const query = `
      query {
        products(first: ${limit}) {
          edges {
            node {
              id
              title
              description
              productType
              vendor
              status
              publishedAt
              handle
              tags
              images(first: 5) {
                edges {
                  node {
                    id
                    url
                    altText
                  }
                }
              }
              variants(first: 5) {
                edges {
                  node {
                    id
                    title
                    price
                    compareAtPrice
                    sku
                    barcode
                    inventoryQuantity
                    inventoryPolicy
                    weight
                    weightUnit
                  }
                }
              }
            }
          }
        }
      }
    `

    // Realizar la consulta a Shopify a través del proxy
    const response = await shopifyFetch({ query })

    // Verificar si hay errores en la respuesta
    if (response.errors) {
      const errorMessage = response.errors.map((e) => e.message).join(", ")
      throw new Error(`Error en la API de Shopify: ${errorMessage}`)
    }

    if (!response.data || !response.data.products) {
      throw new Error("No se pudieron obtener productos de Shopify: respuesta vacía o inválida")
    }

    return response.data.products.edges.map((edge: any) => edge.node)
  } catch (error) {
    console.error("Error al obtener productos de Shopify:", error)
    throw error
  }
}

// Función para guardar un producto en la base de datos
async function guardarProducto(producto: any) {
  try {
    // Extraer el ID de Shopify
    const shopifyId = producto.id.split("/").pop() || ""

    // Verificar si el producto ya existe
    const existeProducto = await query(`SELECT id FROM productos WHERE shopify_id = $1`, [shopifyId])

    if (existeProducto.rows.length > 0) {
      // Actualizar producto existente
      const result = await query(
        `UPDATE productos SET 
          titulo = $1,
          descripcion = $2,
          tipo_producto = $3,
          proveedor = $4,
          estado = $5,
          publicado = $6,
          imagen_destacada_url = $7,
          precio_base = $8,
          precio_comparacion = $9,
          sku = $10,
          codigo_barras = $11,
          inventario_disponible = $12,
          url_handle = $13,
          updated_at = NOW()
        WHERE shopify_id = $14
        RETURNING id`,
        [
          producto.title || "",
          producto.description || "",
          producto.productType || "",
          producto.vendor || "",
          (producto.status || "").toLowerCase(),
          producto.status === "ACTIVE",
          producto.images?.edges?.length > 0 ? producto.images.edges[0].node.url : "",
          producto.variants?.edges?.length > 0 ? Number.parseFloat(producto.variants.edges[0].node.price) : 0,
          producto.variants?.edges?.length > 0 && producto.variants.edges[0].node.compareAtPrice
            ? Number.parseFloat(producto.variants.edges[0].node.compareAtPrice)
            : null,
          producto.variants?.edges?.length > 0 ? producto.variants.edges[0].node.sku : "",
          producto.variants?.edges?.length > 0 ? producto.variants.edges[0].node.barcode : "",
          producto.variants?.edges?.length > 0 ? producto.variants.edges[0].node.inventoryQuantity || 0 : 0,
          producto.handle || "",
          shopifyId,
        ],
      )

      return { id: result.rows[0].id, accion: "actualizado" }
    } else {
      // Crear nuevo producto
      const result = await query(
        `INSERT INTO productos (
          shopify_id, titulo, descripcion, tipo_producto, proveedor, estado,
          publicado, imagen_destacada_url, precio_base, precio_comparacion,
          sku, codigo_barras, inventario_disponible, url_handle
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id`,
        [
          shopifyId,
          producto.title || "",
          producto.description || "",
          producto.productType || "",
          producto.vendor || "",
          (producto.status || "").toLowerCase(),
          producto.status === "ACTIVE",
          producto.images?.edges?.length > 0 ? producto.images.edges[0].node.url : "",
          producto.variants?.edges?.length > 0 ? Number.parseFloat(producto.variants.edges[0].node.price) : 0,
          producto.variants?.edges?.length > 0 && producto.variants.edges[0].node.compareAtPrice
            ? Number.parseFloat(producto.variants.edges[0].node.compareAtPrice)
            : null,
          producto.variants?.edges?.length > 0 ? producto.variants.edges[0].node.sku : "",
          producto.variants?.edges?.length > 0 ? producto.variants.edges[0].node.barcode : "",
          producto.variants?.edges?.length > 0 ? producto.variants.edges[0].node.inventoryQuantity || 0 : 0,
          producto.handle || "",
        ],
      )

      return { id: result.rows[0].id, accion: "creado" }
    }
  } catch (error) {
    console.error("Error al guardar producto:", error)
    throw error
  }
}

export async function GET(request: Request) {
  try {
    // Obtener parámetros de la solicitud
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "5", 10)

    console.log(`Iniciando sincronización de productos (límite: ${limit})...`)

    // Verificar la conexión a la base de datos
    const connectionStatus = await checkConnection()
    if (!connectionStatus.connected) {
      return NextResponse.json(
        {
          success: false,
          message: "No se pudo conectar a la base de datos",
          error: connectionStatus.error,
        },
        { status: 500 },
      )
    }

    console.log("Conexión a la base de datos establecida:", connectionStatus)

    // Inicializar las tablas si no existen
    const initResult = await initTables()
    if (!initResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Error al inicializar las tablas",
          error: initResult.error,
        },
        { status: 500 },
      )
    }

    console.log("Tablas inicializadas correctamente")

    // Obtener productos de Shopify
    const productos = await obtenerProductosDeShopify(limit)
    console.log(`Se obtuvieron ${productos.length} productos de Shopify`)

    const resultados = {
      total: productos.length,
      creados: 0,
      actualizados: 0,
      errores: 0,
      detalles: [] as any[],
    }

    // Guardar cada producto en la base de datos
    for (const producto of productos) {
      try {
        const resultado = await guardarProducto(producto)

        if (resultado.accion === "creado") {
          resultados.creados++
        } else {
          resultados.actualizados++
        }

        resultados.detalles.push({
          id: producto.id.split("/").pop() || "",
          titulo: producto.title || "",
          resultado: "exito",
          accion: resultado.accion,
        })

        console.log(`Producto ${resultado.accion}: ${producto.title}`)
      } catch (error) {
        console.error("Error al sincronizar producto:", error)
        resultados.errores++
        resultados.detalles.push({
          id: producto.id ? producto.id.split("/").pop() : "",
          titulo: producto.title || "Desconocido",
          resultado: "error",
          mensaje: error.message,
        })
      }
    }

    console.log(
      `Sincronización completada: ${resultados.creados} creados, ${resultados.actualizados} actualizados, ${resultados.errores} errores`,
    )

    return NextResponse.json({
      success: true,
      message: `Sincronización completada: ${resultados.creados} creados, ${resultados.actualizados} actualizados, ${resultados.errores} errores`,
      resultados,
    })
  } catch (error) {
    console.error("Error en la sincronización de productos:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  return GET(request)
}
