import { prisma } from "../prisma"
import { shopifyFetch } from "../shopify"
import { gql } from "graphql-request"

// Tipos para los tutoriales
export type TutorialInput = {
  titulo: string
  slug: string
  descripcion: string
  contenido: string
  imagen_url?: string
  nivel_dificultad: "principiante" | "intermedio" | "avanzado"
  tiempo_estimado?: number
  categorias: string[]
  tags: string[]
  publicado: boolean
  destacado: boolean
  fecha_publicacion?: Date
  metadatos?: any
}

// Obtener todos los tutoriales
export async function getTutoriales(
  options: {
    publicadosOnly?: boolean
    destacados?: boolean
    categoria?: string
    busqueda?: string
    page?: number
    limit?: number
  } = {},
) {
  const { publicadosOnly = false, destacados = false, categoria, busqueda, page = 1, limit = 10 } = options

  const skip = (page - 1) * limit

  // Construir la consulta
  const where: any = {}

  if (publicadosOnly) {
    where.publicado = true
  }

  if (destacados) {
    where.destacado = true
  }

  if (categoria) {
    where.categorias = {
      has: categoria,
    }
  }

  if (busqueda) {
    where.OR = [
      { titulo: { contains: busqueda, mode: "insensitive" } },
      { descripcion: { contains: busqueda, mode: "insensitive" } },
      { contenido: { contains: busqueda, mode: "insensitive" } },
    ]
  }

  // Obtener tutoriales y contar total
  const [tutoriales, total] = await Promise.all([
    prisma.tutorial.findMany({
      where,
      orderBy: { fecha_creacion: "desc" },
      skip,
      take: limit,
    }),
    prisma.tutorial.count({ where }),
  ])

  return {
    tutoriales,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
}

// Obtener un tutorial por ID
export async function getTutorialById(id: number) {
  return prisma.tutorial.findUnique({
    where: { id },
  })
}

// Obtener un tutorial por slug
export async function getTutorialBySlug(slug: string) {
  return prisma.tutorial.findUnique({
    where: { slug },
  })
}

// Crear un nuevo tutorial
export async function crearTutorial(data: TutorialInput) {
  // Crear el tutorial en la base de datos
  const tutorial = await prisma.tutorial.create({
    data: {
      ...data,
      fecha_publicacion: data.publicado ? new Date() : null,
    },
  })

  // Si está publicado, sincronizar con Shopify
  if (data.publicado) {
    await sincronizarTutorialConShopify(tutorial.id)
  }

  return tutorial
}

// Actualizar un tutorial existente
export async function actualizarTutorial(id: number, data: Partial<TutorialInput>) {
  const tutorialActual = await prisma.tutorial.findUnique({
    where: { id },
  })

  // Actualizar el tutorial en la base de datos
  const tutorial = await prisma.tutorial.update({
    where: { id },
    data: {
      ...data,
      fecha_actualizacion: new Date(),
      fecha_publicacion: data.publicado && !tutorialActual?.publicado ? new Date() : tutorialActual?.fecha_publicacion,
    },
  })

  // Si está publicado, sincronizar con Shopify
  if (data.publicado) {
    await sincronizarTutorialConShopify(id)
  }

  return tutorial
}

// Eliminar un tutorial
export async function eliminarTutorial(id: number) {
  const tutorial = await prisma.tutorial.findUnique({
    where: { id },
  })

  // Si tiene ID de Shopify, eliminar de Shopify primero
  if (tutorial?.shopify_id) {
    await eliminarTutorialDeShopify(tutorial.shopify_id)
  }

  // Eliminar de la base de datos
  return prisma.tutorial.delete({
    where: { id },
  })
}

// Sincronizar un tutorial con Shopify
export async function sincronizarTutorialConShopify(id: number) {
  const tutorial = await prisma.tutorial.findUnique({
    where: { id },
  })

  if (!tutorial) {
    throw new Error(`Tutorial con ID ${id} no encontrado`)
  }

  // Obtener el ID de la colección de tutoriales
  const coleccionId = await obtenerIdColeccionTutoriales()

  // Si el tutorial ya tiene ID de Shopify, actualizarlo
  if (tutorial.shopify_id) {
    await actualizarProductoEnShopify(tutorial)
  } else {
    // Si no, crear un nuevo producto en Shopify
    const shopifyId = await crearProductoEnShopify(tutorial, coleccionId)

    // Actualizar el ID de Shopify en la base de datos
    await prisma.tutorial.update({
      where: { id },
      data: { shopify_id: shopifyId },
    })
  }

  return true
}

// Obtener el ID de la colección de tutoriales
export async function obtenerIdColeccionTutoriales() {
  try {
    // Usamos un ID hardcodeado para la colección "Tutoriales"
    // Este ID se puede obtener desde la URL de la colección en el admin de Shopify
    // Por ejemplo, si la URL es https://tu-tienda.myshopify.com/admin/collections/123456789
    // El ID sería gid://shopify/Collection/123456789

    // Intentamos obtener la colección por título primero
    const GET_COLLECTION_BY_TITLE = gql`
      query {
        collections(first: 1, query: "title:Tutoriales") {
          edges {
            node {
              id
              title
            }
          }
        }
      }
    `

    const response = await shopifyFetch({
      query: GET_COLLECTION_BY_TITLE,
    })

    if (response.errors) {
      console.error("Error al buscar colección por título:", response.errors)
      throw new Error(`Error al buscar colección por título: ${response.errors[0].message}`)
    }

    if (response.data?.collections?.edges?.length > 0) {
      const coleccionId = response.data.collections.edges[0].node.id
      console.log("Colección encontrada por título:", coleccionId)
      return coleccionId
    }

    // Si no encontramos la colección por título, intentamos obtener todas las colecciones
    const GET_ALL_COLLECTIONS = gql`
      query {
        collections(first: 10) {
          edges {
            node {
              id
              title
            }
          }
        }
      }
    `

    const allCollectionsResponse = await shopifyFetch({
      query: GET_ALL_COLLECTIONS,
    })

    if (allCollectionsResponse.errors) {
      console.error("Error al obtener todas las colecciones:", allCollectionsResponse.errors)
      throw new Error(`Error al obtener todas las colecciones: ${allCollectionsResponse.errors[0].message}`)
    }

    const tutorialesCollection = allCollectionsResponse.data?.collections?.edges?.find(
      (edge: any) => edge.node.title === "Tutoriales",
    )

    if (tutorialesCollection) {
      console.log("Colección encontrada entre todas las colecciones:", tutorialesCollection.node.id)
      return tutorialesCollection.node.id
    }

    // Si aún no encontramos la colección, usamos un ID hardcodeado como último recurso
    // Reemplaza este ID con el ID real de tu colección "Tutoriales"
    const hardcodedId = "gid://shopify/Collection/479649849656"
    console.log("Usando ID hardcodeado para la colección:", hardcodedId)
    return hardcodedId
  } catch (error) {
    console.error("Error al obtener ID de colección de tutoriales:", error)
    throw new Error(
      `No se pudo obtener el ID de la colección de tutoriales: ${error instanceof Error ? error.message : "Error desconocido"}`,
    )
  }
}

// Crear un nuevo producto en Shopify para el tutorial
async function crearProductoEnShopify(tutorial: any, coleccionId: string) {
  try {
    console.log(`Creando producto para tutorial: ${tutorial.titulo}`)

    const CREATE_PRODUCT = gql`
      mutation productCreate($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const response = await shopifyFetch({
      query: CREATE_PRODUCT,
      variables: {
        input: {
          title: tutorial.titulo,
          descriptionHtml: `<div>${tutorial.contenido}</div>`,
          productType: "Tutorial",
          tags: tutorial.tags,
          collectionsToJoin: [coleccionId],
          published: tutorial.publicado,
          status: tutorial.publicado ? "ACTIVE" : "DRAFT",
          metafields: [
            {
              namespace: "tutorial",
              key: "nivel_dificultad",
              value: tutorial.nivel_dificultad,
              type: "single_line_text_field",
            },
            {
              namespace: "tutorial",
              key: "tiempo_estimado",
              value: String(tutorial.tiempo_estimado || 0),
              type: "number_integer",
            },
          ],
        },
      },
    })

    // Verificar si hay errores en la respuesta
    if (response.errors) {
      console.error("Errores al crear producto:", response.errors)
      throw new Error(`Error al crear producto: ${response.errors[0].message}`)
    }

    if (response.data?.productCreate?.userErrors?.length > 0) {
      throw new Error(`Error al crear producto: ${response.data.productCreate.userErrors[0].message}`)
    }

    console.log("Producto creado con éxito:", response.data.productCreate.product.id)
    return response.data.productCreate.product.id
  } catch (error) {
    console.error("Error al crear producto en Shopify:", error)
    throw new Error(`Error al crear producto: ${error instanceof Error ? error.message : "Error desconocido"}`)
  }
}

// Actualizar un producto existente en Shopify
async function actualizarProductoEnShopify(tutorial: any) {
  try {
    console.log(`Actualizando producto para tutorial: ${tutorial.titulo}`)

    const UPDATE_PRODUCT = gql`
      mutation productUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const response = await shopifyFetch({
      query: UPDATE_PRODUCT,
      variables: {
        input: {
          id: tutorial.shopify_id,
          title: tutorial.titulo,
          descriptionHtml: `<div>${tutorial.contenido}</div>`,
          tags: tutorial.tags,
          published: tutorial.publicado,
          status: tutorial.publicado ? "ACTIVE" : "DRAFT",
          metafields: [
            {
              namespace: "tutorial",
              key: "nivel_dificultad",
              value: tutorial.nivel_dificultad,
              type: "single_line_text_field",
            },
            {
              namespace: "tutorial",
              key: "tiempo_estimado",
              value: String(tutorial.tiempo_estimado || 0),
              type: "number_integer",
            },
          ],
        },
      },
    })

    // Verificar si hay errores en la respuesta
    if (response.errors) {
      console.error("Errores al actualizar producto:", response.errors)
      throw new Error(`Error al actualizar producto: ${response.errors[0].message}`)
    }

    if (response.data?.productUpdate?.userErrors?.length > 0) {
      throw new Error(`Error al actualizar producto: ${response.data.productUpdate.userErrors[0].message}`)
    }

    console.log("Producto actualizado con éxito")
    return true
  } catch (error) {
    console.error("Error al actualizar producto en Shopify:", error)
    throw new Error(`Error al actualizar producto: ${error instanceof Error ? error.message : "Error desconocido"}`)
  }
}

// Eliminar un producto de Shopify
async function eliminarTutorialDeShopify(shopifyId: string) {
  try {
    console.log(`Eliminando producto con ID: ${shopifyId}`)

    const DELETE_PRODUCT = gql`
      mutation productDelete($input: ProductDeleteInput!) {
        productDelete(input: $input) {
          deletedProductId
          userErrors {
            field
            message
          }
        }
      }
    `

    const response = await shopifyFetch({
      query: DELETE_PRODUCT,
      variables: {
        input: {
          id: shopifyId,
        },
      },
    })

    // Verificar si hay errores en la respuesta
    if (response.errors) {
      console.error("Errores al eliminar producto:", response.errors)
      throw new Error(`Error al eliminar producto: ${response.errors[0].message}`)
    }

    if (response.data?.productDelete?.userErrors?.length > 0) {
      throw new Error(`Error al eliminar producto: ${response.data.productDelete.userErrors[0].message}`)
    }

    console.log("Producto eliminado con éxito")
    return true
  } catch (error) {
    console.error("Error al eliminar producto de Shopify:", error)
    throw new Error(`Error al eliminar producto: ${error instanceof Error ? error.message : "Error desconocido"}`)
  }
}

// Sincronizar todos los tutoriales con Shopify
export async function sincronizarTodosTutorialesConShopify() {
  try {
    console.log("Iniciando sincronización de todos los tutoriales...")

    // Obtener todos los tutoriales publicados
    const { tutoriales } = await getTutoriales({ publicadosOnly: true, limit: 100 })
    console.log(`Encontrados ${tutoriales.length} tutoriales para sincronizar`)

    // Obtener el ID de la colección de tutoriales
    const coleccionId = await obtenerIdColeccionTutoriales()
    console.log(`Usando colección con ID: ${coleccionId}`)

    // Sincronizar cada tutorial
    const resultados = await Promise.allSettled(
      tutoriales.map(async (tutorial) => {
        try {
          console.log(`Sincronizando tutorial: ${tutorial.titulo}`)
          if (tutorial.shopify_id) {
            await actualizarProductoEnShopify(tutorial)
          } else {
            const shopifyId = await crearProductoEnShopify(tutorial, coleccionId)
            await prisma.tutorial.update({
              where: { id: tutorial.id },
              data: { shopify_id: shopifyId },
            })
          }
          return { id: tutorial.id, titulo: tutorial.titulo, success: true }
        } catch (error) {
          console.error(`Error al sincronizar tutorial ${tutorial.id}:`, error)
          return {
            id: tutorial.id,
            titulo: tutorial.titulo,
            success: false,
            error: error instanceof Error ? error.message : "Error desconocido",
          }
        }
      }),
    )

    // Contar éxitos y errores
    const exitos = resultados.filter((r) => r.status === "fulfilled" && (r.value as any).success).length
    const errores = resultados.filter((r) => r.status === "rejected" || !(r.value as any).success).length

    console.log(`Sincronización completada: ${exitos} éxitos, ${errores} errores`)
    return {
      success: true,
      message: `Sincronización completada: ${exitos} tutoriales sincronizados, ${errores} errores`,
      stats: {
        total: tutoriales.length,
        exitos,
        errores,
      },
      detalles: resultados,
    }
  } catch (error) {
    console.error("Error al sincronizar todos los tutoriales:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error desconocido",
      error,
    }
  }
}
