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
async function obtenerOCrearColeccionTutoriales() {
  // Buscar la colección por título
  const GET_COLLECTION = gql`
    query getCollectionByTitle($title: String!) {
      collections(first: 1, query: $title) {
        edges {
          node {
            id
            title
          }
        }
      }
    }
  `

  const { data } = await shopifyFetch({
    query: GET_COLLECTION,
    variables: { title: "Tutoriales" },
  })

  // Si la colección existe, devolver su ID
  if (data?.collections?.edges?.length > 0) {
    return data.collections.edges[0].node.id
  }

  // Si no existe, crear la colección
  const CREATE_COLLECTION = gql`
    mutation createCollection($input: CollectionInput!) {
      collectionCreate(input: $input) {
        collection {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `

  const { data: createData } = await shopifyFetch({
    query: CREATE_COLLECTION,
    variables: {
      input: {
        title: "Tutoriales",
        descriptionHtml: "Colección de tutoriales y guías para skaters de todos los niveles",
      },
    },
  })

  if (createData?.collectionCreate?.userErrors?.length > 0) {
    throw new Error(`Error al crear colección: ${createData.collectionCreate.userErrors[0].message}`)
  }

  return createData.collectionCreate.collection.id
}

// Crear un nuevo producto en Shopify para el tutorial
async function crearProductoEnShopify(tutorial: any, coleccionId: string) {
  const CREATE_PRODUCT = gql`
    mutation createProduct($input: ProductInput!) {
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

  const { data } = await shopifyFetch({
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

  if (data?.productCreate?.userErrors?.length > 0) {
    throw new Error(`Error al crear producto: ${data.productCreate.userErrors[0].message}`)
  }

  return data.productCreate.product.id
}

// Actualizar un producto existente en Shopify
async function actualizarProductoEnShopify(tutorial: any) {
  const UPDATE_PRODUCT = gql`
    mutation updateProduct($input: ProductInput!) {
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

  const { data } = await shopifyFetch({
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

  if (data?.productUpdate?.userErrors?.length > 0) {
    throw new Error(`Error al actualizar producto: ${data.productUpdate.userErrors[0].message}`)
  }

  return true
}

// Eliminar un producto de Shopify
async function eliminarTutorialDeShopify(shopifyId: string) {
  const DELETE_PRODUCT = gql`
    mutation deleteProduct($input: ProductDeleteInput!) {
      productDelete(input: $input) {
        deletedProductId
        userErrors {
          field
          message
        }
      }
    }
  `

  const { data } = await shopifyFetch({
    query: DELETE_PRODUCT,
    variables: {
      input: {
        id: shopifyId,
      },
    },
  })

  if (data?.productDelete?.userErrors?.length > 0) {
    throw new Error(`Error al eliminar producto: ${data.productDelete.userErrors[0].message}`)
  }

  return true
}
