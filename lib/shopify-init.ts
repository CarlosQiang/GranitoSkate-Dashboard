import { shopifyFetch } from "./shopify"
import { gql } from "graphql-request"
import { sincronizarTutorialesBidireccional } from "./sync-tutoriales"

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

    const { data } = await shopifyFetch({
      query: GET_COLLECTION,
      variables: { title: "Tutoriales" },
    })

    // Si la colección existe, no hacer nada
    if (data?.collections?.edges?.length > 0) {
      console.log("Colección de tutoriales encontrada:", data.collections.edges[0].node.id)
      return {
        success: true,
        message: "La colección de tutoriales ya existe",
        collectionId: data.collections.edges[0].node.id,
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

    const { data: createData } = await shopifyFetch({
      query: CREATE_COLLECTION,
      variables: {
        input: {
          title: "Tutoriales",
          descriptionHtml: "Colección de tutoriales y guías para skaters de todos los niveles",
          published: true,
        },
      },
    })

    if (createData?.collectionCreate?.userErrors?.length > 0) {
      throw new Error(`Error al crear colección: ${createData.collectionCreate.userErrors[0].message}`)
    }

    console.log("Colección de tutoriales creada con éxito:", createData.collectionCreate.collection.id)

    return {
      success: true,
      message: "Colección de tutoriales creada con éxito",
      collectionId: createData.collectionCreate.collection.id,
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
    if (!coleccionResult.success) {
      throw new Error(`Error al verificar/crear colección de tutoriales: ${coleccionResult.message}`)
    }

    // Paso 2: Sincronizar tutoriales bidireccionalmente
    const sincronizacionResult = await sincronizarTutorialesBidireccional()

    return {
      success: true,
      coleccion: coleccionResult,
      sincronizacion: sincronizacionResult,
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
