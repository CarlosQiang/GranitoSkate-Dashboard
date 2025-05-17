import { Pool } from "pg"
import { checkDatabaseConnection } from "./prisma"

// Configuración de la conexión a la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

// Función para ejecutar consultas SQL
export async function query(text: string, params?: any[]) {
  try {
    console.log("Ejecutando consulta SQL:", { text, params })
    const start = Date.now()
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log("Consulta SQL ejecutada en", duration, "ms. Filas:", res.rowCount)
    return res
  } catch (error) {
    console.error("Error al ejecutar consulta SQL:", error)
    // Intentar reconectar si la conexión se perdió
    if (error.code === "ECONNREFUSED" || error.code === "57P01" || error.code === "57P03") {
      console.log("Intentando reconectar a la base de datos...")
      await checkDatabaseConnection()
    }
    throw error
  }
}

// Función para verificar la conexión a la base de datos
export async function checkConnection() {
  try {
    const result = await query("SELECT NOW()")
    return { connected: true, result: result.rows[0] }
  } catch (error) {
    console.error("Error al verificar la conexión a la base de datos:", error)
    return { connected: false, error: error.message }
  }
}

// Función para inicializar las tablas necesarias
export async function initTables() {
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

    // Verificar si la tabla variantes_producto existe
    const variantesExist = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'variantes_producto'
      );
    `)

    // Si la tabla no existe, crearla
    if (!variantesExist.rows[0].exists) {
      console.log("Creando tabla variantes_producto...")
      await query(`
        CREATE TABLE IF NOT EXISTS variantes_producto (
          id SERIAL PRIMARY KEY,
          shopify_id VARCHAR(255),
          producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
          titulo VARCHAR(255),
          precio DECIMAL(10, 2),
          precio_comparacion DECIMAL(10, 2),
          sku VARCHAR(100),
          codigo_barras VARCHAR(100),
          inventario_disponible INTEGER,
          politica_inventario VARCHAR(50),
          requiere_envio BOOLEAN DEFAULT true,
          peso DECIMAL(10, 2),
          unidad_peso VARCHAR(10),
          opcion1_nombre VARCHAR(100),
          opcion1_valor VARCHAR(100),
          opcion2_nombre VARCHAR(100),
          opcion2_valor VARCHAR(100),
          opcion3_nombre VARCHAR(100),
          opcion3_valor VARCHAR(100),
          posicion INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_variantes_shopify_id ON variantes_producto(shopify_id);
        CREATE INDEX IF NOT EXISTS idx_variantes_producto_id ON variantes_producto(producto_id);
      `)
    }

    // Verificar si la tabla imagenes_producto existe
    const imagenesExist = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'imagenes_producto'
      );
    `)

    // Si la tabla no existe, crearla
    if (!imagenesExist.rows[0].exists) {
      console.log("Creando tabla imagenes_producto...")
      await query(`
        CREATE TABLE IF NOT EXISTS imagenes_producto (
          id SERIAL PRIMARY KEY,
          shopify_id VARCHAR(255),
          producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
          variante_id INTEGER REFERENCES variantes_producto(id) ON DELETE CASCADE,
          url TEXT NOT NULL,
          texto_alternativo VARCHAR(255),
          posicion INTEGER,
          es_destacada BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_imagenes_shopify_id ON imagenes_producto(shopify_id);
        CREATE INDEX IF NOT EXISTS idx_imagenes_producto_id ON imagenes_producto(producto_id);
        CREATE INDEX IF NOT EXISTS idx_imagenes_variante_id ON imagenes_producto(variante_id);
      `)
    }

    // Verificar si la tabla registro_sincronizacion existe
    const registroExist = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'registro_sincronizacion'
      );
    `)

    // Si la tabla no existe, crearla
    if (!registroExist.rows[0].exists) {
      console.log("Creando tabla registro_sincronizacion...")
      await query(`
        CREATE TABLE IF NOT EXISTS registro_sincronizacion (
          id SERIAL PRIMARY KEY,
          tipo_entidad VARCHAR(50) NOT NULL,
          entidad_id VARCHAR(255),
          accion VARCHAR(50) NOT NULL,
          resultado VARCHAR(50) NOT NULL,
          mensaje TEXT,
          detalles JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_registro_tipo_entidad ON registro_sincronizacion(tipo_entidad);
        CREATE INDEX IF NOT EXISTS idx_registro_entidad_id ON registro_sincronizacion(entidad_id);
        CREATE INDEX IF NOT EXISTS idx_registro_resultado ON registro_sincronizacion(resultado);
      `)
    }

    return { success: true, message: "Tablas inicializadas correctamente" }
  } catch (error) {
    console.error("Error al inicializar tablas:", error)
    return { success: false, error: error.message }
  }
}

export default pool
