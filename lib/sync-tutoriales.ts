import { prisma } from "./prisma"
import { shopifyFetch } from "./shopify"
import { gql } from "graphql-request"
import { verificarColeccionTutoriales } from "./shopify-init"
import { slugify } from "./utils"

// Función principal para sincronizar tutoriales entre la base de datos y Shopify
export async function sincronizarTutorialesBidireccional() {
  try {
    console.log("Iniciando sincronización bidireccional de tutoriales...")

    // Paso 1: Verificar que la colección de tutoriales exista
    const coleccionResult = await verificarColeccionTutoriales()
    if (!coleccionResult.success) {
      throw new Error(`No se pudo verificar la colección de tutoriales: ${coleccionResult.message}`)
    }

    const coleccionId = coleccionResult.collectionId

    // Paso 2: Obtener todos los tutoriales de la base de datos
    const tutorialesDB = await prisma.tutorial.findMany()
    console.log(`Encontrados ${tutorialesDB.length} tutoriales en la base de datos`)

    // Paso 3: Obtener todos los productos de la colección "Tutoriales" de Shopify
    const productosShopify = await obtenerProductosColeccionTutoriales(coleccionId)
    console.log(`Encontrados ${productosShopify.length} productos en la colección Tutoriales de Shopify`)

    // Paso 4: Sincronizar de Shopify a la base de datos (productos que existen en Shopify pero no en la BD)
    const resultadoShopifyADB = await sincronizarShopifyABaseDeDatos(productosShopify, tutorialesDB)

    // Paso 5: Sincronizar de la base de datos a Shopify (tutoriales que existen en la BD pero no en Shopify)
    const resultadoDBAShopify = await sincronizarBaseDeDatosAShopify(tutorialesDB, productosShopify, coleccionId)

    // Paso 6: Actualizar tutoriales que existen en ambos lugares pero pueden tener diferencias
    const resultadoActualizaciones = await actualizarTutorialesExistentes(tutorialesDB, productosShopify)

    return {
      success: true,
      message: "Sincronización bidireccional completada con éxito",
      stats: {
        totalDB: tutorialesDB.length,
        totalShopify: productosShopify.length,
        creadosEnDB: resultadoShopifyADB.creados,
        creadosEnShopify: resultadoDBAShopify.creados,
        actualizados: resultadoActualizaciones.actualizados,
        errores:
          resultadoShopifyADB.errores.length +
          resultadoDBAShopify.errores.length +
          resultadoActualizaciones.errores.length,
      },
      errores: [...resultadoShopifyADB.errores, ...resultadoDBAShopify.errores, ...resultadoActualizaciones.errores],
    }
  } catch (error) {
    console.error("Error en la sincronización bidireccional:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error desconocido en la sincronización",
      error,
    }
  }
}

// Obtener todos los productos de la colección "Tutoriales" de Shopify
async function obtenerProductosColeccionTutoriales(coleccionId: string) {
  try {
    const GET_PRODUCTS = gql`
      query getProductsInCollection($collectionId: ID!, $first: Int!) {
        collection(id: $collectionId) {
          products(first: $first) {
            edges {
              node {
                id
                title
                description
                descriptionHtml
                productType
                tags
                publishedAt
                status
                metafields(first: 10) {
                  edges {
                    node {
                      namespace
                      key
                      value
                      type
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

    const response = await shopifyFetch({
      query: GET_PRODUCTS,
      variables: {
        collectionId,
        first: 250, // Máximo número de productos a obtener, ajustar según necesidad
      },
    })

    // Verificar que la respuesta sea válida
    if (!response || !response.data) {
      console.error("Respuesta inválida al obtener productos de la colección")
      return []
    }

    // Verificar que la colección exista
    if (!response.data.collection) {
      console.error("La colección no existe o no se pudo acceder a ella")
      return []
    }

    // Verificar que la colección tenga productos
    if (!response.data.collection.products?.edges) {
      console.log("La colección no tiene productos")
      return []
    }

    return response.data.collection.products.edges.map((edge: any) => edge.node)
  } catch (error) {
    console.error("Error al obtener productos de la colección:", error)
    return []
  }
}

// Sincronizar productos de Shopify a la base de datos
async function sincronizarShopifyABaseDeDatos(productosShopify: any[], tutorialesDB: any[]) {
  let creados = 0
  const errores: any[] = []

  // Mapear IDs de Shopify a IDs de la base de datos para comparación rápida
  const shopifyIdsEnDB = new Map(tutorialesDB.map((tutorial) => [tutorial.shopify_id, tutorial.id]))

  // Procesar cada producto de Shopify
  for (const producto of productosShopify) {
    try {
      // Si el producto ya existe en la base de datos, omitirlo
      if (shopifyIdsEnDB.has(producto.id)) {
        continue
      }

      console.log(`Creando tutorial en la base de datos desde Shopify: ${producto.title}`)

      // Extraer metadatos
      const metafields = producto.metafields?.edges?.map((edge: any) => edge.node) || []
      const nivelDificultad =
        metafields.find((m: any) => m.namespace === "tutorial" && m.key === "nivel_dificultad")?.value || "intermedio"

      const tiempoEstimado =
        metafields.find((m: any) => m.namespace === "tutorial" && m.key === "tiempo_estimado")?.value || "0"

      // Crear slug a partir del título
      const slug = slugify(producto.title)

      // Extraer contenido del HTML
      let contenido = producto.descriptionHtml || producto.description || ""
      // Limpiar el HTML básico para obtener solo el contenido
      contenido = contenido
        .replace(/<div>(.*?)<\/div>/g, "$1")
        .replace(/<p>(.*?)<\/p>/g, "$1")
        .replace(/<br\s*\/?>/g, "\n")
        .replace(/&nbsp;/g, " ")

      // Crear el tutorial en la base de datos
      await prisma.tutorial.create({
        data: {
          titulo: producto.title,
          slug,
          descripcion: producto.description || "",
          contenido,
          nivel_dificultad: nivelDificultad as "principiante" | "intermedio" | "avanzado",
          tiempo_estimado: Number.parseInt(tiempoEstimado, 10) || 0,
          categorias: producto.productType ? [producto.productType] : [],
          tags: producto.tags || [],
          publicado: producto.status === "ACTIVE",
          destacado: false, // Por defecto no destacado
          fecha_publicacion: producto.publishedAt ? new Date(producto.publishedAt) : null,
          fecha_creacion: new Date(),
          shopify_id: producto.id,
        },
      })

      creados++
    } catch (error) {
      console.error(`Error al crear tutorial desde Shopify: ${producto.title}`, error)
      errores.push({
        tipo: "shopify_a_db",
        producto: producto.title,
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  return { creados, errores }
}

// Sincronizar tutoriales de la base de datos a Shopify
async function sincronizarBaseDeDatosAShopify(tutorialesDB: any[], productosShopify: any[], coleccionId: string) {
  let creados = 0
  const errores: any[] = []

  // Mapear IDs de Shopify para comparación rápida
  const idsEnShopify = new Set(productosShopify.map((p) => p.id))

  // Procesar cada tutorial de la base de datos
  for (const tutorial of tutorialesDB) {
    try {
      // Si el tutorial ya existe en Shopify y tiene ID, omitirlo
      if (tutorial.shopify_id && idsEnShopify.has(tutorial.shopify_id)) {
        continue
      }

      // Si el tutorial no está publicado, omitirlo
      if (!tutorial.publicado) {
        continue
      }

      console.log(`Creando producto en Shopify desde la base de datos: ${tutorial.titulo}`)

      // Crear el producto en Shopify
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

      // Verificar que la respuesta sea válida
      if (!response || !response.data) {
        throw new Error("Respuesta inválida de la API de Shopify al crear producto")
      }

      if (response.data.productCreate?.userErrors?.length > 0) {
        throw new Error(`Error al crear producto: ${response.data.productCreate.userErrors[0].message}`)
      }

      // Verificar que se haya creado correctamente
      if (!response.data.productCreate?.product?.id) {
        throw new Error("No se pudo obtener el ID del producto creado")
      }

      // Actualizar el ID de Shopify en la base de datos
      await prisma.tutorial.update({
        where: { id: tutorial.id },
        data: { shopify_id: response.data.productCreate.product.id },
      })

      creados++
    } catch (error) {
      console.error(`Error al crear producto en Shopify: ${tutorial.titulo}`, error)
      errores.push({
        tipo: "db_a_shopify",
        tutorial: tutorial.titulo,
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  return { creados, errores }
}

// Actualizar tutoriales que existen en ambos lugares pero pueden tener diferencias
async function actualizarTutorialesExistentes(tutorialesDB: any[], productosShopify: any[]) {
  let actualizados = 0
  const errores: any[] = []

  // Crear mapa de productos de Shopify por ID para búsqueda rápida
  const productosShopifyMap = new Map(productosShopify.map((producto) => [producto.id, producto]))

  // Procesar cada tutorial de la base de datos que ya tiene un ID de Shopify
  for (const tutorial of tutorialesDB.filter((t) => t.shopify_id)) {
    try {
      const productoShopify = productosShopifyMap.get(tutorial.shopify_id)

      // Si no encontramos el producto en Shopify, continuar
      if (!productoShopify) {
        continue
      }

      // Verificar si hay diferencias significativas que requieran actualización
      const requiereActualizacion =
        tutorial.titulo !== productoShopify.title || tutorial.publicado !== (productoShopify.status === "ACTIVE")
      // Podríamos añadir más comparaciones aquí

      if (requiereActualizacion) {
        console.log(`Actualizando producto en Shopify: ${tutorial.titulo}`)

        // Actualizar el producto en Shopify
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

        // Verificar que la respuesta sea válida
        if (!response || !response.data) {
          throw new Error("Respuesta inválida de la API de Shopify al actualizar producto")
        }

        if (response.data.productUpdate?.userErrors?.length > 0) {
          throw new Error(`Error al actualizar producto: ${response.data.productUpdate.userErrors[0].message}`)
        }

        actualizados++
      }
    } catch (error) {
      console.error(`Error al actualizar producto en Shopify: ${tutorial.titulo}`, error)
      errores.push({
        tipo: "actualizacion",
        tutorial: tutorial.titulo,
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  return { actualizados, errores }
}
