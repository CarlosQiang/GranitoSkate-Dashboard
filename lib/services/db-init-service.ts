import { query, checkConnection } from "@/lib/db"
import { hashPassword } from "@/lib/auth-service"
import { logSyncEvent } from "@/lib/db/repositories/registro-repository"

export const dbInitService = {
  // Verificar la conexión a la base de datos
  async checkConnection() {
    try {
      const result = await checkConnection()
      return result.connected
    } catch (error) {
      console.error("Error al verificar la conexión a la base de datos:", error)
      return false
    }
  },

  // Verificar si la base de datos ya está inicializada
  async isInitialized() {
    try {
      // Verificar si existe la tabla de administradores
      const result = await query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'administradores'
        )
      `)

      return result.rows[0].exists
    } catch (error) {
      console.error("Error al verificar si la base de datos está inicializada:", error)
      return false
    }
  },

  // Inicializar la base de datos
  async initialize() {
    try {
      // Crear tablas
      await this.createTables()

      // Registrar evento
      await logSyncEvent({
        tipo_entidad: "SYSTEM",
        accion: "INIT",
        resultado: "SUCCESS",
        mensaje: "Base de datos inicializada correctamente",
      })

      return true
    } catch (error) {
      console.error("Error al inicializar la base de datos:", error)

      // Registrar error
      try {
        await logSyncEvent({
          tipo_entidad: "SYSTEM",
          accion: "INIT",
          resultado: "ERROR",
          mensaje: `Error al inicializar la base de datos: ${(error as Error).message}`,
        })
      } catch (logError) {
        console.error("Error al registrar el error de inicialización:", logError)
      }

      return false
    }
  },

  // Crear las tablas de la base de datos
  async createTables() {
    // Crear tabla de administradores si no existe
    await query(`
      CREATE TABLE IF NOT EXISTS administradores (
        id SERIAL PRIMARY KEY,
        nombre_usuario VARCHAR(255) NOT NULL UNIQUE,
        correo_electronico VARCHAR(255) NOT NULL UNIQUE,
        contrasena VARCHAR(255) NOT NULL,
        nombre_completo VARCHAR(255),
        rol VARCHAR(50) DEFAULT 'admin' NOT NULL,
        activo BOOLEAN DEFAULT TRUE,
        ultimo_acceso TIMESTAMP,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Crear tabla de productos si no existe
    await query(`
      CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        shopify_id VARCHAR(255) UNIQUE,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        tipo_producto VARCHAR(100),
        proveedor VARCHAR(100),
        estado VARCHAR(50),
        publicado BOOLEAN DEFAULT false,
        destacado BOOLEAN DEFAULT false,
        etiquetas TEXT[],
        imagen_destacada_url VARCHAR(255),
        precio_base DECIMAL(10, 2),
        precio_comparacion DECIMAL(10, 2),
        sku VARCHAR(100),
        codigo_barras VARCHAR(100),
        inventario_disponible INTEGER,
        politica_inventario VARCHAR(50),
        requiere_envio BOOLEAN DEFAULT true,
        peso DECIMAL(10, 2),
        unidad_peso VARCHAR(10) DEFAULT 'kg',
        seo_titulo VARCHAR(255),
        seo_descripcion TEXT,
        url_handle VARCHAR(255),
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_publicacion TIMESTAMP,
        ultima_sincronizacion TIMESTAMP
      )
    `)

    // Crear tabla de variantes de producto si no existe
    await query(`
      CREATE TABLE IF NOT EXISTS variantes_producto (
        id SERIAL PRIMARY KEY,
        shopify_id VARCHAR(255) UNIQUE,
        producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
        titulo VARCHAR(255) NOT NULL,
        precio DECIMAL(10, 2),
        precio_comparacion DECIMAL(10, 2),
        sku VARCHAR(100),
        codigo_barras VARCHAR(100),
        inventario_disponible INTEGER,
        politica_inventario VARCHAR(50),
        requiere_envio BOOLEAN DEFAULT true,
        peso DECIMAL(10, 2),
        unidad_peso VARCHAR(10) DEFAULT 'kg',
        opcion1_nombre VARCHAR(100),
        opcion1_valor VARCHAR(100),
        opcion2_nombre VARCHAR(100),
        opcion2_valor VARCHAR(100),
        opcion3_nombre VARCHAR(100),
        opcion3_valor VARCHAR(100),
        posicion INTEGER,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ultima_sincronizacion TIMESTAMP
      )
    `)

    // Crear tabla de imágenes de producto si no existe
    await query(`
      CREATE TABLE IF NOT EXISTS imagenes_producto (
        id SERIAL PRIMARY KEY,
        shopify_id VARCHAR(255) UNIQUE,
        producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
        variante_id INTEGER REFERENCES variantes_producto(id) ON DELETE SET NULL,
        url VARCHAR(255) NOT NULL,
        texto_alternativo VARCHAR(255),
        posicion INTEGER,
        es_destacada BOOLEAN DEFAULT false,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ultima_sincronizacion TIMESTAMP
      )
    `)

    // Crear tabla de colecciones si no existe
    await query(`
      CREATE TABLE IF NOT EXISTS colecciones (
        id SERIAL PRIMARY KEY,
        shopify_id VARCHAR(255) UNIQUE,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        url_handle VARCHAR(255),
        imagen_url VARCHAR(255),
        es_automatica BOOLEAN DEFAULT false,
        condiciones_automaticas JSONB,
        publicada BOOLEAN DEFAULT false,
        seo_titulo VARCHAR(255),
        seo_descripcion TEXT,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_publicacion TIMESTAMP,
        ultima_sincronizacion TIMESTAMP
      )
    `)

    // Crear tabla de relación productos-colecciones si no existe
    await query(`
      CREATE TABLE IF NOT EXISTS productos_colecciones (
        id SERIAL PRIMARY KEY,
        producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
        coleccion_id INTEGER REFERENCES colecciones(id) ON DELETE CASCADE,
        posicion INTEGER,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(producto_id, coleccion_id)
      )
    `)

    // Crear tabla de promociones si no existe
    await query(`
      CREATE TABLE IF NOT EXISTS promociones (
        id SERIAL PRIMARY KEY,
        shopify_id VARCHAR(255) UNIQUE,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        tipo VARCHAR(50) NOT NULL, 
        valor DECIMAL(10, 2),
        codigo VARCHAR(100),
        objetivo VARCHAR(50), 
        objetivo_id VARCHAR(255), 
        condiciones JSONB,
        fecha_inicio TIMESTAMP,
        fecha_fin TIMESTAMP,
        activa BOOLEAN DEFAULT false,
        limite_uso INTEGER,
        contador_uso INTEGER DEFAULT 0,
        es_automatica BOOLEAN DEFAULT false,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ultima_sincronizacion TIMESTAMP
      )
    `)

    // Crear tabla de mercados si no existe
    await query(`
      CREATE TABLE IF NOT EXISTS mercados (
        id SERIAL PRIMARY KEY,
        shopify_id VARCHAR(255) UNIQUE,
        nombre VARCHAR(255) NOT NULL,
        activo BOOLEAN DEFAULT false,
        es_principal BOOLEAN DEFAULT false,
        moneda_codigo VARCHAR(10),
        moneda_simbolo VARCHAR(10),
        dominio VARCHAR(255),
        subfolder_sufijo VARCHAR(100),
        paises TEXT[],
        idiomas JSONB,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ultima_sincronizacion TIMESTAMP
      )
    `)

    // Crear tabla de clientes si no existe
    await query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        shopify_id VARCHAR(255) UNIQUE,
        email VARCHAR(255),
        nombre VARCHAR(100),
        apellidos VARCHAR(100),
        telefono VARCHAR(50),
        acepta_marketing BOOLEAN DEFAULT false,
        notas TEXT,
        etiquetas TEXT[],
        total_pedidos INTEGER DEFAULT 0,
        total_gastado DECIMAL(10, 2) DEFAULT 0,
        estado VARCHAR(50),
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ultima_sincronizacion TIMESTAMP
      )
    `)

    // Crear tabla de direcciones de cliente si no existe
    await query(`
      CREATE TABLE IF NOT EXISTS direcciones_cliente (
        id SERIAL PRIMARY KEY,
        shopify_id VARCHAR(255) UNIQUE,
        cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
        es_predeterminada BOOLEAN DEFAULT false,
        nombre VARCHAR(100),
        apellidos VARCHAR(100),
        empresa VARCHAR(100),
        direccion1 VARCHAR(255),
        direccion2 VARCHAR(255),
        ciudad VARCHAR(100),
        provincia VARCHAR(100),
        codigo_postal VARCHAR(20),
        pais VARCHAR(100),
        codigo_pais VARCHAR(10),
        telefono VARCHAR(50),
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ultima_sincronizacion TIMESTAMP
      )
    `)

    // Crear tabla de pedidos si no existe
    await query(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        shopify_id VARCHAR(255) UNIQUE,
        numero_pedido VARCHAR(50),
        cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
        email_cliente VARCHAR(255),
        estado VARCHAR(50),
        estado_financiero VARCHAR(50),
        estado_cumplimiento VARCHAR(50),
        moneda VARCHAR(10),
        subtotal DECIMAL(10, 2),
        impuestos DECIMAL(10, 2),
        envio DECIMAL(10, 2),
        descuentos DECIMAL(10, 2),
        total DECIMAL(10, 2),
        ip_cliente VARCHAR(50),
        navegador_cliente VARCHAR(255),
        notas TEXT,
        etiquetas TEXT[],
        riesgo_fraude VARCHAR(50),
        cancelado BOOLEAN DEFAULT false,
        fecha_cancelacion TIMESTAMP,
        motivo_cancelacion TEXT,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_procesamiento TIMESTAMP,
        ultima_sincronizacion TIMESTAMP
      )
    `)

    // Crear tabla de líneas de pedido si no existe
    await query(`
      CREATE TABLE IF NOT EXISTS lineas_pedido (
        id SERIAL PRIMARY KEY,
        shopify_id VARCHAR(255) UNIQUE,
        pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
        producto_id INTEGER REFERENCES productos(id) ON DELETE SET NULL,
        variante_id INTEGER REFERENCES variantes_producto(id) ON DELETE SET NULL,
        titulo VARCHAR(255),
        variante_titulo VARCHAR(255),
        sku VARCHAR(100),
        cantidad INTEGER,
        precio DECIMAL(10, 2),
        descuento DECIMAL(10, 2),
        total DECIMAL(10, 2),
        requiere_envio BOOLEAN DEFAULT true,
        impuesto DECIMAL(10, 2),
        propiedades JSONB,
        estado_cumplimiento VARCHAR(50),
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ultima_sincronizacion TIMESTAMP
      )
    `)

    // Crear tabla de transacciones si no existe
    await query(`
      CREATE TABLE IF NOT EXISTS transacciones (
        id SERIAL PRIMARY KEY,
        shopify_id VARCHAR(255) UNIQUE,
        pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
        tipo VARCHAR(50),
        estado VARCHAR(50),
        pasarela_pago VARCHAR(100),
        monto DECIMAL(10, 2),
        moneda VARCHAR(10),
        error_codigo VARCHAR(50),
        error_mensaje TEXT,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ultima_sincronizacion TIMESTAMP
      )
    `)

    // Crear tabla de envíos si no existe
    await query(`
      CREATE TABLE IF NOT EXISTS envios (
        id SERIAL PRIMARY KEY,
        shopify_id VARCHAR(255) UNIQUE,
        pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
        estado VARCHAR(50),
        servicio_envio VARCHAR(100),
        numero_seguimiento VARCHAR(100),
        url_seguimiento VARCHAR(255),
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_entrega TIMESTAMP,
        ultima_sincronizacion TIMESTAMP
      )
    `)

    // Crear tabla de metadatos si no existe
    await query(`
      CREATE TABLE IF NOT EXISTS metadatos (
        id SERIAL PRIMARY KEY,
        shopify_id VARCHAR(255) UNIQUE,
        tipo_propietario VARCHAR(50), 
        propietario_id INTEGER, 
        shopify_propietario_id VARCHAR(255), 
        namespace VARCHAR(100),
        clave VARCHAR(100),
        valor TEXT,
        tipo_valor VARCHAR(50),
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ultima_sincronizacion TIMESTAMP,
        UNIQUE(tipo_propietario, propietario_id, namespace, clave)
      )
    `)

    // Crear tabla de registro de sincronización si no existe
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

    return true
  },

  // Crear un administrador por defecto
  async createDefaultAdmin() {
    try {
      // Verificar si ya existe un administrador
      const checkResult = await query(`
        SELECT COUNT(*) FROM administradores
      `)

      if (Number.parseInt(checkResult.rows[0].count) > 0) {
        console.log("Ya existe al menos un administrador, no se creará uno por defecto")
        return false
      }

      // Crear administrador por defecto
      const hashedPassword = await hashPassword("GranitoSkate")

      await query(
        `
        INSERT INTO administradores (
          nombre_usuario, correo_electronico, contrasena, nombre_completo, rol
        ) VALUES (
          'admin', 'admin@granitoskate.com', $1, 'Administrador', 'admin'
        )
      `,
        [hashedPassword],
      )

      console.log("Administrador por defecto creado correctamente")
      return true
    } catch (error) {
      console.error("Error al crear administrador por defecto:", error)
      return false
    }
  },
}
