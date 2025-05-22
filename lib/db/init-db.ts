import { query } from "@/lib/db"
import { createThemeTablesIfNotExist } from "@/lib/db/repositories/theme-repository"
import { Logger } from "next-axiom"

const logger = new Logger({
  source: "init-db",
})

// Función para inicializar la base de datos
export async function initializeDatabase(): Promise<boolean> {
  try {
    // Crear tablas principales si no existen
    await createMainTables()

    // Crear tablas de tema si no existen
    await createThemeTablesIfNotExist()

    logger.info("Base de datos inicializada correctamente")
    return true
  } catch (error) {
    logger.error("Error al inicializar la base de datos:", error)
    return false
  }
}

// Función para crear las tablas principales
async function createMainTables(): Promise<void> {
  try {
    // Tabla de administradores
    await query(`
      CREATE TABLE IF NOT EXISTS administradores (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol VARCHAR(50) DEFAULT 'admin',
        activo BOOLEAN DEFAULT TRUE,
        ultimo_acceso TIMESTAMP WITH TIME ZONE,
        fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Tabla de productos
    await query(`
      CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        shopify_id VARCHAR(255) UNIQUE NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        tipo_producto VARCHAR(255),
        proveedor VARCHAR(255),
        estado VARCHAR(50) DEFAULT 'active',
        publicado BOOLEAN DEFAULT TRUE,
        imagen_url TEXT,
        handle VARCHAR(255),
        precio DECIMAL(10, 2) DEFAULT 0,
        precio_comparacion DECIMAL(10, 2),
        inventario INTEGER DEFAULT 0,
        sku VARCHAR(255),
        codigo_barras VARCHAR(255),
        metadatos JSONB,
        fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Tabla de colecciones
    await query(`
      CREATE TABLE IF NOT EXISTS colecciones (
        id SERIAL PRIMARY KEY,
        shopify_id VARCHAR(255) UNIQUE NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        imagen_url TEXT,
        handle VARCHAR(255),
        cantidad_productos INTEGER DEFAULT 0,
        metadatos JSONB,
        fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Tabla de relación entre productos y colecciones
    await query(`
      CREATE TABLE IF NOT EXISTS productos_colecciones (
        id SERIAL PRIMARY KEY,
        producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
        coleccion_id INTEGER REFERENCES colecciones(id) ON DELETE CASCADE,
        posicion INTEGER DEFAULT 0,
        fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(producto_id, coleccion_id)
      )
    `)

    // Tabla de clientes
    await query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        shopify_id VARCHAR(255) UNIQUE NOT NULL,
        nombre VARCHAR(255),
        apellido VARCHAR(255),
        email VARCHAR(255),
        telefono VARCHAR(255),
        acepta_marketing BOOLEAN DEFAULT FALSE,
        cantidad_pedidos INTEGER DEFAULT 0,
        total_gastado DECIMAL(10, 2) DEFAULT 0,
        metadatos JSONB,
        fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Tabla de pedidos
    await query(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        shopify_id VARCHAR(255) UNIQUE NOT NULL,
        numero VARCHAR(255),
        cliente_id INTEGER REFERENCES clientes(id),
        email VARCHAR(255),
        total DECIMAL(10, 2) DEFAULT 0,
        subtotal DECIMAL(10, 2) DEFAULT 0,
        impuestos DECIMAL(10, 2) DEFAULT 0,
        estado_financiero VARCHAR(50),
        estado_cumplimiento VARCHAR(50),
        fecha_procesado TIMESTAMP WITH TIME ZONE,
        metadatos JSONB,
        fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Tabla de promociones
    await query(`
      CREATE TABLE IF NOT EXISTS promociones (
        id SERIAL PRIMARY KEY,
        shopify_id VARCHAR(255) UNIQUE,
        codigo VARCHAR(255) UNIQUE NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        valor DECIMAL(10, 2) NOT NULL,
        minimo_compra DECIMAL(10, 2),
        fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
        fecha_fin TIMESTAMP WITH TIME ZONE,
        limite_usos INTEGER,
        usos_actuales INTEGER DEFAULT 0,
        activo BOOLEAN DEFAULT TRUE,
        metadatos JSONB,
        fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Tabla de registro de sincronización
    await query(`
      CREATE TABLE IF NOT EXISTS registro_sincronizacion (
        id SERIAL PRIMARY KEY,
        tipo VARCHAR(50) NOT NULL,
        cantidad INTEGER DEFAULT 0,
        detalles JSONB,
        fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)

    logger.info("Tablas principales creadas correctamente")
  } catch (error) {
    logger.error("Error al crear las tablas principales:", error)
    throw error
  }
}
