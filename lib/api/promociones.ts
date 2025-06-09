const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

export interface PromocionData {
  titulo: string
  descripcion?: string
  tipo: string
  objetivo: string
  valor: string | number
  fechaInicio: string
  fechaFin?: string | null
  codigo?: string | null
  limitarUsos?: boolean
  limiteUsos?: number | null
  compraMinima?: number | null
  productosSeleccionados?: string[]
  coleccionesSeleccionadas?: string[]
}

export async function fetchPromociones(filter = "todas") {
  try {
    console.log(`🔍 Obteniendo promociones con filtro: ${filter}`)

    // Array para almacenar todas las promociones
    let todasPromociones = []

    // Intentar obtener de Shopify primero
    try {
      const shopifyResponse = await fetch(`/api/shopify/promotions?filter=${filter}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      if (shopifyResponse.ok) {
        const shopifyData = await shopifyResponse.json()
        if (shopifyData.success && Array.isArray(shopifyData.promociones)) {
          console.log(`✅ Promociones de Shopify: ${shopifyData.promociones.length}`)

          // Asegurarse de que todas las promociones tengan el campo esShopify
          todasPromociones = shopifyData.promociones.map((promo) => ({
            ...promo,
            esShopify: true,
          }))
        }
      } else {
        console.error(`❌ Error al obtener promociones de Shopify: ${shopifyResponse.status}`)
        const errorText = await shopifyResponse.text()
        console.error(errorText)
      }
    } catch (shopifyError) {
      console.error("Error al obtener promociones de Shopify:", shopifyError)
    }

    // Obtener promociones de la base de datos local
    try {
      const dbResponse = await fetch(`/api/db/promociones?filter=${filter}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      if (dbResponse.ok) {
        const dbData = await dbResponse.json()
        if (Array.isArray(dbData) && dbData.length > 0) {
          console.log(`✅ Promociones de BD local: ${dbData.length}`)

          // Filtrar para no duplicar promociones que ya existen en Shopify
          const promocionesUnicas = dbData.filter((dbPromo) => {
            // Si tiene shopify_id, verificar que no esté ya en las promociones de Shopify
            if (dbPromo.shopify_id) {
              return !todasPromociones.some(
                (shopifyPromo) =>
                  shopifyPromo.id === dbPromo.shopify_id || shopifyPromo.shopify_id === dbPromo.shopify_id,
              )
            }
            return true // Si no tiene shopify_id, incluirla siempre
          })

          todasPromociones = [...todasPromociones, ...promocionesUnicas]
        }
      } else {
        console.error(`❌ Error al obtener promociones de BD local: ${dbResponse.status}`)
        const errorText = await dbResponse.text()
        console.error(errorText)
      }
    } catch (dbError) {
      console.error("Error al obtener promociones de BD local:", dbError)
    }

    console.log(`✅ Total promociones combinadas: ${todasPromociones.length}`)
    return todasPromociones
  } catch (error) {
    console.error("❌ Error al obtener promociones:", error)
    throw new Error("No se pudieron cargar las promociones. Intente nuevamente más tarde.")
  }
}

// El resto del archivo se mantiene igual...
