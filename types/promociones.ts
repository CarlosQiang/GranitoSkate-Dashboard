// Tipos de promociones disponibles en nuestra plataforma
// TODO: Añadir más tipos según necesidades del negocio
export type TipoPromocion = "PORCENTAJE_DESCUENTO" | "CANTIDAD_FIJA" | "COMPRA_X_LLEVA_Y" | "ENVIO_GRATIS"

// Dónde se puede aplicar la promoción
export type ObjetivoPromocion = "CARRITO" | "COLECCION" | "PRODUCTO" | "VARIANTE"

// Tipos de condiciones que podemos aplicar
// NOTA: Actualmente solo implementamos CANTIDAD_MINIMA, el resto para futuras versiones
export type TipoCondicionPromocion =
  | "CANTIDAD_MINIMA"
  | "PRIMERA_COMPRA"
  | "GRUPO_CLIENTE_ESPECIFICO"
  | "CANTIDAD_MINIMA_PRODUCTOS"

// Estructura de una condición
export type CondicionPromocion = {
  tipo: TipoCondicionPromocion
  valor: any // FIXME: Tipar esto mejor en el futuro
}

// Información de precios para mostrar en la UI
export type PrecioPromocion = {
  precio: {
    cantidad: string
    codigoMoneda: string
  }
  tituloProducto: string
  idVariante: string
}

// Modelo principal de promoción
export type Promocion = {
  id: string
  titulo: string
  tipo: TipoPromocion
  valor: number
  activa: boolean
  fechaInicio: string
  fechaFin?: string
  condiciones: CondicionPromocion[]
  contadorUsos: number
  fechaCreacion: string
  fechaActualizacion: string
  objetivo: ObjetivoPromocion
  precios?: PrecioPromocion[]
  codigo?: string
}

// Datos que maneja el asistente de promociones
// Separamos este modelo del principal para facilitar la gestión del formulario
export type DatosAsistentePromocion = {
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
