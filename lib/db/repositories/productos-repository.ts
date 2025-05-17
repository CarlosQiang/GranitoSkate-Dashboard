import { query } from "@/lib/db"

// Tipo para un producto
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
  precio_comparacion: number | null
  sku: string
  codigo_barras: string
  inventario_disponible: number
  politica_inventario: string
  requiere_envio: boolean
  peso: number
  unidad_peso: string
  url_handle: string
  fecha_publicacion: Date | null
}

// Función para obtener un producto completo con variantes e imágenes
export async function getProductoCompleto(id: number): Promise<Producto | null> {
  try {
    const result = await query(
      `SELECT * FROM productos 
       WHERE id = $1`,
      [id],
    )

    if (result.rows.length === 0) {
      return null
    }

    const producto = result.rows[0]

    // Obtener variantes e imágenes (simulado)
    const variantes = [] // await getVariantesByProductoId(id);
    const imagenes = [] // await getImagenesByProductoId(id);

    return {
      ...producto,
      variantes,
      imagenes,
    }
  } catch (error) {
    console.error(`Error getting producto completo with ID ${id}:`, error)
    throw error
  }
}
