import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ActivityLogger } from "@/lib/services/activity-logger"

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      await ActivityLogger.log({
        accion: "SHOPIFY_API_UNAUTHORIZED",
        entidad: "SHOPIFY",
        descripcion: "Intento de acceso no autorizado a la API de Shopify",
        resultado: "ERROR",
        errorMensaje: "No autorizado",
      })
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar variables de entorno
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain || !accessToken) {
      await ActivityLogger.logSystemError(
        new Error("Configuración de Shopify incompleta"),
        "Variables de entorno faltantes",
        Number.parseInt(session.user.id),
      )
      return NextResponse.json({ error: "Configuración de Shopify incompleta" }, { status: 500 })
    }

    // Obtener el cuerpo de la solicitud
    const body = await request.json()
    const { query, variables } = body

    // Hacer la solicitud a la API de Shopify
    const response = await fetch(`https://${shopDomain}/admin/api/2023-10/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    })

    const duration = Date.now() - startTime

    if (!response.ok) {
      const errorText = await response.text()
      await ActivityLogger.logShopifyCall(
        Number.parseInt(session.user.id),
        session.user.name || "Usuario",
        "GraphQL",
        "POST",
        "ERROR",
        duration,
        `${response.status}: ${errorText}`,
        { query: query.substring(0, 100), variables },
      )

      return NextResponse.json(
        {
          error: `Error en la respuesta de Shopify: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    const data = await response.json()

    // Verificar si hay errores en la respuesta GraphQL
    if (data.errors) {
      await ActivityLogger.logShopifyCall(
        Number.parseInt(session.user.id),
        session.user.name || "Usuario",
        "GraphQL",
        "POST",
        "ERROR",
        duration,
        `GraphQL errors: ${JSON.stringify(data.errors)}`,
        { query: query.substring(0, 100), variables },
      )

      return NextResponse.json(
        {
          error: "Error en la consulta GraphQL",
          details: data.errors,
        },
        { status: 400 },
      )
    }

    // Registrar llamada exitosa
    await ActivityLogger.logShopifyCall(
      Number.parseInt(session.user.id),
      session.user.name || "Usuario",
      "GraphQL",
      "POST",
      "SUCCESS",
      duration,
      undefined,
      { query: query.substring(0, 100), variables },
    )

    return NextResponse.json(data)
  } catch (error) {
    const duration = Date.now() - startTime
    await ActivityLogger.logSystemError(
      error as Error,
      "Error en el proxy de Shopify",
      Number.parseInt((await getServerSession(authOptions))?.user?.id || "0"),
    )

    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({ error: "Método no permitido. Use POST para consultas GraphQL." }, { status: 405 })
}
