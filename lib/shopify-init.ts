import { shopifyFetch } from "./shopify"
import { gql } from "graphql-request"

// Función para verificar y crear la colección de tutoriales si no existe
export async function verificarColeccionTutoriales() {
  try {
    console.log("Verificando colección de tutoriales en Shopify...")

    // Verificar que tenemos las credenciales de Shopify
    const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const shopifyToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopifyDomain || !shopifyToken) {
      throw new Error("Faltan credenciales de Shopify. Verifica las variables de entorno.")
    }

    // Buscar la colección por título usando una consulta más simple
    const GET_COLLECTION = gql`
      {
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

    // Si la colección existe, no hacer nada
    if (response.data.collections?.edges?.length > 0) {
      const coleccion = response.data.collections.edges.find((edge: any) => edge.node.title === "Tutoriales")

      if (coleccion) {
        console.log("Colección de tutoriales encontrada:", coleccion.node.id)
        return {
          success: true,
          message: "La colección de tutoriales ya existe",
          collectionId: coleccion.node.id,
        }
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
