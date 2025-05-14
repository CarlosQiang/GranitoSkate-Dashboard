import { sql } from "@vercel/postgres"
import { logSyncEvent } from "./repositories/registro-repository"

export async function initializeDatabase() {
  try {
    console.log("Iniciando inicialización de la base de datos...")

    // Crear tabla de productos
    await sql`
      CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        shopify_id TEXT UNIQUE,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        tipo_producto TEXT,
        proveedor TEXT,
        estado TEXT,
        publicado BOOLEAN DEFAULT false,
        destacado BOOLEAN DEFAULT false,
        etiquetas JSONB,
        imagen_destacada_url TEXT,
        precio_base DECIMAL(10, 2),
        precio_comparacion DECIMAL(10, 2),
        sku TEXT,
        codigo_barras TEXT,
        inventario_disponible INTEGER,
        politica_inventario TEXT,
        requiere_envio BOOLEAN DEFAULT true,
        peso DECIMAL(10, 2),
        unidad_peso TEXT DEFAULT 'kg',
        seo_titulo TEXT,
        seo_descripcion TEXT,
        url_handle TEXT,
        fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        fecha_publicacion TIMESTAMP WITH TIME ZONE,
        ultima_sincronizacion TIMESTAMP WITH TIME ZONE
      )
    `

    // Crear tabla de colecciones
    await sql`
      CREATE TABLE IF NOT EXISTS colecciones (
        id SERIAL PRIMARY KEY,
        shopify_id TEXT UNIQUE,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        url_handle TEXT,
        imagen_url TEXT,
        es_automatica BOOLEAN DEFAULT false,
        condiciones_automaticas JSONB,
        publicada BOOLEAN DEFAULT true,
        seo_titulo TEXT,
        seo_descripcion TEXT,
        fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        fecha_publicacion TIMESTAMP WITH TIME ZONE,
        ultima_sincronizacion TIMESTAMP WITH TIME ZONE
      )
    `

    // Crear tabla de relación productos-colecciones
    await sql`
      CREATE TABLE IF NOT EXISTS productos_colecciones (
        id SERIAL PRIMARY KEY,
        producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
        coleccion_id INTEGER REFERENCES colecciones(id) ON DELETE CASCADE,
        fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(producto_id, coleccion_id)
      )
    `

    // Crear tabla de clientes
    await sql`
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        shopify_id TEXT UNIQUE,
        email TEXT,
        nombre TEXT,
        apellidos TEXT,
        telefono TEXT,
        acepta_marketing BOOLEAN DEFAULT false,
        total_pedidos INTEGER DEFAULT 0,
        total_gastado DECIMAL(10, 2) DEFAULT 0,
        etiquetas JSONB,
        fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ultima_sincronizacion TIMESTAMP WITH TIME ZONE
      )
    `

    // Crear tabla de pedidos
    await sql`
      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        shopify_id TEXT UNIQUE,
        numero_pedido TEXT,
        cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
        email_cliente TEXT,
        estado_financiero TEXT,
        estado_cumplimiento TEXT,
        moneda TEXT DEFAULT 'EUR',
        subtotal DECIMAL(10, 2) DEFAULT 0,
        impuestos DECIMAL(10, 2) DEFAULT 0,
        envio DECIMAL(10, 2) DEFAULT 0,
        descuentos DECIMAL(10, 2) DEFAULT 0,
        total DECIMAL(10, 2) DEFAULT 0,
        etiquetas JSONB,
        fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ultima_sincronizacion TIMESTAMP WITH TIME ZONE
      )
    `

    // Crear tabla de promociones
    await sql`
      CREATE TABLE IF NOT EXISTS promociones (
        id SERIAL PRIMARY KEY,
        shopify_id TEXT UNIQUE,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        tipo TEXT NOT NULL,
        valor DECIMAL(10, 2),
        codigo TEXT,
        objetivo TEXT,
        objetivo_id TEXT,
        condiciones JSONB,
        fecha_inicio TIMESTAMP WITH TIME ZONE,
        fecha_fin TIMESTAMP WITH TIME ZONE,
        activa BOOLEAN DEFAULT false,
        limite_uso INTEGER,
        contador_uso INTEGER DEFAULT 0,
        es_automatica BOOLEAN DEFAULT false,
        fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ultima_sincronizacion TIMESTAMP WITH TIME ZONE
      )
    `

    // Crear tabla de registro de sincronización
    await sql`
      CREATE TABLE IF NOT EXISTS registro_sincronizacion (
        id SERIAL PRIMARY KEY,
        tipo_entidad TEXT NOT NULL,
        entidad_id TEXT,
        accion TEXT NOT NULL,
        resultado TEXT NOT NULL,
        mensaje TEXT,
        detalles JSONB,
        fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    console.log("Base de datos inicializada correctamente")

    // Registrar evento
    await logSyncEvent({
      tipo_entidad: "DATABASE",
      accion: "INITIALIZE",
      resultado: "SUCCESS",
      mensaje: "Base de datos inicializada correctamente",
    })

    return { success: true, message: "Base de datos inicializada correctamente" }
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error)

    // Intentar registrar el error
    try {
      await logSyncEvent({
        tipo_entidad: "DATABASE",
        accion: "INITIALIZE",
        resultado: "ERROR",
        mensaje: `Error al inicializar la base de datos: ${(error as Error).message}`,
      })
    } catch (logError) {
      console.error("Error al registrar el error de inicialización:", logError)
    }

    throw error
  }
}
