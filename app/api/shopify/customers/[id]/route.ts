import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { shopifyClient } from "@/lib/shopify-client"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const id = params.id

    const query = `
      query getCustomer($id: ID!) {
        customer(id: $id) {
          id
          firstName
          lastName
          email
          phone
          defaultAddress {
            id
            address1
            address2
            city
            province
            country
            zip
          }
          addresses {
            id
            address1
            address2
            city
            province
            country
            zip
          }
          orders(first: 10) {
            edges {
              node {
                id
                name
                totalPrice {
                  amount
                  currencyCode
                }
                processedAt
                fulfillmentStatus
                financialStatus
              }
            }
          }
          ordersCount
          totalSpent {
            amount
            currencyCode
          }
          note
          tags
          createdAt
          updatedAt
        }
      }
    `

    const variables = {
      id: `gid://shopify/Customer/${id}`,
    }

    const response = await shopifyClient.request(query, variables)

    return NextResponse.json(response.customer)
  } catch (error) {
    console.error("Error al obtener cliente:", error)
    return NextResponse.json({ error: "Error al obtener cliente" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const id = params.id
    const data = await req.json()

    const mutation = `
      mutation customerUpdate($input: CustomerInput!) {
        customerUpdate(input: $input) {
          customer {
            id
            firstName
            lastName
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const variables = {
      input: {
        id: `gid://shopify/Customer/${id}`,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        note: data.note,
        tags: data.tags,
      },
    }

    const response = await shopifyClient.request(mutation, variables)

    if (response.customerUpdate.userErrors.length > 0) {
      return NextResponse.json({ errors: response.customerUpdate.userErrors }, { status: 400 })
    }

    return NextResponse.json(response.customerUpdate.customer)
  } catch (error) {
    console.error("Error al actualizar cliente:", error)
    return NextResponse.json({ error: "Error al actualizar cliente" }, { status: 500 })
  }
}
