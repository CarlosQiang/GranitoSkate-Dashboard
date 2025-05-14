// Este archivo ya no usa Drizzle ORM

// Definición de tipos para las tablas
export type Producto = {
  id: number
  shopify_id?: string
  titulo: string
  descripcion?: string
  tipo_producto?: string
  proveedor?: string
  estado?: string
  publicado: boolean
  destacado: boolean
  etiquetas?: string[]
  imagen_destacada_url?: string
  precio_base?: number
  precio_comparacion?: number
  sku?: string
  codigo_barras?: string
  inventario_disponible?: number
  politica_inventario?: string
  requiere_envio: boolean
  peso?: number
  unidad_peso?: string
  seo_titulo?: string
  seo_descripcion?: string
  url_handle?: string
  fecha_creacion: Date
  fecha_actualizacion: Date
  fecha_publicacion?: Date
  ultima_sincronizacion?: Date
}

export type Promocion = {
  id: number
  shopify_id?: string
  titulo: string
  descripcion?: string
  tipo: string
  valor?: number
  codigo?: string
  objetivo?: string
  objetivo_id?: string
  condiciones?: any
  fecha_inicio?: Date
  fecha_fin?: Date
  activa: boolean
  limite_uso?: number
  contador_uso: number
  es_automatica: boolean
  fecha_creacion: Date
  fecha_actualizacion: Date
  ultima_sincronizacion?: Date
}

export type Coleccion = {
  id: number
  shopify_id?: string
  titulo: string
  descripcion?: string
  url_handle?: string
  imagen_url?: string
  es_automatica: boolean
  condiciones_automaticas?: any
  publicada: boolean
  seo_titulo?: string
  seo_descripcion?: string
  fecha_creacion: Date
  fecha_actualizacion: Date
  fecha_publicacion?: Date
  ultima_sincronizacion?: Date
}

export type RegistroSincronizacion = {
  id: number
  tipo_entidad: string
  entidad_id?: string
  accion: string
  resultado: string
  mensaje?: string
  detalles?: any
  fecha: Date
}
