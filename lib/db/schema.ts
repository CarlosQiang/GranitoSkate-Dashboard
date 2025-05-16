// Definición de tipos para las tablas de la base de datos
// Estos tipos reflejan la estructura de las tablas en la base de datos

export interface Administrador {
  id: number
  nombre_usuario: string
  email: string
  nombre_completo?: string
  password_hash: string
  salt: string
  rol: string
  activo: boolean
  ultimo_acceso?: Date
  fecha_creacion: Date
  fecha_actualizacion: Date
}

export interface Producto {
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
  unidad_peso: string
  seo_titulo?: string
  seo_descripcion?: string
  url_handle?: string
  fecha_creacion: Date
  fecha_actualizacion: Date
  fecha_publicacion?: Date
  ultima_sincronizacion?: Date
}

export interface VarianteProducto {
  id: number
  shopify_id?: string
  producto_id: number
  titulo: string
  precio?: number
  precio_comparacion?: number
  sku?: string
  codigo_barras?: string
  inventario_disponible?: number
  politica_inventario?: string
  requiere_envio: boolean
  peso?: number
  unidad_peso: string
  opcion1_nombre?: string
  opcion1_valor?: string
  opcion2_nombre?: string
  opcion2_valor?: string
  opcion3_nombre?: string
  opcion3_valor?: string
  posicion?: number
  fecha_creacion: Date
  fecha_actualizacion: Date
  ultima_sincronizacion?: Date
}

export interface ImagenProducto {
  id: number
  shopify_id?: string
  producto_id: number
  variante_id?: number
  url: string
  texto_alternativo?: string
  posicion?: number
  es_destacada: boolean
  fecha_creacion: Date
  fecha_actualizacion: Date
  ultima_sincronizacion?: Date
}

export interface Coleccion {
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

export interface ProductoColeccion {
  id: number
  producto_id: number
  coleccion_id: number
  posicion?: number
  fecha_creacion: Date
  fecha_actualizacion: Date
}

export interface Promocion {
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

export interface Mercado {
  id: number
  shopify_id?: string
  nombre: string
  activo: boolean
  es_principal: boolean
  moneda_codigo?: string
  moneda_simbolo?: string
  dominio?: string
  subfolder_sufijo?: string
  paises?: string[]
  idiomas?: any
  fecha_creacion: Date
  fecha_actualizacion: Date
  ultima_sincronizacion?: Date
}

export interface Cliente {
  id: number
  shopify_id?: string
  email?: string
  nombre?: string
  apellidos?: string
  telefono?: string
  acepta_marketing: boolean
  notas?: string
  etiquetas?: string[]
  total_pedidos: number
  total_gastado: number
  estado?: string
  fecha_creacion: Date
  fecha_actualizacion: Date
  ultima_sincronizacion?: Date
}

export interface DireccionCliente {
  id: number
  shopify_id?: string
  cliente_id: number
  es_predeterminada: boolean
  nombre?: string
  apellidos?: string
  empresa?: string
  direccion1?: string
  direccion2?: string
  ciudad?: string
  provincia?: string
  codigo_postal?: string
  pais?: string
  codigo_pais?: string
  telefono?: string
  fecha_creacion: Date
  fecha_actualizacion: Date
  ultima_sincronizacion?: Date
}

export interface Pedido {
  id: number
  shopify_id?: string
  numero_pedido?: string
  cliente_id?: number
  email_cliente?: string
  estado?: string
  estado_financiero?: string
  estado_cumplimiento?: string
  moneda?: string
  subtotal?: number
  impuestos?: number
  envio?: number
  descuentos?: number
  total?: number
  ip_cliente?: string
  navegador_cliente?: string
  notas?: string
  etiquetas?: string[]
  riesgo_fraude?: string
  cancelado: boolean
  fecha_cancelacion?: Date
  motivo_cancelacion?: string
  fecha_creacion: Date
  fecha_actualizacion: Date
  fecha_procesamiento?: Date
  ultima_sincronizacion?: Date
}

export interface LineaPedido {
  id: number
  shopify_id?: string
  pedido_id: number
  producto_id?: number
  variante_id?: number
  titulo?: string
  variante_titulo?: string
  sku?: string
  cantidad?: number
  precio?: number
  descuento?: number
  total?: number
  requiere_envio: boolean
  impuesto?: number
  propiedades?: any
  estado_cumplimiento?: string
  fecha_creacion: Date
  fecha_actualizacion: Date
  ultima_sincronizacion?: Date
}

export interface Transaccion {
  id: number
  shopify_id?: string
  pedido_id: number
  tipo?: string
  estado?: string
  pasarela_pago?: string
  monto?: number
  moneda?: string
  error_codigo?: string
  error_mensaje?: string
  fecha_creacion: Date
  fecha_actualizacion: Date
  ultima_sincronizacion?: Date
}

export interface Envio {
  id: number
  shopify_id?: string
  pedido_id: number
  estado?: string
  servicio_envio?: string
  numero_seguimiento?: string
  url_seguimiento?: string
  fecha_creacion: Date
  fecha_actualizacion: Date
  fecha_entrega?: Date
  ultima_sincronizacion?: Date
}

export interface Metadato {
  id: number
  shopify_id?: string
  tipo_propietario: string
  propietario_id: number
  shopify_propietario_id?: string
  namespace: string
  clave: string
  valor?: string
  tipo_valor?: string
  fecha_creacion: Date
  fecha_actualizacion: Date
  ultima_sincronizacion?: Date
}

export interface RegistroSincronizacion {
  id: number
  tipo_entidad: string
  entidad_id?: string
  accion: string
  resultado: string
  mensaje?: string
  detalles?: any
  fecha: Date
}
