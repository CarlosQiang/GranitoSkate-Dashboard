import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🧪 Probando conexión y permisos de Shopify para promociones...")

    // Verificar variables de entorno
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN || !process.env.SHOPIFY_ACCESS_TOKEN) {
      return NextResponse.json({
        success: false,
        error: "Variables de entorno de Shopify no configuradas",
        details: {
          shop_domain: !!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN,
          access_token: !!process.env.SHOPIFY_ACCESS_TOKEN,
        },
      })
    }

    // Test 1: Verificar que podemos leer descuentos existentes
    const readQuery = `
      query {
        discountNodes(first: 5) {
          edges {
            node {
              id
              discount {
                ... on DiscountAutomaticBasic {
                  title
                  status
                }
                ... on DiscountCodeBasic {
                  title
                  status
                }
              }
            }
          }
        }
      }
    `

    console.log("🔍 Test 1: Leyendo descuentos existentes...")
    const readResponse = await fetch(
      `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2024-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({ query: readQuery }),
      },
    )

    const readData = await readResponse.json()
    console.log("📊 Respuesta de lectura:", readData)

    if (readData.errors) {
      return NextResponse.json({
        success: false,
        error: "Error leyendo descuentos existentes",
        details: readData.errors,
      })
    }

    // Test 2: Probar creación de descuento automático simple
    const createMutation = `
      mutation discountAutomaticBasicCreate($automaticBasicDiscount: DiscountAutomaticBasicInput!) {
        discountAutomaticBasicCreate(automaticBasicDiscount: $automaticBasicDiscount) {
          automaticDiscountNode {
            id
            automaticDiscount {
              ... on DiscountAutomaticBasic {
                title
                status
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const testDiscountData = {
      automaticBasicDiscount: {
        title: `Test Promoción ${Date.now()}`,
        startsAt: new Date().toISOString(),
        customerGets: {
          value: {
            percentage: 0.05, // 5%
          },
          items: {
            all: true,
          },
        },
        customerSelection: {
          all: true,
        },
      },
    }

    console.log("🧪 Test 2: Creando descuento de prueba...")
    console.log("📤 Datos enviados:", JSON.stringify(testDiscountData, null, 2))

    const createResponse = await fetch(
      `https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/api/2024-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({
          query: createMutation,
          variables: testDiscountData,
        }),
      },
    )

    const createData = await createResponse.json()
    console.log("📥 Respuesta de creación:", JSON.stringify(createData, null, 2))

    return NextResponse.json({
      success: true,
      tests: {
        read: {
          success: !readData.errors,
          data: readData.data?.discountNodes?.edges?.length || 0,
          errors: readData.errors || null,
        },
        create: {
          success: !createData.errors && createData.data?.discountAutomaticBasicCreate?.automaticDiscountNode,
          data: createData.data,
          errors: createData.errors || createData.data?.discountAutomaticBasicCreate?.userErrors || null,
        },
      },
      shopifyResponse: {
        read: readData,
        create: createData,
      },
    })
  } catch (error) {
    console.error("❌ Error en test de promociones:", error)
    return NextResponse.json({
      success: false,
      error: "Error interno del servidor",
      details: error.message,
    })
  }
}
