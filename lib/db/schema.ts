import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  json,
  primaryKey,
  varchar,
} from "drizzle-orm/pg-core"

// Tabla de administradores (existente en la versión 43)
export const administradores = pgTable("administradores", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  rol: text("rol").default("editor"),
  activo: boolean("activo").default(true),
  fecha_creacion: timestamp("fecha_creacion").defaultNow(),
  ultima_actualizacion: timestamp("ultima_actualizacion").defaultNow(),
})

// Tabla de tutoriales
export const tutoriales = pgTable("tutoriales", {
  id: serial("id").primaryKey(),
  titulo: text("titulo").notNull(),
  descripcion: text("descripcion"),
  contenido: text("contenido").notNull(),
  imagen_url: text("imagen_url"),
  autor_id: integer("autor_id").references(() => administradores.id),
  publicado: boolean("publicado").default(false),
  destacado: boolean("destacado").default(false),
  fecha_creacion: timestamp("fecha_creacion").defaultNow(),
  ultima_actualizacion: timestamp("ultima_actualizacion").defaultNow(),
})

// Tabla de productos
export const productos = pgTable("productos", {
  id: serial("id").primaryKey(),
  shopify_id: varchar("shopify_id", { length: 255 }).notNull().unique(),
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion"),
  precio: decimal("precio", { precision: 10, scale: 2 }).default("0"),
  sku: varchar("sku", { length: 100 }),
  inventario: integer("inventario").default(0),
  imagen_url: text("imagen_url"),
  activo: boolean("activo").default(true),
  meta_titulo: text("meta_titulo"),
  meta_descripcion: text("meta_descripcion"),
  meta_keywords: text("meta_keywords"),
  fecha_creacion: timestamp("fecha_creacion").defaultNow(),
  ultima_actualizacion: timestamp("ultima_actualizacion").defaultNow(),
})

// Tabla de colecciones
export const colecciones = pgTable("colecciones", {
  id: serial("id").primaryKey(),
  shopify_id: varchar("shopify_id", { length: 255 }).notNull().unique(),
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion"),
  imagen_url: text("imagen_url"),
  activo: boolean("activo").default(true),
  meta_titulo: text("meta_titulo"),
  meta_descripcion: text("meta_descripcion"),
  meta_keywords: text("meta_keywords"),
  fecha_creacion: timestamp("fecha_creacion").defaultNow(),
  ultima_actualizacion: timestamp("ultima_actualizacion").defaultNow(),
})

// Tabla de relación entre productos y colecciones
export const productos_colecciones = pgTable(
  "productos_colecciones",
  {
    producto_id: integer("producto_id")
      .notNull()
      .references(() => productos.id, { onDelete: "cascade" }),
    coleccion_id: integer("coleccion_id")
      .notNull()
      .references(() => colecciones.id, { onDelete: "cascade" }),
    fecha_creacion: timestamp("fecha_creacion").defaultNow(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.producto_id, table.coleccion_id] }),
    }
  },
)

// Tabla de clientes
export const clientes = pgTable("clientes", {
  id: serial("id").primaryKey(),
  shopify_id: varchar("shopify_id", { length: 255 }).notNull().unique(),
  nombre: varchar("nombre", { length: 100 }),
  apellido: varchar("apellido", { length: 100 }),
  email: varchar("email", { length: 255 }),
  telefono: varchar("telefono", { length: 50 }),
  direccion: text("direccion"),
  ciudad: varchar("ciudad", { length: 100 }),
  pais: varchar("pais", { length: 100 }),
  codigo_postal: varchar("codigo_postal", { length: 20 }),
  activo: boolean("activo").default(true),
  fecha_creacion: timestamp("fecha_creacion").defaultNow(),
  ultima_actualizacion: timestamp("ultima_actualizacion").defaultNow(),
})

// Tabla de pedidos
export const pedidos = pgTable("pedidos", {
  id: serial("id").primaryKey(),
  shopify_id: varchar("shopify_id", { length: 255 }).notNull().unique(),
  numero: varchar("numero", { length: 50 }),
  cliente_id: varchar("cliente_id", { length: 255 }),
  total: decimal("total", { precision: 10, scale: 2 }).default("0"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).default("0"),
  impuestos: decimal("impuestos", { precision: 10, scale: 2 }).default("0"),
  estado: varchar("estado", { length: 50 }).default("pending"),
  fecha_pedido: timestamp("fecha_pedido").defaultNow(),
  fecha_creacion: timestamp("fecha_creacion").defaultNow(),
  ultima_actualizacion: timestamp("ultima_actualizacion").defaultNow(),
})

// Tabla de promociones
export const promociones = pgTable("promociones", {
  id: serial("id").primaryKey(),
  shopify_id: varchar("shopify_id", { length: 255 }).notNull().unique(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  codigo: varchar("codigo", { length: 50 }),
  tipo: varchar("tipo", { length: 50 }).default("percentage"),
  valor: decimal("valor", { precision: 10, scale: 2 }).default("0"),
  fecha_inicio: timestamp("fecha_inicio"),
  fecha_fin: timestamp("fecha_fin"),
  activo: boolean("activo").default(true),
  fecha_creacion: timestamp("fecha_creacion").defaultNow(),
  ultima_actualizacion: timestamp("ultima_actualizacion").defaultNow(),
})

// Tabla de registro de sincronización
export const registro_sincronizacion = pgTable("registro_sincronizacion", {
  id: serial("id").primaryKey(),
  tipo: varchar("tipo", { length: 50 }).notNull(),
  estado: varchar("estado", { length: 50 }).notNull(),
  mensaje: text("mensaje"),
  duracion_ms: integer("duracion_ms"),
  fecha: timestamp("fecha").defaultNow(),
  fecha_actualizacion: timestamp("fecha_actualizacion"),
})

// Tabla de configuración SEO
export const seo_config = pgTable("seo_config", {
  id: serial("id").primaryKey(),
  entidad_tipo: varchar("entidad_tipo", { length: 50 }).notNull(), // 'producto', 'coleccion', 'pagina'
  entidad_id: varchar("entidad_id", { length: 255 }).notNull(),
  meta_titulo: text("meta_titulo"),
  meta_descripcion: text("meta_descripcion"),
  meta_keywords: text("meta_keywords"),
  canonical_url: text("canonical_url"),
  og_titulo: text("og_titulo"),
  og_descripcion: text("og_descripcion"),
  og_imagen: text("og_imagen"),
  twitter_titulo: text("twitter_titulo"),
  twitter_descripcion: text("twitter_descripcion"),
  twitter_imagen: text("twitter_imagen"),
  schema_markup: json("schema_markup"),
  fecha_creacion: timestamp("fecha_creacion").defaultNow(),
  ultima_actualizacion: timestamp("ultima_actualizacion").defaultNow(),
})

// Tabla de historial de cambios SEO
export const seo_historial = pgTable("seo_historial", {
  id: serial("id").primaryKey(),
  config_id: integer("config_id").references(() => seo_config.id, { onDelete: "cascade" }),
  usuario_id: integer("usuario_id").references(() => administradores.id),
  cambios: json("cambios").notNull(),
  fecha: timestamp("fecha").defaultNow(),
})
