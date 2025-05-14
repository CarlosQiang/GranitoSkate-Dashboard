declare module "next-auth" {
  interface User {
    id: string
    role: string
  }

  interface Session {
    user: User & {
      id: string
      role: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
  }
}

export type Tutorial = {
  id: number
  titulo: string
  descripcion?: string
  contenido: string
  imagen_url?: string
  autor_id?: number
  publicado: boolean
  destacado: boolean
  fecha_creacion: string
  ultima_actualizacion?: string
}

export type Producto = {
  id: number
  shopify_id: string
  nombre: string
  descripcion?: string
  precio: number
  sku?: string
  inventario: number
  imagen_url?: string
  activo: boolean
  meta_titulo?: string
  meta_descripcion?: string
  meta_keywords?: string
  fecha_creacion: string
  ultima_actualizacion?: string
}

export type Coleccion = {
  id: number
  shopify_id: string
  nombre: string
  descripcion?: string
  imagen_url?: string
  activo: boolean
  meta_titulo?: string
  meta_descripcion?: string
  meta_keywords?: string
  fecha_creacion: string
  ultima_actualizacion?: string
}

export type Cliente = {
  id: number
  shopify_id: string
  nombre?: string
  apellido?: string
  email?: string
  telefono?: string
  direccion?: string
  ciudad?: string
  pais?: string
  codigo_postal?: string
  activo: boolean
  fecha_creacion: string
  ultima_actualizacion?: string
}

export type Pedido = {
  id: number
  shopify_id: string
  numero?: string
  cliente_id?: string
  total: number
  subtotal: number
  impuestos: number
  estado: string
  fecha_pedido: string
  fecha_creacion: string
  ultima_actualizacion?: string
}

export type Promocion = {
  id: number
  shopify_id: string
  nombre: string
  codigo?: string
  tipo: string
  valor: number
  fecha_inicio?: string
  fecha_fin?: string
  activo: boolean
  fecha_creacion: string
  ultima_actualizacion?: string
}

export type RegistroSincronizacion = {
  id: number
  tipo: string
  estado: string
  mensaje?: string
  duracion_ms?: number
  fecha: string
  fecha_actualizacion?: string
}
