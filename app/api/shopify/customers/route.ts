import { type NextRequest, NextResponse } from "next/server"
import { fetchCustomers } from "@/lib/api/customers"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      query: searchParams.get("query") || "",
      sortKey: searchParams.get("sortKey") || "CREATED_AT",
      reverse: searchParams.get("reverse") === "true",
      first: Number.parseInt(searchParams.get("first") || "20"),
      after: searchParams.get("after"),
    }

    const result = await fetchCustomers(filters)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in customers API route:", error)
    return NextResponse.json({ error: "Error al obtener clientes", details: (error as Error).message }, { status: 500 })
  }
}
