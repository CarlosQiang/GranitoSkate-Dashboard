import { Pool } from "pg"
import { Logger } from "next-axiom"

const logger = new Logger({
  source: "vercel-postgres",
})

// Configuración del pool de conexiones
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  max: 10, // máximo de conexiones en el pool
  idleTimeoutMillis: 30000, // tiempo máximo que una conexión puede estar inactiva antes de ser cerrada
  connectionTimeoutMillis: 5000, // tiempo máximo para establecer una conexión
  ssl: {
    rejectUnauthorized: false, // necesario para conexiones SSL a Neon
  },
})

// Evento cuando se crea una conexión
pool.on("connect", () => {
  logger.debug("Nueva conexión establecida con PostgreSQL")
})

// Evento cuando hay un error en el pool
pool.on("error", (err) => {
  logger.error("Error en el pool de PostgreSQL", { error: err.message })
  console.error("Error en el pool de PostgreSQL:", err)
})

// Función para ejecutar consultas SQL
async function query(text: string, params?: any[]) {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    logger.debug("Consulta SQL ejecutada", { duration, rows: res.rowCount })
    return res
  } catch (error) {
    logger.error("Error al ejecutar consulta SQL", {
      error: error instanceof Error ? error.message : "Error desconocido",
      query: text,
      params,
    })
    throw error
  }
}

// Función para obtener todos los registros de una tabla
async function findAll(table: string) {
  try {
    const result = await query(`SELECT * FROM ${table} ORDER BY id DESC`)
    return result.rows
  } catch (error) {
    logger.error(`Error al obtener todos los registros de ${table}`, {
      error: error instanceof Error ? error.message : "Error desconocido",
    })
    throw error
  }
}

// Función para obtener un registro por ID
async function findById(table: string, id: number) {
  try {
    const result = await query(`SELECT * FROM ${table} WHERE id = $1`, [id])
    return result.rows[0]
  } catch (error) {
    logger.error(`Error al obtener registro con ID ${id} de ${table}`, {
      error: error instanceof Error ? error.message : "Error desconocido",
    })
    throw error
  }
}

// Función para obtener un registro por campo
async function findByField(table: string, field: string, value: any) {
  try {
    const result = await query(`SELECT * FROM ${table} WHERE ${field} = $1`, [value])
    return result.rows[0]
  } catch (error) {
    logger.error(`Error al obtener registro con ${field}=${value} de ${table}`, {
      error: error instanceof Error ? error.message : "Error desconocido",
    })
    throw error
  }
}

// Función para obtener un registro por Shopify ID
async function findByShopifyId(table: string, shopifyId: string) {
  return findByField(table, "shopify_id", shopifyId)
}

// Función para insertar un registro
async function insert(table: string, data: any) {
  try {
    // Construir la consulta dinámicamente
    const fields = Object.keys(data)
    const values = Object.values(data)
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(", ")

    const result = await query(
      `INSERT INTO ${table} (${fields.join(", ")}) VALUES (${placeholders}) RETURNING *`,
      values,
    )

    return result.rows[0]
  } catch (error) {
    logger.error(`Error al insertar registro en ${table}`, {
      error: error instanceof Error ? error.message : "Error desconocido",
      data,
    })
    throw error
  }
}

// Función para actualizar un registro
async function update(table: string, id: number, data: any) {
  try {
    // Construir la consulta dinámicamente
    const fields = Object.keys(data)
    const values = Object.values(data)
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(", ")

    const result = await query(`UPDATE ${table} SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`, [
      ...values,
      id,
    ])

    return result.rows[0]
  } catch (error) {
    logger.error(`Error al actualizar registro con ID ${id} en ${table}`, {
      error: error instanceof Error ? error.message : "Error desconocido",
      data,
    })
    throw error
  }
}

// Función para eliminar un registro
async function remove(table: string, id: number) {
  try {
    const result = await query(`DELETE FROM ${table} WHERE id = $1 RETURNING *`, [id])
    return result.rows[0]
  } catch (error) {
    logger.error(`Error al eliminar registro con ID ${id} de ${table}`, {
      error: error instanceof Error ? error.message : "Error desconocido",
    })
    throw error
  }
}

// Función para registrar eventos de sincronización
async function logSyncEvent(
  tipo_entidad: string,
  entidad_id: string,
  accion: string,
  resultado: string,
  mensaje: string,
  detalles?: any,
) {
  try {
    const data = {
      tipo_entidad,
      entidad_id,
      accion,
      resultado,
      mensaje,
      detalles: detalles ? JSON.stringify(detalles) : null,
      fecha: new Date(),
    }

    return await insert("registro_sincronizacion", data)
  } catch (error) {
    logger.error("Error al registrar evento de sincronización", {
      error: error instanceof Error ? error.message : "Error desconocido",
      tipo_entidad,
      entidad_id,
      accion,
      resultado,
      mensaje,
    })
    console.error("Error al registrar evento de sincronización:", error)
    // No lanzamos el error para evitar que falle la operación principal
  }
}

// Función para probar la conexión a la base de datos
async function testConnection() {
  try {
    const result = await query("SELECT NOW()")
    return {
      success: true,
      timestamp: result.rows[0].now,
      message: "Conexión a la base de datos establecida correctamente",
    }
  } catch (error) {
    logger.error("Error al probar la conexión a la base de datos", {
      error: error instanceof Error ? error.message : "Error desconocido",
    })
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
      message: "Error al conectar con la base de datos",
    }
  }
}

// Función para inicializar la base de datos
async function initDatabase() {
  try {
    // Verificar si la tabla de administradores existe
    const tableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'administradores'
      )
    `)

    if (!tableExists.rows[0].exists) {
      logger.info("Creando tablas en la base de datos...")

      // Crear tabla de administradores
      await query(`
        CREATE TABLE IF NOT EXISTS administradores (
          id SERIAL PRIMARY KEY,
          nombre VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          rol VARCHAR(50) DEFAULT 'admin',
          activo BOOLEAN DEFAULT true,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Crear tabla de productos
      await query(`
        CREATE TABLE IF NOT EXISTS productos (
          id SERIAL PRIMARY KEY,
          shopify_id VARCHAR(255) UNIQUE,
          titulo VARCHAR(255) NOT NULL,
          descripcion TEXT,
          tipo_producto VARCHAR(255),
          proveedor VARCHAR(255),
          estado VARCHAR(50) DEFAULT 'active',
          imagen_url TEXT,
          handle VARCHAR(255),
          precio DECIMAL(10, 2),
          precio_comparacion DECIMAL(10, 2),
          inventario INTEGER DEFAULT 0,
          sku VARCHAR(255),
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          metadatos JSONB
        )
      `)

      // Crear tabla de colecciones
      await query(`
        CREATE TABLE IF NOT EXISTS colecciones (
          id SERIAL PRIMARY KEY,
          shopify_id VARCHAR(255) UNIQUE,
          titulo VARCHAR(255) NOT NULL,
          descripcion TEXT,
          imagen_url TEXT,
          handle VARCHAR(255),
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          metadatos JSONB
        )
      `)

      // Crear tabla de relación productos-colecciones
      await query(`
        CREATE TABLE IF NOT EXISTS productos_colecciones (
          id SERIAL PRIMARY KEY,
          producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
          coleccion_id INTEGER REFERENCES colecciones(id) ON DELETE CASCADE,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(producto_id, coleccion_id)
        )
      `)

      // Crear tabla de clientes
      await query(`
        CREATE TABLE IF NOT EXISTS clientes (
          id SERIAL PRIMARY KEY,
          shopify_id VARCHAR(255) UNIQUE,
          nombre VARCHAR(255),
          apellido VARCHAR(255),
          email VARCHAR(255),
          telefono VARCHAR(50),
          acepta_marketing BOOLEAN DEFAULT false,
          notas TEXT,
          etiquetas TEXT[],
          direccion_predeterminada JSONB,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          metadatos JSONB
        )
      `)

      // Crear tabla de pedidos
      await query(`
        CREATE TABLE IF NOT EXISTS pedidos (
          id SERIAL PRIMARY KEY,
          shopify_id VARCHAR(255) UNIQUE,
          numero VARCHAR(50),
          cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
          email VARCHAR(255),
          telefono VARCHAR(50),
          estado_financiero VARCHAR(50),
          estado_cumplimiento VARCHAR(50),
          precio_total DECIMAL(10, 2),
          subtotal DECIMAL(10, 2),
          impuestos DECIMAL(10, 2),
          envio DECIMAL(10, 2),
          direccion_envio JSONB,
          items JSONB,
          fecha_procesado TIMESTAMP,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          metadatos JSONB
        )
      `)

      // Crear tabla de registro de sincronización
      await query(`
        CREATE TABLE IF NOT EXISTS registro_sincronizacion (
          id SERIAL PRIMARY KEY,
          tipo_entidad VARCHAR(50) NOT NULL,
          entidad_id VARCHAR(255),
          accion VARCHAR(50) NOT NULL,
          resultado VARCHAR(50) NOT NULL,
          mensaje TEXT,
          detalles JSONB,
          fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Crear tabla de configuración de tema
      await query(`
        CREATE TABLE IF NOT EXISTS theme_configs (
          id SERIAL PRIMARY KEY,
          nombre VARCHAR(255) NOT NULL,
          color_primario VARCHAR(50) DEFAULT '#3b82f6',
          color_secundario VARCHAR(50) DEFAULT '#10b981',
          color_acento VARCHAR(50) DEFAULT '#f59e0b',
          color_fondo VARCHAR(50) DEFAULT '#ffffff',
          color_texto VARCHAR(50) DEFAULT '#111827',
          fuente_principal VARCHAR(255) DEFAULT 'Inter, sans-serif',
          fuente_titulos VARCHAR(255) DEFAULT 'Inter, sans-serif',
          radio_bordes VARCHAR(50) DEFAULT '0.5rem',
          activo BOOLEAN DEFAULT true,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Crear tabla de assets de tema
      await query(`
        CREATE TABLE IF NOT EXISTS theme_assets (
          id SERIAL PRIMARY KEY,
          nombre VARCHAR(255) NOT NULL,
          tipo VARCHAR(50) NOT NULL,
          url TEXT NOT NULL,
          theme_id INTEGER REFERENCES theme_configs(id) ON DELETE CASCADE,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Crear tabla de promociones
      await query(`
        CREATE TABLE IF NOT EXISTS promociones (
          id SERIAL PRIMARY KEY,
          shopify_id VARCHAR(255),
          codigo VARCHAR(255) NOT NULL,
          tipo VARCHAR(50) NOT NULL,
          valor DECIMAL(10, 2) NOT NULL,
          objetivo VARCHAR(50),
          condiciones JSONB,
          fecha_inicio TIMESTAMP,
          fecha_fin TIMESTAMP,
          activo BOOLEAN DEFAULT true,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          metadatos JSONB
        )
      `)

      logger.info("Tablas creadas correctamente")
    }

    // Verificar si existe el administrador por defecto
    const adminExists = await query(`
      SELECT EXISTS (
        SELECT FROM administradores 
        WHERE email = 'admin@gmail.com'
      )
    `)

    if (!adminExists.rows[0].exists) {
      logger.info("Creando administrador por defecto...")

      // Crear administrador por defecto
      // En un entorno real, deberías hashear la contraseña
      await query(`
        INSERT INTO administradores (nombre, email, password, rol)
        VALUES ('admin', 'admin@gmail.com', 'GranitoSkate', 'superadmin')
      `)

      logger.info("Administrador por defecto creado correctamente")
    }

    return {
      success: true,
      message: "Base de datos inicializada correctamente",
    }
  } catch (error) {
    logger.error("Error al inicializar la base de datos", {
      error: error instanceof Error ? error.message : "Error desconocido",
    })
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
      message: "Error al inicializar la base de datos",
    }
  }
}

export default {
  query,
  findAll,
  findById,
  findByField,
  findByShopifyId,
  insert,
  update,
  remove,
  logSyncEvent,
  testConnection,
  initDatabase,
}
