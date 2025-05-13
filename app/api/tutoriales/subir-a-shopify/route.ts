import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { shopifyFetch } from "@/lib/shopify"
import { gql } from "graphql-request"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
    }

    console.log("Iniciando proceso de subida de tutoriales a Shopify...")

    // Obtener todos los tutoriales publicados
    const tutoriales = await prisma.tutorial.findMany({
      where: { publicado: true },
    })

    console.log(`Encontrados ${tutoriales.length} tutoriales para subir a Shopify`)

    // ID de la colección Tutoriales (usar el ID que ya verificaste)
    const COLECCION_ID = "gid://shopify/Collection/540788752648"
    console.log(`Usando colección con ID: ${COLECCION_ID}`)

    // Resultados
    const resultados = []
    let exitos = 0
    let errores = 0

    // Procesar cada tutorial
    for (const tutorial of tutoriales) {
      try {
        console.log(`Procesando tutorial: ${tutorial.titulo}`)

        // Verificar si el tutorial ya tiene un ID de Shopify
        if (tutorial.shopify_id) {
          console.log(`Tutorial ${tutorial.titulo} ya tiene ID de Shopify: ${tutorial.shopify_id}. Actualizando...`)

          // Actualizar el producto existente
          const UPDATE_PRODUCT = gql`
            mutation productUpdate($input: ProductInput!) {
              productUpdate(input: $input) {
                product {
                  id
                  title
                }
                userErrors {
                  field
                  message
                }
              }
            }
          `

          const updateResponse = await shopifyFetch({
            query: UPDATE_PRODUCT,
            variables: {
              input: {
                id: tutorial.shopify_id,
                title: tutorial.titulo,
                descriptionHtml: tutorial.contenido,
                productType: "Tutorial",
                tags: tutorial.tags || ["tutorial", "skate"],
                published: true,
                metafields: [
                  {
                    namespace: "tutorial",
                    key: "nivel_dificultad",
                    value: tutorial.nivel_dificultad || "principiante",
                    type: "single_line_text_field",
                  },
                  {
                    namespace: "tutorial",
                    key: "tiempo_estimado",
                    value: String(tutorial.tiempo_estimado || 10),
                    type: "number_integer",
                  },
                ],
              },
            },
          })

          if (updateResponse.errors) {
            throw new Error(`Error al actualizar producto: ${updateResponse.errors[0].message}`)
          }

          if (updateResponse.data?.productUpdate?.userErrors?.length > 0) {
            throw new Error(`Error al actualizar producto: ${updateResponse.data.productUpdate.userErrors[0].message}`)
          }

          console.log(`Tutorial ${tutorial.titulo} actualizado correctamente`)
          resultados.push({
            id: tutorial.id,
            titulo: tutorial.titulo,
            accion: "actualizado",
            shopify_id: tutorial.shopify_id,
            success: true,
          })
          exitos++
        } else {
          console.log(`Tutorial ${tutorial.titulo} no tiene ID de Shopify. Creando nuevo producto...`)

          // Crear un nuevo producto
          const CREATE_PRODUCT = gql`
            mutation productCreate($input: ProductInput!) {
              productCreate(input: $input) {
                product {
                  id
                  title
                }
                userErrors {
                  field
                  message
                }
              }
            }
          `

          const createResponse = await shopifyFetch({
            query: CREATE_PRODUCT,
            variables: {
              input: {
                title: tutorial.titulo,
                descriptionHtml: tutorial.contenido,
                productType: "Tutorial",
                tags: tutorial.tags || ["tutorial", "skate"],
                collectionsToJoin: [COLECCION_ID],
                published: true,
                metafields: [
                  {
                    namespace: "tutorial",
                    key: "nivel_dificultad",
                    value: tutorial.nivel_dificultad || "principiante",
                    type: "single_line_text_field",
                  },
                  {
                    namespace: "tutorial",
                    key: "tiempo_estimado",
                    value: String(tutorial.tiempo_estimado || 10),
                    type: "number_integer",
                  },
                ],
              },
            },
          })

          if (createResponse.errors) {
            throw new Error(`Error al crear producto: ${createResponse.errors[0].message}`)
          }

          if (createResponse.data?.productCreate?.userErrors?.length > 0) {
            throw new Error(`Error al crear producto: ${createResponse.data.productCreate.userErrors[0].message}`)
          }

          const shopifyId = createResponse.data.productCreate.product.id
          console.log(`Producto creado con ID: ${shopifyId}`)

          // Actualizar el tutorial en la base de datos con el ID de Shopify
          await prisma.tutorial.update({
            where: { id: tutorial.id },
            data: { shopify_id: shopifyId },
          })

          console.log(`Tutorial ${tutorial.titulo} creado y asociado correctamente`)
          resultados.push({
            id: tutorial.id,
            titulo: tutorial.titulo,
            accion: "creado",
            shopify_id: shopifyId,
            success: true,
          })
          exitos++
        }
      } catch (error) {
        console.error(`Error al procesar tutorial ${tutorial.titulo}:`, error)
        resultados.push({
          id: tutorial.id,
          titulo: tutorial.titulo,
          accion: "error",
          error: error instanceof Error ? error.message : "Error desconocido",
          success: false,
        })
        errores++
      }
    }

    console.log(`Proceso completado: ${exitos} éxitos, ${errores} errores`)
    return NextResponse.json({
      success: true,
      message: `Proceso completado: ${exitos} tutoriales sincronizados, ${errores} errores`,
      stats: {
        total: tutoriales.length,
        exitos,
        errores,
      },
      resultados,
    })
  } catch (error) {
    console.error("Error en el proceso de subida de tutoriales:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido",
        error,
      },
      { status: 500 },
    )
  }
}
