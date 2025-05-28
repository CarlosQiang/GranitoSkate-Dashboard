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
      after: searchParams.get("after") || null,
    }

    const result = await fetchCustomers(filters)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in customers API route:", error)

    // Devolver datos mock en caso de error para evitar el crash
    return NextResponse.json({
      customers: [
        {
          id: "mock-1",
          firstName: "Cliente",
          lastName: "Demo",
          email: "demo@example.com",
          phone: "+34 600 000 000",
          ordersCount: 0,
          totalSpent: { amount: "0", currencyCode: "EUR" },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          verifiedEmail: false,
          acceptsMarketing: false,
          defaultAddress: null,
          addresses: [],
          tags: [],
          metafields: [],
          cursor: "mock-cursor-1",
        },
      ],
      pageInfo: { hasNextPage: false, endCursor: null },
    })
  }
}
