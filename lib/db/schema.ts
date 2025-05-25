export type Cliente = {
  id?: number
  shopify_id: string
  email: string
  nombre: string
  apellidos: string
  telefono: string
  acepta_marketing: boolean
  notas: string
  etiquetas: string[]
  total_pedidos: number
  total_gastado: number
  estado: string
  fecha_creacion?: Date
  fecha_actualizacion?: Date
  ultima_sincronizacion?: Date
}

export type DireccionCliente = {
  id?: number
  shopify_id: string
  cliente_id: number
  es_predeterminada: boolean
  nombre: string
  apellidos: string
  empresa: string
  direccion1: string
  direccion2: string
  ciudad: string
  provincia: string
  codigo_postal: string
  pais: string
  codigo_pais: string
  telefono: string
  fecha_creacion?: Date
  fecha_actualizacion?: Date
  ultima_sincronizacion?: Date
}

export type Coleccion = {
  id?: number
  shopify_id: string
  titulo: string
  descripcion: string
  url_handle: string
  imagen_url: string
  es_automatica: boolean
  condiciones_automaticas: any
  publicada: boolean
  seo_titulo: string
  seo_descripcion: string
  fecha_creacion?: Date
  fecha_actualizacion?: Date
  fecha_publicacion: Date | null
  ultima_sincronizacion?: Date
}

export type Mercado = {
  id?: number
  shopify_id: string
  nombre: string
  activo: boolean
  es_principal: boolean
  moneda_codigo: string
  moneda_simbolo: string
  dominio: string
  subfolder_sufijo: string
  paises: string[]
  idiomas: any
  fecha_creacion?: Date
  fecha_actualizacion?: Date
  ultima_sincronizacion?: Date
}

export type Metadato = {
  id?: number
  shopify_id: string
  tipo_propietario: string
  propietario_id: number
  shopify_propietario_id: string
  namespace: string
  clave: string
  valor: string
  tipo_valor: string
  fecha_creacion?: Date
  fecha_actualizacion?: Date
  ultima_sincronizacion?: Date
}

export type Pedido = {
  id?: number
  shopify_id: string
  numero_pedido: string
  cliente_id: number
  email_cliente: string
  estado: string
  estado_financiero: string
  estado_cumplimiento: string
  moneda: string
  subtotal: number
  impuestos: number
  envio: number
  descuentos: number
  total: number
  ip_cliente: string
  navegador_cliente: string
  notas: string
  etiquetas: string[]
  riesgo_fraude: string
  cancelado: boolean
  fecha_cancelacion: Date | null
  motivo_cancelacion: string
  fecha_creacion?: Date
  fecha_actualizacion?: Date
  fecha_procesamiento: Date | null
  ultima_sincronizacion?: Date
}

export type LineaPedido = {
  id?: number
  shopify_id: string
  pedido_id: number
  producto_id: number
  variante_id: number
  titulo: string
  variante_titulo: string
  sku: string
  cantidad: number
  precio: number
  descuento: number
  total: number
  requiere_envio: boolean
  impuesto: number
  propiedades: any
  estado_cumplimiento: string
  fecha_creacion?: Date
  fecha_actualizacion?: Date
  ultima_sincronizacion?: Date
}

export type Transaccion = {
  id?: number
  shopify_id: string
  pedido_id: number
  tipo: string
  estado: string
  pasarela_pago: string
  monto: number
  moneda: string
  error_codigo: string
  error_mensaje: string
  fecha_creacion?: Date
  fecha_actualizacion?: Date
  ultima_sincronizacion?: Date
}

export type Envio = {
  id?: number
  shopify_id: string
  pedido_id: number
  estado: string
  servicio_envio: string
  numero_seguimiento: string
  url_seguimiento: string
  fecha_creacion?: Date
  fecha_actualizacion?: Date
  fecha_entrega: Date | null
  ultima_sincronizacion?: Date
}

export type Promocion = {
  id?: number
  shopify_id: string
  titulo: string
  descripcion: string
  tipo: string
  valor: number
  codigo: string
  objetivo: string
  objetivo_id: string
  condiciones: any
  fecha_inicio: Date
  fecha_fin: Date | null
  activa: boolean
  limite_uso: number
  contador_uso: number
  es_automatica: boolean
  fecha_creacion?: Date
  fecha_actualizacion?: Date
  ultima_sincronizacion?: Date
}

export type Producto = {
  id?: number
  shopify_id: string
  titulo: string
  descripcion: string
  tipo_producto: string
  proveedor: string
  estado: string
  publicado: boolean
  destacado: boolean
  etiquetas: string[]
  imagen_destacada_url: string
  precio_base: number
  precio_comparacion: number
  sku: string
  codigo_barras: string
  inventario_disponible: number
  politica_inventario: string
  requiere_envio: boolean
  peso: number
  unidad_peso: string
  seo_titulo: string
  seo_descripcion: string
  url_handle: string
  fecha_creacion?: Date
  fecha_actualizacion?: Date
  fecha_publicacion: Date | null
  ultima_sincronizacion?: Date
}

export type VarianteProducto = {
  id?: number
  shopify_id: string
  producto_id: number
  titulo: string
  precio: number
  precio_comparacion: number
  sku: string
  codigo_barras: string
  inventario_disponible: number
  politica_inventario: string
  requiere_envio: boolean
  peso: number
  unidad_peso: string
  opcion1_nombre: string
  opcion1_valor: string
  opcion2_nombre: string
  opcion2_valor: string
  opcion3_nombre: string
  opcion3_valor: string
  posicion: number
  fecha_creacion?: Date
  fecha_actualizacion?: Date
  ultima_sincronizacion?: Date
}

export type ImagenProducto = {
  id?: number
  shopify_id: string
  producto_id: number
  variante_id: number
  url: string
  texto_alternativo: string
  posicion: number
  es_destacada: boolean
  fecha_creacion?: Date
  fecha_actualizacion?: Date
  ultima_sincronizacion?: Date
}

// Schema simplificado para el sistema actual
export type Administrador = {
  id?: number
  nombre_usuario: string
  correo_electronico: string
  contrasena: string
  nombre_completo?: string
  rol: string
  activo: boolean
  ultimo_acceso?: Date
  fecha_creacion?: Date
  fecha_actualizacion?: Date
}

export type RegistroActividad = {
  id?: number
  usuario_id?: number
  usuario_nombre?: string
  accion: string
  entidad?: string
  entidad_id?: string
  descripcion?: string
  metadatos?: any
  ip_address?: string
  user_agent?: string
  resultado: "SUCCESS" | "ERROR" | "WARNING"
  error_mensaje?: string
  duracion_ms?: number
  fecha_creacion?: Date
}

export type SesionUsuario = {
  id?: number
  usuario_id: number
  session_token: string
  ip_address?: string
  user_agent?: string
  activa: boolean
  fecha_inicio?: Date
  fecha_fin?: Date
  ultima_actividad?: Date
}
