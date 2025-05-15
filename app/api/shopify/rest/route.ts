import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Logger } from "next-axiom"

const logger = new Logger({
  source: "api-shopify-rest",
})

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      logger.warn("Intento de acceso no autorizado a la API REST de Shopify")
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar variables de entorno
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain || !accessToken) {
      logger.error("Configuración de Shopify incompleta", {
        hasDomain: !!shopDomain,
        hasToken: !!accessToken,
      })

      return NextResponse.json({ error: "Configuración de Shopify incompleta" }, { status: 500 })
    }

    // Obtener la ruta de la solicitud
    const { searchParams } = new URL(request.url)
    const path = searchParams.get("path")

    if (!path) {
      return NextResponse.json({ error: "Falta el parámetro 'path'" }, { status: 400 })
    }

    logger.debug("Enviando solicitud REST GET a Shopify", { path })

    // Hacer la solicitud a la API REST de Shopify
    const response = await fetch(`https://${shopDomain}/admin/api/2023-10/${path}`, {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    })

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      const errorText = await response.text()
      logger.error(`Error en la respuesta REST de Shopify (${response.status})`, { errorText })

      return NextResponse.json(
        {
          error: `Error en la respuesta de Shopify: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    // Devolver la respuesta
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    logger.error("Error en el proxy REST de Shopify", {
      error: error instanceof Error ? error.message : "Error desconocido",
    })

    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      logger.warn("Intento de acceso no autorizado a la API REST de Shopify")
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar variables de entorno
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain || !accessToken) {
      logger.error("Configuración de Shopify incompleta", {
        hasDomain: !!shopDomain,
        hasToken: !!accessToken,
      })

      return NextResponse.json({ error: "Configuración de Shopify incompleta" }, { status: 500 })
    }

    // Obtener el cuerpo de la solicitud
    const body = await request.json()
    const { path, data } = body

    if (!path) {
      return NextResponse.json({ error: "Falta el parámetro 'path'" }, { status: 400 })
    }

    logger.debug("Enviando solicitud REST POST a Shopify", { path })

    // Hacer la solicitud a la API REST de Shopify
    const response = await fetch(`https://${shopDomain}/admin/api/2023-10/${path}`, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      const errorText = await response.text()
      logger.error(`Error en la respuesta REST de Shopify (${response.status})`, { errorText })

      return NextResponse.json(
        {
          error: `Error en la respuesta de Shopify: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    // Devolver la respuesta
    const responseData = await response.json()
    return NextResponse.json(responseData)
  } catch (error) {
    logger.error("Error en el proxy REST de Shopify", {
      error: error instanceof Error ? error.message : "Error desconocido",
    })

    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      logger.warn("Intento de acceso no autorizado a la API REST de Shopify")
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar variables de entorno
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain || !accessToken) {
      logger.error("Configuración de Shopify incompleta", {
        hasDomain: !!shopDomain,
        hasToken: !!accessToken,
      })

      return NextResponse.json({ error: "Configuración de Shopify incompleta" }, { status: 500 })
    }

    // Obtener el cuerpo de la solicitud
    const body = await request.json()
    const { path, data } = body

    if (!path) {
      return NextResponse.json({ error: "Falta el parámetro 'path'" }, { status: 400 })
    }

    logger.debug("Enviando solicitud REST PUT a Shopify", { path })

    // Hacer la solicitud a la API REST de Shopify
    const response = await fetch(`https://${shopDomain}/admin/api/2023-10/${path}`, {
      method: "PUT",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      const errorText = await response.text()
      logger.error(`Error en la respuesta REST de Shopify (${response.status})`, { errorText })

      return NextResponse.json(
        {
          error: `Error en la respuesta de Shopify: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    // Devolver la respuesta
    const responseData = await response.json()
    return NextResponse.json(responseData)
  } catch (error) {
    logger.error("Error en el proxy REST de Shopify", {
      error: error instanceof Error ? error.message : "Error desconocido",
    })

    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      logger.warn("Intento de acceso no autorizado a la API REST de Shopify")
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar variables de entorno
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN

    if (!shopDomain || !accessToken) {
      logger.error("Configuración de Shopify incompleta", {
        hasDomain: !!shopDomain,
        hasToken: !!accessToken,
      })

      return NextResponse.json({ error: "Configuración de Shopify incompleta" }, { status: 500 })
    }

    // Obtener la ruta de la solicitud
    const { searchParams } = new URL(request.url)
    const path = searchParams.get("path")

    if (!path) {
      return NextResponse.json({ error: "Falta el parámetro 'path'" }, { status: 400 })
    }

    logger.debug("Enviando solicitud REST DELETE a Shopify", { path })

    // Hacer la solicitud a la API REST de Shopify
    const response = await fetch(`https://${shopDomain}/admin/api/2023-10/${path}`, {
      method: "DELETE",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    })

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      const errorText = await response.text()
      logger.error(`Error en la respuesta REST de Shopify (${response.status})`, { errorText })

      return NextResponse.json(
        {
          error: `Error en la respuesta de Shopify: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    // Devolver la respuesta
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Error en el proxy REST de Shopify", {
      error: error instanceof Error ? error.message : "Error desconocido",
    })

    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
