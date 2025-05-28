import { type NextRequest, NextResponse } from "next/server"
import { fetchCustomers } from "@/lib/api/customers"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("query") || ""
    const sortKey = searchParams.get("sortKey") || "CREATED_AT"
    const reverse = searchParams.get("reverse") === "true"
    const first = Number.parseInt(searchParams.get("first") || "50")
    const after = searchParams.get("after")

    console.log("Fetching customers with params:", { query, sortKey, reverse, first, after })

    const result = await fetchCustomers({
      query,
      sortKey,
      reverse,
      first,
      after,
    })

    console.log("Customers fetched successfully:", result.customers.length)

    return NextResponse.json({
      customers: result.customers,
      pageInfo: result.pageInfo,
      success: true,
    })
  } catch (error) {
    console.error("Error in customers API route:", error)
    return NextResponse.json(
      {
        error: "Error al obtener clientes",
        details: error instanceof Error ? error.message : "Error desconocido",
        customers: [],
        pageInfo: { hasNextPage: false, endCursor: null },
        success: false,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Creating customer with data:", body)

    // Aquí iría la lógica para crear un cliente
    // Por ahora retornamos un error indicando que no está implementado
    return NextResponse.json(
      {
        error: "Creación de clientes no implementada aún",
        success: false,
      },
      { status: 501 },
    )
  } catch (error) {
    console.error("Error creating customer:", error)
    return NextResponse.json(
      {
        error: "Error al crear cliente",
        details: error instanceof Error ? error.message : "Error desconocido",
        success: false,
      },
      { status: 500 },
    )
  }
}
