import { shopifyFetch } from "@/lib/shopify"

export async function obtenerPromociones(filtro = "todas") {
  try {
    // Primero intentamos obtener las promociones de la base de datos local
    const dbResponse = await fetch(`/api/db/promociones`)

    if (!dbResponse.ok) {
      throw new Error("Error al obtener promociones de la base de datos")
    }

    const dbData = await dbResponse.json()

    // Si hay promociones en la base de datos, las devolvemos filtradas
    if (dbData && dbData.length > 0) {
      return filtrarPromociones(dbData, filtro)
    }

    // Si no hay promociones en la base de datos, las obtenemos directamente de Shopify
    // Usamos GraphQL para obtener los descuentos
    const query = `
      query {
        discountNodes(first: 50) {
          edges {
            node {
              id
              discount {
                ... on DiscountCodeBasic {
                  title
                  summary
                  status
                  codes(first: 1) {
                    nodes {
                      code
                      id
                    }
                  }
                  startsAt
                  endsAt
                  usageLimit
                  appliesOncePerCustomer
                }
                ... on DiscountCodeFreeShipping {
                  title
                  summary
                  status
                  codes(first: 1) {
                    nodes {
                      code
                      id
                    }
                  }
                  startsAt
                  endsAt
                  usageLimit
                  appliesOncePerCustomer
                }
                ... on DiscountCodeBxgy {
                  title
                  summary
                  status
                  codes(first: 1) {
                    nodes {
                      code
                      id
                    }
                  }
                  startsAt
                  endsAt
                  usageLimit
                  appliesOncePerCustomer
                }
                ... on DiscountAutomaticBasic {
                  title
                  summary
                  status
                  startsAt
                  endsAt
                }
                ... on DiscountAutomaticBxgy {
                  title
                  summary
                  status
                  startsAt
                  endsAt
                }
              }
            }
          }
        }
      }
    `

    const graphqlResponse = await shopifyFetch({
      query,
      variables: {},
    })

    if (!graphqlResponse.ok) {
      // Si falla GraphQL, intentamos con la API REST como fallback
      console.warn("Error al obtener promociones con GraphQL, intentando con REST API")
      return await obtenerPromocionesREST(filtro)
    }

    const data = await graphqlResponse.json()

    if (data.errors) {
      console.error("Errores en la respuesta GraphQL:", data.errors)
      // Si hay errores en GraphQL, intentamos con la API REST como fallback
      return await obtenerPromocionesREST(filtro)
    }

    // Transformamos los datos de GraphQL al formato que espera nuestra aplicación
    const promociones = data.data.discountNodes.edges.map((edge) => {
      const { node } = edge
      const { discount } = node

      // Obtenemos el código si existe
      let code = ""
      if (discount.codes && discount.codes.nodes && discount.codes.nodes.length > 0) {
        code = discount.codes.nodes[0].code
      }

      return {
        id: node.id,
        titulo: discount.title || "Sin título",
        descripcion: discount.summary || "",
        codigo: code,
        estado: discount.status || "INACTIVE",
        fechaInicio: discount.startsAt || null,
        fechaFin: discount.endsAt || null,
        tipoDescuento: determinarTipoDescuento(discount),
        valorDescuento: extraerValorDescuento(discount.summary),
        usoMaximo: discount.usageLimit || null,
        usoUnicoCliente: discount.appliesOncePerCustomer || false,
      }
    })

    return filtrarPromociones(promociones, filtro)
  } catch (error) {
    console.error("Error al obtener promociones:", error)
    throw new Error("No se pudieron obtener las promociones. Por favor, inténtalo de nuevo.")
  }
}

// Función para obtener promociones usando la API REST como fallback
async function obtenerPromocionesREST(filtro = "todas") {
  try {
    const response = await fetch(`/api/shopify/promotions`)

    if (!response.ok) {
      throw new Error("Error al obtener promociones de Shopify")
    }

    const data = await response.json()
    return filtrarPromociones(data, filtro)
  } catch (error) {
    console.error("Error al obtener promociones con REST API:", error)
    throw error
  }
}

// Función para filtrar promociones según el filtro seleccionado
function filtrarPromociones(promociones, filtro) {
  const ahora = new Date()

  switch (filtro) {
    case "activas":
      return promociones.filter((promo) => {
        const fechaInicio = promo.fechaInicio ? new Date(promo.fechaInicio) : null
        const fechaFin = promo.fechaFin ? new Date(promo.fechaFin) : null

        return promo.estado === "ACTIVE" && (!fechaInicio || fechaInicio <= ahora) && (!fechaFin || fechaFin >= ahora)
      })
    case "programadas":
      return promociones.filter((promo) => {
        const fechaInicio = promo.fechaInicio ? new Date(promo.fechaInicio) : null
        return fechaInicio && fechaInicio > ahora
      })
    case "expiradas":
      return promociones.filter((promo) => {
        const fechaFin = promo.fechaFin ? new Date(promo.fechaFin) : null
        return (fechaFin && fechaFin < ahora) || promo.estado === "EXPIRED"
      })
    case "todas":
    default:
      return promociones
  }
}

// Función para determinar el tipo de descuento basado en el objeto de descuento
function determinarTipoDescuento(discount) {
  if (discount.__typename) {
    switch (discount.__typename) {
      case "DiscountCodeBasic":
        return "PERCENTAGE" // Asumimos porcentaje por defecto, pero podría ser FIXED_AMOUNT
      case "DiscountCodeFreeShipping":
        return "FREE_SHIPPING"
      case "DiscountCodeBxgy":
        return "BUY_X_GET_Y"
      case "DiscountAutomaticBasic":
        return "AUTOMATIC"
      case "DiscountAutomaticBxgy":
        return "AUTOMATIC_BXGY"
      default:
        return "PERCENTAGE"
    }
  }

  // Si no tenemos __typename, intentamos inferir del resumen
  const summary = discount.summary || ""
  if (summary.includes("envío gratis") || summary.includes("free shipping")) {
    return "FREE_SHIPPING"
  } else if (summary.includes("%")) {
    return "PERCENTAGE"
  } else if (summary.includes("$")) {
    return "FIXED_AMOUNT"
  } else if (summary.includes("compra") && summary.includes("lleva")) {
    return "BUY_X_GET_Y"
  }

  return "PERCENTAGE" // Valor por defecto
}

// Función para extraer el valor del descuento del resumen
function extraerValorDescuento(summary) {
  if (!summary) return null

  // Intentamos extraer un porcentaje
  const porcentajeMatch = summary.match(/(\d+)%/)
  if (porcentajeMatch) {
    return Number.parseInt(porcentajeMatch[1], 10)
  }

  // Intentamos extraer un valor monetario
  const valorMatch = summary.match(/\$(\d+(\.\d+)?)/)
  if (valorMatch) {
    return Number.parseFloat(valorMatch[1])
  }

  return null
}

// Función para crear una promoción
export async function crearPromocion(datosPromocion) {
  try {
    // Primero creamos la promoción en Shopify
    const shopifyResponse = await fetch("/api/shopify/rest/discount_codes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datosPromocion),
    })

    if (!shopifyResponse.ok) {
      const errorData = await shopifyResponse.json()
      throw new Error(errorData.message || "Error al crear la promoción en Shopify")
    }

    const shopifyData = await shopifyResponse.json()

    // Luego guardamos la promoción en nuestra base de datos
    const dbResponse = await fetch("/api/db/promociones", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...datosPromocion,
        shopifyId: shopifyData.id,
      }),
    })

    if (!dbResponse.ok) {
      const errorData = await dbResponse.json()
      throw new Error(errorData.message || "Error al guardar la promoción en la base de datos")
    }

    const dbData = await dbResponse.json()
    return dbData
  } catch (error) {
    console.error("Error al crear promoción:", error)
    throw error
  }
}
