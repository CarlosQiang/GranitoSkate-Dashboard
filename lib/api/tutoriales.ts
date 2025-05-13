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

  // Verificar si la colección de tutoriales existe, si no, crearla
  const coleccionId = await obtenerOCrearColeccionTutoriales()

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

// Obtener o crear la colección de tutoriales en Shopify
export async function obtenerOCrearColeccionTutoriales() {
  try {
    // Buscar la colección por título
    const GET_COLLECTION = gql`
      query {
        collections(first: 10, query: "title:Tutoriales") {
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
      query: GET_COLLECTION,
    })

    // Verificar si hay errores en la respuesta
    if (response.errors) {
      console.error("Errores al buscar colección:", response.errors)
      throw new Error(`Error al buscar colección: ${response.errors[0].message}`)
    }

    // Verificar que la respuesta sea válida
    if (!response || !response.data) {
      throw new Error("Respuesta inválida de la API de Shopify al buscar colección")
    }

    console.log("Respuesta de búsqueda de colección:", response.data)

    // Si la colección existe, devolver su ID
    if (response.data.collections?.edges?.length > 0) {
      const coleccion = response.data.collections.edges.find((edge: any) => edge.node.title === "Tutoriales")

      if (coleccion) {
        console.log("Colección de tutoriales encontrada:", coleccion.node.id)
        return coleccion.node.id
      }
    }

    // Si no existe, crear la colección
    console.log("Colección de tutoriales no encontrada. Creando...")

    const CREATE_COLLECTION = gql`
      mutation createCollection($input: CollectionInput!) {
        collectionCreate(input: $input) {
          collection {
            id
            title
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const createResponse = await shopifyFetch({
      query: CREATE_COLLECTION,
      variables: {
        input: {
          title: "Tutoriales",
          descriptionHtml: "Colección de tutoriales y guías para skaters de todos los niveles",
          published: true,
        },
      },
    })

    // Verificar si hay errores en la respuesta
    if (createResponse.errors) {
      console.error("Errores al crear colección:", createResponse.errors)
      throw new Error(`Error al crear colección: ${createResponse.errors[0].message}`)
    }

    // Verificar que la respuesta sea válida
    if (!createResponse || !createResponse.data) {
      throw new Error("Respuesta inválida de la API de Shopify al crear colección")
    }

    console.log("Respuesta de creación de colección:", createResponse.data)

    // Verificar si hay errores en la creación
    if (createResponse.data.collectionCreate?.userErrors?.length > 0) {
      throw new Error(`Error al crear colección: ${createResponse.data.collectionCreate.userErrors[0].message}`)
    }

    // Verificar que se haya creado correctamente
    if (!createResponse.data.collectionCreate?.collection?.id) {
      throw new Error("No se pudo obtener el ID de la colección creada")
    }

    console.log("Colección de tutoriales creada con éxito:", createResponse.data.collectionCreate.collection.id)

    return createResponse.data.collectionCreate.collection.id
  } catch (error) {
    console.error("Error al obtener/crear colección de tutoriales:", error)
    throw new Error(
      `No se pudo obtener o crear la colección de tutoriales: ${error instanceof Error ? error.message : "Error desconocido"}`,
    )
  }
}

// Crear un nuevo producto en Shopify para el tutorial
async function crearProductoEnShopify(tutorial: any, coleccionId: string) {
  try {
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

    return response.data.productCreate.product.id
  } catch (error) {
    console.error("Error al crear producto en Shopify:", error)
    throw new Error(`Error al crear producto: ${error instanceof Error ? error.message : "Error desconocido"}`)
  }
}

// Actualizar un producto existente en Shopify
async function actualizarProductoEnShopify(tutorial: any) {
  try {
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

    return true
  } catch (error) {
    console.error("Error al actualizar producto en Shopify:", error)
    throw new Error(`Error al actualizar producto: ${error instanceof Error ? error.message : "Error desconocido"}`)
  }
}

// Eliminar un producto de Shopify
async function eliminarTutorialDeShopify(shopifyId: string) {
  try {
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

    return true
  } catch (error) {
    console.error("Error al eliminar producto de Shopify:", error)
    throw new Error(`Error al eliminar producto: ${error instanceof Error ? error.message : "Error desconocido"}`)
  }
}

// Sincronizar todos los tutoriales con Shopify
export async function sincronizarTodosTutorialesConShopify() {
  try {
    // Obtener todos los tutoriales publicados
    const { tutoriales } = await getTutoriales({ publicadosOnly: true, limit: 100 })

    // Verificar si la colección de tutoriales existe, si no, crearla
    const coleccionId = await obtenerOCrearColeccionTutoriales()

    // Sincronizar cada tutorial
    const resultados = await Promise.allSettled(
      tutoriales.map(async (tutorial) => {
        try {
          if (tutorial.shopify_id) {
            await actualizarProductoEnShopify(tutorial)
          } else {
            const shopifyId = await crearProductoEnShopify(tutorial, coleccionId)
            await prisma.tutorial.update({
              where: { id: tutorial.id },
              data: { shopify_id: shopifyId },
            })
          }
          return { id: tutorial.id, success: true }
        } catch (error) {
          return {
            id: tutorial.id,
            success: false,
            error: error instanceof Error ? error.message : "Error desconocido",
          }
        }
      }),
    )

    // Contar éxitos y errores
    const exitos = resultados.filter((r) => r.status === "fulfilled" && (r.value as any).success).length
    const errores = resultados.filter((r) => r.status === "rejected" || !(r.value as any).success).length

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
