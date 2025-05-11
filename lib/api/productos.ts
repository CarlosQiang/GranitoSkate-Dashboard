import { SHOPIFY_API_URL, SHOPIFY_ACCESS_TOKEN } from "@/lib/utils"

/**
 * Interfaz para los parámetros de búsqueda de productos
 */
interface ParametrosBusquedaProducto {
  consulta?: string
  coleccionId?: string
  limite?: number
  pagina?: number
  ordenarPor?: string
}

/**
 * Obtiene todos los productos o filtra por consulta
 * @param params Parámetros opcionales de búsqueda
 * @returns Lista de productos
 */
export async function obtenerProductos(params: ParametrosBusquedaProducto = {}) {
  try {
    // Construir URL con parámetros de consulta
    const url = new URL(`${SHOPIFY_API_URL}/products.json`)

    if (params.consulta) {
      url.searchParams.append("title", params.consulta)
    }

    if (params.coleccionId) {
      url.searchParams.append("collection_id", params.coleccionId)
    }

    if (params.limite) {
      url.searchParams.append("limit", params.limite.toString())
    }

    if (params.pagina) {
      url.searchParams.append("page", params.pagina.toString())
    }

    if (params.ordenarPor) {
      url.searchParams.append("order", params.ordenarPor)
    }

    // Realizar petición a Shopify
    const respuesta = await fetch(url.toString(), {
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
    })

    if (!respuesta.ok) {
      throw new Error(`Error al obtener productos: ${respuesta.status}`)
    }

    const datos = await respuesta.json()

    // Mapear respuesta al formato esperado
    return datos.products.map((producto: any) => ({
      id: producto.id.toString(),
      titulo: producto.title,
      handle: producto.handle,
      descripcion: producto.body_html || "",
      imagenes: producto.images.map((img: any) => ({
        id: img.id,
        src: img.src,
        posicion: img.position,
      })),
      precio: producto.variants[0]?.price || "0.00",
      comparacionPrecio: producto.variants[0]?.compare_at_price || null,
      sku: producto.variants[0]?.sku || "",
      inventario: producto.variants[0]?.inventory_quantity || 0,
      estado: producto.status,
      tipo: producto.product_type,
      etiquetas: producto.tags,
      vendedor: producto.vendor,
      fechaCreacion: producto.created_at,
      fechaActualizacion: producto.updated_at,
    }))
  } catch (error) {
    console.error("Error en obtenerProductos:", error)
    return []
  }
}

/**
 * Obtiene un producto por su ID
 * @param id ID del producto
 * @returns Datos del producto o null si no existe
 */
export async function obtenerProductoPorId(id: string) {
  try {
    const respuesta = await fetch(`${SHOPIFY_API_URL}/products/${id}.json`, {
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
    })

    if (!respuesta.ok) {
      throw new Error(`Error al obtener producto: ${respuesta.status}`)
    }

    const datos = await respuesta.json()
    const producto = datos.product

    return {
      id: producto.id.toString(),
      titulo: producto.title,
      handle: producto.handle,
      descripcion: producto.body_html || "",
      imagenes: producto.images.map((img: any) => ({
        id: img.id,
        src: img.src,
        posicion: img.position,
      })),
      precio: producto.variants[0]?.price || "0.00",
      comparacionPrecio: producto.variants[0]?.compare_at_price || null,
      sku: producto.variants[0]?.sku || "",
      inventario: producto.variants[0]?.inventory_quantity || 0,
      estado: producto.status,
      tipo: producto.product_type,
      etiquetas: producto.tags,
      vendedor: producto.vendor,
      fechaCreacion: producto.created_at,
      fechaActualizacion: producto.updated_at,
    }
  } catch (error) {
    console.error(`Error al obtener producto ${id}:`, error)
    return null
  }
}

/**
 * Crea un nuevo producto
 * @param datos Datos del producto a crear
 * @returns El producto creado
 */
export async function crearProducto(datos: {
  titulo: string
  descripcion?: string
  precio: string
  comparacionPrecio?: string
  sku?: string
  inventario?: number
  tipo?: string
  etiquetas?: string[]
  vendedor?: string
  imagenes?: { src: string }[]
}) {
  try {
    const respuesta = await fetch(`${SHOPIFY_API_URL}/products.json`, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product: {
          title: datos.titulo,
          body_html: datos.descripcion,
          vendor: datos.vendedor,
          product_type: datos.tipo,
          tags: datos.etiquetas,
          images: datos.imagenes,
          variants: [
            {
              price: datos.precio,
              compare_at_price: datos.comparacionPrecio,
              sku: datos.sku,
              inventory_quantity: datos.inventario,
              inventory_management: datos.inventario !== undefined ? "shopify" : null,
            },
          ],
        },
      }),
    })

    if (!respuesta.ok) {
      throw new Error(`Error al crear producto: ${respuesta.status}`)
    }

    const datosRespuesta = await respuesta.json()
    const producto = datosRespuesta.product

    return {
      id: producto.id.toString(),
      titulo: producto.title,
      handle: producto.handle,
      descripcion: producto.body_html || "",
      imagenes: producto.images.map((img: any) => ({
        id: img.id,
        src: img.src,
        posicion: img.position,
      })),
      precio: producto.variants[0]?.price || "0.00",
      comparacionPrecio: producto.variants[0]?.compare_at_price || null,
      sku: producto.variants[0]?.sku || "",
      inventario: producto.variants[0]?.inventory_quantity || 0,
      estado: producto.status,
      tipo: producto.product_type,
      etiquetas: producto.tags,
      vendedor: producto.vendor,
      fechaCreacion: producto.created_at,
      fechaActualizacion: producto.updated_at,
    }
  } catch (error) {
    console.error("Error al crear producto:", error)
    throw error
  }
}
