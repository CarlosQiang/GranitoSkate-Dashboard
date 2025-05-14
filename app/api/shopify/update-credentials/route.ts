import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    // Verificar la autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    // Verificar que el usuario tenga permisos de administrador
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "No tienes permisos para realizar esta acción" },
        { status: 403 },
      )
    }

    // Obtener los datos de la solicitud
    const { shopDomain, accessToken } = await request.json()

    // Validar los datos
    if (!shopDomain || !accessToken) {
      return NextResponse.json({ success: false, message: "Faltan datos requeridos" }, { status: 400 })
    }

    // Verificar la conexión con las nuevas credenciales
    const shopifyUrl = `https://${shopDomain}/admin/api/2023-10/graphql.json`
    const testQuery = `
      query {
        shop {
          name
        }
      }
    `

    try {
      const shopifyResponse = await fetch(shopifyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({ query: testQuery }),
      })

      if (!shopifyResponse.ok) {
        // Si la respuesta no es exitosa, devolver un error
        return NextResponse.json(
          {
            success: false,
            message: `Error al verificar las credenciales: ${shopifyResponse.status} ${shopifyResponse.statusText}`,
          },
          { status: 400 },
        )
      }

      // Analizar la respuesta
      const data = await shopifyResponse.json()

      if (data.errors) {
        return NextResponse.json(
          {
            success: false,
            message: `Error en la API de Shopify: ${data.errors[0]?.message || "Error desconocido"}`,
          },
          { status: 400 },
        )
      }

      // En un entorno de producción real, aquí actualizaríamos las variables de entorno
      // Pero en Vercel, esto requiere acceso a la API de Vercel
      // Por ahora, simularemos que se han actualizado correctamente

      // Si todo está bien, devolver éxito
      return NextResponse.json({
        success: true,
        message: `Conexión exitosa con la tienda ${data.data?.shop?.name || shopDomain}`,
        shopName: data.data?.shop?.name,
      })
    } catch (error) {
      console.error("Error al verificar la conexión con Shopify:", error)
      return NextResponse.json(
        {
          success: false,
          message: `Error al verificar la conexión: ${error instanceof Error ? error.message : "Error desconocido"}`,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Error al actualizar las credenciales de Shopify:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
