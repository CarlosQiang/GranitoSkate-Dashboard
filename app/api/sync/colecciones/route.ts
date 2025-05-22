import { NextResponse } from "next/server"
import { shopifyConfig } from "@/lib/config/shopify"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    // Verificar que las variables de entorno estén configuradas
    if (!shopifyConfig.shopDomain || !shopifyConfig.accessToken) {
      return NextResponse.json({ error: "Faltan credenciales de Shopify en las variables de entorno" }, { status: 500 })
    }

    // Construir la URL de la API de Shopify para colecciones personalizadas
    const customCollectionsUrl = `https://${shopifyConfig.shopDomain}/admin/api/${shopifyConfig.apiVersion}/custom_collections.json?limit=50`

    // Realizar la petición a Shopify para colecciones personalizadas
    const customCollectionsResponse = await fetch(customCollectionsUrl, {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": shopifyConfig.accessToken,
      },
    })

    // Verificar si la respuesta es exitosa
    if (!customCollectionsResponse.ok) {
      const errorText = await customCollectionsResponse.text()
      console.error(`Error en la respuesta de Shopify (${customCollectionsResponse.status}):`, errorText)
      return NextResponse.json(
        { error: `Error al obtener colecciones personalizadas de Shopify: ${customCollectionsResponse.statusText}` },
        { status: customCollectionsResponse.status },
      )
    }

    // Obtener los datos de las colecciones personalizadas
    const customCollectionsData = await customCollectionsResponse.json()
    const customCollections = customCollectionsData.custom_collections || []

    // Construir la URL de la API de Shopify para colecciones inteligentes
    const smartCollectionsUrl = `https://${shopifyConfig.shopDomain}/admin/api/${shopifyConfig.apiVersion}/smart_collections.json?limit=50`

    // Realizar la petición a Shopify para colecciones inteligentes
    const smartCollectionsResponse = await fetch(smartCollectionsUrl, {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": shopifyConfig.accessToken,
      },
    })

    // Verificar si la respuesta es exitosa
    if (!smartCollectionsResponse.ok) {
      const errorText = await smartCollectionsResponse.text()
      console.error(`Error en la respuesta de Shopify (${smartCollectionsResponse.status}):`, errorText)
      return NextResponse.json(
        { error: `Error al obtener colecciones inteligentes de Shopify: ${smartCollectionsResponse.statusText}` },
        { status: smartCollectionsResponse.status },
      )
    }

    // Obtener los datos de las colecciones inteligentes
    const smartCollectionsData = await smartCollectionsResponse.json()
    const smartCollections = smartCollectionsData.smart_collections || []

    // Combinar las colecciones personalizadas e inteligentes
    const allCollections = [...customCollections, ...smartCollections]

    // Transformar los datos para guardarlos en la base de datos
    const transformedCollections = allCollections.map((collection) => ({
      id: collection.id.toString(),
      shopify_id: collection.id.toString(),
      title: collection.title,
      titulo: collection.title,
      description: collection.body_html,
      descripcion: collection.body_html,
      image: collection.image?.src || null,
      imagen_url: collection.image?.src || null,
      handle: collection.handle,
      url: collection.handle,
      updated_at: collection.updated_at,
      published_at: collection.published_at,
      products_count: collection.products_count || 0,
      productos_count: collection.products_count || 0,
    }))

    // Aquí iría la lógica para guardar las colecciones en la base de datos
    // Por ahora, solo devolvemos las colecciones transformadas
    return NextResponse.json({
      success: true,
      message: `${transformedCollections.length} colecciones sincronizadas correctamente`,
      count: transformedCollections.length,
      data: transformedCollections,
    })
  } catch (error: any) {
    console.error("Error al sincronizar colecciones:", error)
    return NextResponse.json({ error: `Error al sincronizar colecciones: ${error.message}` }, { status: 500 })
  }
}
