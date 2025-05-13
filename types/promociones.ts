/**
 * Tipos para el sistema de promociones
 *
 * @author Carlos Martínez
 * @version 1.0.1
 * @fecha 2023-05-10
 */

// Tipos de promociones disponibles
export type TipoPromocion = "PORCENTAJE_DESCUENTO" | "CANTIDAD_FIJA" | "COMPRA_X_LLEVA_Y" | "ENVIO_GRATIS"

// Objetivos donde se puede aplicar una promoción
export type ObjetivoPromocion = "CARRITO" | "PRODUCTO" | "COLECCION"

// Tipos de condiciones para las promociones
export type TipoCondicion = "CANTIDAD_MINIMA" | "CLIENTE_ESPECIFICO" | "PRIMERA_COMPRA"

// Estructura de una condición
export interface CondicionPromocion {
  tipo: TipoCondicion
  valor: number | string
}

// Estructura completa de una promoción
export interface Promocion {
  id: string
  titulo: string
  descripcion?: string
  tipo: TipoPromocion
  objetivo: ObjetivoPromocion
  objetivoId?: string
  valor: number
  condiciones: CondicionPromocion[]
  activa: boolean
  codigo?: string
  fechaInicio: string
  fechaFin?: string
  limiteUsos?: number
  contadorUsos: number
  fechaCreacion: string
  fechaActualizacion: string
}

// Datos para crear o actualizar una promoción
export type PromocionInput = Omit<Promocion, "id" | "fechaCreacion" | "fechaActualizacion" | "contadorUsos"> & {
  contadorUsos?: number
}

// Datos para el asistente de promociones
export interface DatosAsistentePromocion {
  titulo: string
  descripcion: string
  tipo: TipoPromocion
  objetivo: ObjetivoPromocion
  objetivoId: string
  valor: string
  compraMinima: string
  requiereCodigo: boolean
  codigo: string
  tieneFechaFin: boolean
  fechaInicio: Date
  fechaFin: Date
  limitarUsos: boolean
  limiteUsos: string
}
