import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { shopifyFetch } from "@/lib/shopify"

// Marcar la ruta como dinámica para evitar errores de renderizado estático
export const dynamic = "force-dynamic"

// Función para registrar la sincronización
async function registrarSincronizacion(
  tipoEntidad: string,
  entidadId: string | null,
  accion: string,
  resultado: string,
  mensaje: string,
  detalles?: any,
) {
  try {
    await sql`
      INSERT INTO registro_sincronizacion (
        tipo_entidad, entidad_id, accion, resultado, mensaje, detalles, fecha
      ) VALUES (
        ${tipoEntidad}, ${entidadId}, ${accion}, ${resultado}, ${mensaje}, 
        ${detalles ? JSON.stringify(detalles) : null}, NOW()
      )
    `
  } catch (error) {
    console.error("Error al registrar sincronización:", error)
  }
}

// Función para obtener clientes de Shopify
async function obtenerClientesDeShopify(limit = 20) {
  try {
    // Registrar inicio de la obtención
    await registrarSincronizacion(
      "clientes",
      null,
      "consulta",
      "iniciado",
      `Obteniendo clientes de Shopify (límite: ${limit})`,
    )

    // Consulta GraphQL para obtener clientes
    const query = `
      query {
        customers(first: ${limit}) {
          edges {
            node {
              id
              firstName
              lastName
              email
              phone
              displayName
              ordersCount
              totalSpent
              createdAt
              defaultAddress {
                address1
                address2
                city
                province
                country
                zip
                phone
              }
            }
          }
        }
      }
    `

    // Realizar la consulta a Shopify a través del proxy
    const response = await shopifyFetch({ query })

    // Verificar si hay errores en la respuesta
    if (response.errors) {
      const errorMessage = response.errors.map((e) => e.message).join(", ")
      throw new Error(`Error en la API de Shopify: ${errorMessage}`)
    }

    if (!response.data || !response.data.customers) {
      throw new Error("No se pudieron obtener clientes de Shopify: respuesta vacía o inválida")
    }

    // Registrar éxito de la obtención
    const customerCount = response.data.customers.edges.length
    await registrarSincronizacion(
      "clientes",
      null,
      "consulta",
      "completado",
      `Se obtuvieron ${customerCount} clientes de Shopify`,
    )

    return response.data.customers.edges.map((edge: any) => edge.node)
  } catch (error) {
    // Registrar error
    await registrarSincronizacion(
      "clientes",
      null,
      "consulta",
      "error",
      `Error al obtener clientes de Shopify: ${error.message}`,
    )
    console.error("Error al obtener clientes de Shopify:", error)
    throw error
  }
}

// Función para guardar clientes en la base de datos
async function guardarClientesEnBD(clientes) {
  try {
    // Registrar inicio del guardado
    await registrarSincronizacion(
      "clientes",
      null,
      "guardar",
      "iniciado",
      `Guardando ${clientes.length} clientes en la base de datos`,
    )

    // Guardar cada cliente en la base de datos
    for (const cliente of clientes) {
      const shopifyId = cliente.id.split("/").pop()
      const firstName = cliente.firstName || ""
      const lastName = cliente.lastName || ""
      const email = cliente.email || ""
      const phone = cliente.phone || ""
      const displayName = cliente.displayName || ""
      const ordersCount = cliente.ordersCount || 0
      const totalSpent = cliente.totalSpent || "0.00"

      // Datos adicionales en JSON
      const datosAdicionales = {
        createdAt: cliente.createdAt,
        defaultAddress: cliente.defaultAddress,
      }

      // Verificar si el cliente ya existe
      const existingCustomer = await sql`
        SELECT id FROM clientes WHERE shopify_id = ${shopifyId}
      `

      if (existingCustomer.rows.length > 0) {
        // Actualizar cliente existente
        await sql`
          UPDATE clientes 
          SET 
            nombre = ${firstName},
            apellido = ${lastName},
            email = ${email},
            telefono = ${phone},
            nombre_completo = ${displayName},
            pedidos_count = ${ordersCount},
            total_gastado = ${totalSpent},
            datos_adicionales = ${JSON.stringify(datosAdicionales)},
            actualizado_en = NOW()
          WHERE shopify_id = ${shopifyId}
        `

        await registrarSincronizacion(
          "clientes",
          shopifyId,
          "actualizar",
          "completado",
          `Cliente actualizado: ${displayName}`,
        )
      } else {
        // Insertar nuevo cliente
        await sql`
          INSERT INTO clientes (
            shopify_id, nombre, apellido, email, telefono, 
            nombre_completo, pedidos_count, total_gastado, 
            datos_adicionales, creado_en, actualizado_en
          ) VALUES (
            ${shopifyId}, ${firstName}, ${lastName}, ${email}, ${phone},
            ${displayName}, ${ordersCount}, ${totalSpent},
            ${JSON.stringify(datosAdicionales)}, NOW(), NOW()
          )
        `

        await registrarSincronizacion("clientes", shopifyId, "crear", "completado", `Cliente creado: ${displayName}`)
      }
    }

    // Registrar éxito del guardado
    await registrarSincronizacion(
      "clientes",
      null,
      "guardar",
      "completado",
      `Se guardaron ${clientes.length} clientes en la base de datos`,
    )

    return { success: true, count: clientes.length }
  } catch (error) {
    // Registrar error
    await registrarSincronizacion(
      "clientes",
      null,
      "guardar",
      "error",
      `Error al guardar clientes en la base de datos: ${error.message}`,
    )
    console.error("Error al guardar clientes en la base de datos:", error)
    throw error
  }
}

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener el límite de la URL si existe
    const url = new URL(request.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "20")

    // Obtener clientes de Shopify
    const clientes = await obtenerClientesDeShopify(limit)

    // Guardar clientes en la base de datos
    const resultado = await guardarClientesEnBD(clientes)

    return NextResponse.json({
      success: true,
      message: `Sincronización de clientes completada. Se sincronizaron ${resultado.count} clientes.`,
      count: resultado.count,
    })
  } catch (error: any) {
    console.error("Error en sincronización de clientes:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error desconocido en sincronización de clientes",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  return GET(request)
}
