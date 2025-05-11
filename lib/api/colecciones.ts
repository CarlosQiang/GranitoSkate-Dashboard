import { SHOPIFY_API_URL, SHOPIFY_ACCESS_TOKEN } from "@/lib/utils"

/**
 * Interfaz para los parámetros de búsqueda de colecciones
 */
interface ParametrosBusquedaColeccion {
  consulta?: string
  limite?: number
  pagina?: number
}

/**
 * Obtiene todas las colecciones o filtra por consulta
 * @param params Parámetros opcionales de búsqueda
 * @returns Lista de colecciones
 */
export async function obtenerColecciones(params: ParametrosBusquedaColeccion = {}) {
  try {
    // Construir URL con parámetros de consulta
    const url = new URL(`${SHOPIFY_API_URL}/collections.json`)

    if (params.consulta) {
      url.searchParams.append("title", params.consulta)
    }

    if (params.limite) {
      url.searchParams.append("limit", params.limite.toString())
    }

    if (params.pagina) {
      url.searchParams.append("page", params.pagina.toString())
    }

    // Realizar petición a Shopify
    const respuesta = await fetch(url.toString(), {
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
    })

    if (!respuesta.ok) {
      throw new Error(`Error al obtener colecciones: ${respuesta.status}`)
    }

    const datos = await respuesta.json()

    // Mapear respuesta al formato esperado
    return datos.collections.map((coleccion: any) => ({
      id: coleccion.id.toString(),
      titulo: coleccion.title,
      handle: coleccion.handle,
      descripcion: coleccion.body_html || "",
      imagen: coleccion.image?.src || "",
      productoCount: coleccion.products_count || 0,
      fechaCreacion: coleccion.created_at,
      fechaActualizacion: coleccion.updated_at,
    }))
  } catch (error) {
    console.error("Error en obtenerColecciones:", error)
    return []
  }
}

/**
 * Obtiene una colección por su ID
 * @param id ID de la colección
 * @returns Datos de la colección o null si no existe
 */
export async function obtenerColeccionPorId(id: string) {
  try {
    const respuesta = await fetch(`${SHOPIFY_API_URL}/collections/${id}.json`, {
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
    })

    if (!respuesta.ok) {
      throw new Error(`Error al obtener colección: ${respuesta.status}`)
    }

    const datos = await respuesta.json()
    const coleccion = datos.collection

    return {
      id: coleccion.id.toString(),
      titulo: coleccion.title,
      handle: coleccion.handle,
      descripcion: coleccion.body_html || "",
      imagen: coleccion.image?.src || "",
      productoCount: coleccion.products_count || 0,
      fechaCreacion: coleccion.created_at,
      fechaActualizacion: coleccion.updated_at,
    }
  } catch (error) {
    console.error(`Error al obtener colección ${id}:`, error)
    return null
  }
}

/**
 * Crea una nueva colección
 * @param datos Datos de la colección a crear
 * @returns La colección creada
 */
export async function crearColeccion(datos: {
  titulo: string
  handle?: string
  descripcion?: string
  imagen?: string
}) {
  try {
    const respuesta = await fetch(`${SHOPIFY_API_URL}/custom_collections.json`, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        custom_collection: {
          title: datos.titulo,
          handle: datos.handle,
          body_html: datos.descripcion,
          image: datos.imagen ? { src: datos.imagen } : undefined,
        },
      }),
    })

    if (!respuesta.ok) {
      throw new Error(`Error al crear colección: ${respuesta.status}`)
    }

    const datosRespuesta = await respuesta.json()
    const coleccion = datosRespuesta.custom_collection

    return {
      id: coleccion.id.toString(),
      titulo: coleccion.title,
      handle: coleccion.handle,
      descripcion: coleccion.body_html || "",
      imagen: coleccion.image?.src || "",
      fechaCreacion: coleccion.created_at,
      fechaActualizacion: coleccion.updated_at,
    }
  } catch (error) {
    console.error("Error al crear colección:", error)
    throw error
  }
}
