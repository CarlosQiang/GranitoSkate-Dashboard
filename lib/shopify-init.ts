import { shopifyFetch } from "./shopify"
import { gql } from "graphql-request"

// Función para verificar y crear la colección de tutoriales si no existe
export async function verificarColeccionTutoriales() {
  try {
    console.log("Verificando colección de tutoriales en Shopify...")

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

    const response = await shopifyFetch({
      query: GET_COLLECTION,
      variables: { title: "Tutoriales" },
    })

    // Verificar que la respuesta sea válida
    if (!response || !response.data) {
      throw new Error("Respuesta inválida de la API de Shopify al buscar colección")
    }

    // Si la colección existe, no hacer nada
    if (response.data.collections?.edges?.length > 0) {
      console.log("Colección de tutoriales encontrada:", response.data.collections.edges[0].node.id)
      return {
        success: true,
        message: "La colección de tutoriales ya existe",
        collectionId: response.data.collections.edges[0].node.id,
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

    // Verificar que la respuesta sea válida
    if (!createResponse || !createResponse.data) {
      throw new Error("Respuesta inválida de la API de Shopify al crear colección")
    }

    // Verificar si hay errores en la creación
    if (createResponse.data.collectionCreate?.userErrors?.length > 0) {
      throw new Error(`Error al crear colección: ${createResponse.data.collectionCreate.userErrors[0].message}`)
    }

    // Verificar que se haya creado correctamente
    if (!createResponse.data.collectionCreate?.collection?.id) {
      throw new Error("No se pudo obtener el ID de la colección creada")
    }

    console.log("Colección de tutoriales creada con éxito:", createResponse.data.collectionCreate.collection.id)

    return {
      success: true,
      message: "Colección de tutoriales creada con éxito",
      collectionId: createResponse.data.collectionCreate.collection.id,
    }
  } catch (error) {
    console.error("Error al verificar/crear colección de tutoriales:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error desconocido",
      error,
    }
  }
}

// Función para inicializar todo lo relacionado con Shopify
export async function inicializarShopify() {
  try {
    // Paso 1: Verificar/crear colección de tutoriales
    const coleccionResult = await verificarColeccionTutoriales()

    // Si no se pudo verificar/crear la colección, devolver el error
    if (!coleccionResult.success) {
      return {
        success: false,
        message: `Error al verificar/crear colección de tutoriales: ${coleccionResult.message}`,
        coleccion: coleccionResult,
      }
    }

    return {
      success: true,
      message: "Inicialización de Shopify completada con éxito",
      coleccion: coleccionResult,
    }
  } catch (error) {
    console.error("Error en la inicialización de Shopify:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error desconocido",
      error,
    }
  }
}
