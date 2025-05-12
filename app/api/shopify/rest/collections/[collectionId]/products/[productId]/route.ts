import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { collectionId: string; productId: string } },
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { collectionId, productId } = params

    if (!collectionId || !productId) {
      return NextResponse.json({ error: "Se requieren los IDs de colección y producto" }, { status: 400 })
    }

    console.log(`Intentando eliminar producto ${productId} de la colección ${collectionId}`)

    // Obtener las variables de entorno
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain || !accessToken) {
      return NextResponse.json({ error: "Faltan variables de entorno para Shopify" }, { status: 500 })
    }

    // En lugar de usar la API REST directa de Shopify, usaremos la API GraphQL
    // que es más confiable para esta operación específica
    const shopifyGraphQLEndpoint = `https://${shopDomain}/admin/api/2023-07/graphql.json`

    // Asegurarse de que los IDs tengan el formato correcto para GraphQL
    const formattedCollectionId = collectionId.includes("gid://shopify/Collection/")
      ? collectionId
      : `gid://shopify/Collection/${collectionId}`

    const formattedProductId = productId.includes("gid://shopify/Product/")
      ? productId
      : `gid://shopify/Product/${productId}`

    // Crear la mutación GraphQL
    const graphqlQuery = {
      query: `
        mutation collectionRemoveProducts($id: ID!, $productIds: [ID!]!) {
          collectionRemoveProducts(id: $id, productIds: $productIds) {
            job {
              id
              done
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      variables: {
        id: formattedCollectionId,
        productIds: [formattedProductId],
      },
    }

    console.log("Enviando solicitud GraphQL:", JSON.stringify(graphqlQuery, null, 2))

    // Realizar la solicitud a la API GraphQL de Shopify
    const response = await fetch(shopifyGraphQLEndpoint, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(graphqlQuery),
    })

    const responseData = await response.json()
    console.log("Respuesta de Shopify:", JSON.stringify(responseData, null, 2))

    if (!response.ok || (responseData.errors && responseData.errors.length > 0)) {
      const errorMessage = responseData.errors
        ? responseData.errors[0].message
        : `Error ${response.status}: ${response.statusText}`

      console.error("Error en la respuesta de Shopify:", errorMessage)
      return NextResponse.json({ error: errorMessage }, { status: response.status || 500 })
    }

    // Verificar si hay errores de usuario en la respuesta
    if (responseData.data?.collectionRemoveProducts?.userErrors?.length > 0) {
      const userError = responseData.data.collectionRemoveProducts.userErrors[0]
      console.error("Error de usuario en la respuesta de Shopify:", userError.message)
      return NextResponse.json({ error: userError.message }, { status: 400 })
    }

    // Devolver respuesta exitosa
    return NextResponse.json({
      success: true,
      job: responseData.data?.collectionRemoveProducts?.job || null,
    })
  } catch (error) {
    console.error("Error al procesar la solicitud:", error)
    return NextResponse.json({ error: `Error al eliminar producto de la colección: ${error.message}` }, { status: 500 })
  }
}
