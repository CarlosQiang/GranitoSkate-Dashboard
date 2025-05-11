import type { Promocion, PromocionInput } from "@/types/promociones"

// Caché local para mejorar rendimiento
let cachePromociones: Promocion[] | null = null
let cacheTiempoExpiracion: number | null = null
const CACHE_DURACION = 5 * 60 * 1000 // 5 minutos

/**
 * Obtiene todas las promociones
 * @returns Lista de promociones
 */
export async function obtenerPromociones(): Promise<Promocion[]> {
  try {
    // Verificar si tenemos datos en caché válidos
    const ahora = Date.now()
    if (cachePromociones && cacheTiempoExpiracion && ahora < cacheTiempoExpiracion) {
      console.log("Usando promociones en caché")
      return cachePromociones
    }

    // Si no hay caché o expiró, hacer petición a la API
    console.log("Obteniendo promociones desde API")

    // TODO: Implementar integración real con Shopify Price Rules API
    // Por ahora usamos datos de ejemplo
    const promociones: Promocion[] = [
      {
        id: "1",
        titulo: "20% de descuento en toda la tienda",
        descripcion: "Descuento de temporada",
        tipo: "PORCENTAJE_DESCUENTO",
        objetivo: "CARRITO",
        valor: 20,
        condiciones: [],
        activa: true,
        fechaInicio: new Date().toISOString(),
        fechaFin: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
        contadorUsos: 0,
      },
      {
        id: "2",
        titulo: "5€ de descuento en pedidos superiores a 50€",
        descripcion: "Promoción para aumentar el valor del carrito",
        tipo: "CANTIDAD_FIJA",
        objetivo: "CARRITO",
        valor: 5,
        condiciones: [
          {
            tipo: "CANTIDAD_MINIMA",
            valor: 50,
          },
        ],
        activa: true,
        codigo: "AHORRA5",
        fechaInicio: new Date().toISOString(),
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
        contadorUsos: 12,
      },
    ]

    // Guardar en caché
    cachePromociones = promociones
    cacheTiempoExpiracion = ahora + CACHE_DURACION

    return promociones
  } catch (error) {
    console.error("Error al obtener promociones:", error)
    return []
  }
}

/**
 * Obtiene una promoción por su ID
 * @param id ID de la promoción
 * @returns Datos de la promoción o null si no existe
 */
export async function obtenerPromocionPorId(id: string): Promise<Promocion | null> {
  try {
    const promociones = await obtenerPromociones()
    return promociones.find((p) => p.id === id) || null
  } catch (error) {
    console.error(`Error al obtener promoción ${id}:`, error)
    return null
  }
}

/**
 * Crea una nueva promoción
 * @param datos Datos de la promoción a crear
 * @returns La promoción creada
 */
export async function crearPromocion(datos: PromocionInput): Promise<Promocion> {
  try {
    // TODO: Implementar integración real con Shopify Price Rules API
    // Por ahora simulamos la creación

    // Invalidar caché
    cachePromociones = null
    cacheTiempoExpiracion = null

    // Simular respuesta
    return {
      id: Math.random().toString(36).substring(2, 9),
      ...datos,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
      contadorUsos: 0,
    }
  } catch (error) {
    console.error("Error al crear promoción:", error)
    throw error
  }
}

/**
 * Actualiza una promoción existente
 * @param id ID de la promoción
 * @param datos Datos a actualizar
 * @returns La promoción actualizada
 */
export async function actualizarPromocion(id: string, datos: Partial<PromocionInput>): Promise<Promocion | null> {
  try {
    const promocion = await obtenerPromocionPorId(id)
    if (!promocion) {
      return null
    }

    // TODO: Implementar integración real con Shopify Price Rules API
    // Por ahora simulamos la actualización

    // Invalidar caché
    cachePromociones = null
    cacheTiempoExpiracion = null

    // Simular respuesta
    return {
      ...promocion,
      ...datos,
      fechaActualizacion: new Date().toISOString(),
    }
  } catch (error) {
    console.error(`Error al actualizar promoción ${id}:`, error)
    throw error
  }
}

/**
 * Elimina una promoción
 * @param id ID de la promoción
 * @returns true si se eliminó correctamente
 */
export async function eliminarPromocion(id: string): Promise<boolean> {
  try {
    // TODO: Implementar integración real con Shopify Price Rules API
    // Por ahora simulamos la eliminación

    // Invalidar caché
    cachePromociones = null
    cacheTiempoExpiracion = null

    return true
  } catch (error) {
    console.error(`Error al eliminar promoción ${id}:`, error)
    return false
  }
}
