import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(request: Request) {
  try {
    const { dashboardData } = await request.json()

    if (!dashboardData) {
      return NextResponse.json({ error: "No se proporcionaron datos para sincronizar" }, { status: 400 })
    }

    console.log("🔄 Iniciando sincronización completa...")
    console.log("📊 Datos recibidos:", {
      productos: dashboardData.allProducts?.length || 0,
      pedidos: dashboardData.allOrders?.length || 0,
      clientes: dashboardData.allCustomers?.length || 0,
      colecciones: dashboardData.allCollections?.length || 0,
      promociones: dashboardData.allPromotions?.length || 0,
    })

    const results = {
      productos: { insertados: 0, actualizados: 0, errores: 0 },
      pedidos: { insertados: 0, actualizados: 0, errores: 0 },
      clientes: { insertados: 0, actualizados: 0, errores: 0 },
      colecciones: { insertados: 0, actualizados: 0, errores: 0 },
      promociones: { insertados: 0, actualizados: 0, errores: 0 },
    }

    // SINCRONIZAR PRODUCTOS
    if (dashboardData.allProducts && Array.isArray(dashboardData.allProducts)) {
      console.log(`📦 Sincronizando ${dashboardData.allProducts.length} productos...`)

      for (const producto of dashboardData.allProducts) {
        try {
          if (!producto.id || !producto.title) {
            results.productos.errores++
            continue
          }

          const shopifyId = producto.id.toString().replace("gid://shopify/Product/", "")

          // Verificar si el producto ya existe
          const existingProduct = await sql`
            SELECT id FROM productos WHERE shopify_id = ${shopifyId}
          `

          const productData = {
            shopify_id: shopifyId,
            titulo: producto.title,
            descripcion: producto.description || "",
            estado: producto.status || "ACTIVE",
            precio_base: Number.parseFloat(producto.price || "0"),
            inventario_disponible: Number.parseInt(producto.inventory || "0"),
            tipo_producto: producto.productType || "SKATEBOARD",
            proveedor: producto.vendor || "GranitoSkate",
            imagen_destacada_url: producto.image || null,
            url_handle: producto.handle || producto.title.toLowerCase().replace(/\s+/g, "-"),
            publicado: true,
          }

          if (existingProduct.rows.length > 0) {
            // Actualizar producto existente
            await sql`
              UPDATE productos SET
                titulo = ${productData.titulo},
                descripcion = ${productData.descripcion},
                estado = ${productData.estado},
                precio_base = ${productData.precio_base},
                inventario_disponible = ${productData.inventario_disponible},
                tipo_producto = ${productData.tipo_producto},
                proveedor = ${productData.proveedor},
                imagen_destacada_url = ${productData.imagen_destacada_url},
                url_handle = ${productData.url_handle},
                publicado = ${productData.publicado},
                actualizado_en = NOW()
              WHERE shopify_id = ${shopifyId}
            `
            results.productos.actualizados++
          } else {
            // Insertar nuevo producto
            await sql`
              INSERT INTO productos (
                shopify_id, titulo, descripcion, estado, precio_base,
                inventario_disponible, tipo_producto, proveedor,
                imagen_destacada_url, url_handle, publicado,
                creado_en, actualizado_en
              ) VALUES (
                ${productData.shopify_id}, ${productData.titulo}, ${productData.descripcion},
                ${productData.estado}, ${productData.precio_base}, ${productData.inventario_disponible},
                ${productData.tipo_producto}, ${productData.proveedor}, ${productData.imagen_destacada_url},
                ${productData.url_handle}, ${productData.publicado}, NOW(), NOW()
              )
            `
            results.productos.insertados++
          }
        } catch (error) {
          console.error("Error sincronizando producto:", error)
          results.productos.errores++
        }
      }
    }

    // SINCRONIZAR CLIENTES
    if (dashboardData.allCustomers && Array.isArray(dashboardData.allCustomers)) {
      console.log(`👥 Sincronizando ${dashboardData.allCustomers.length} clientes...`)

      for (const cliente of dashboardData.allCustomers) {
        try {
          if (!cliente.id) {
            results.clientes.errores++
            continue
          }

          const shopifyId = cliente.id.toString().replace("gid://shopify/Customer/", "")

          const existingCustomer = await sql`
            SELECT id FROM clientes WHERE shopify_id = ${shopifyId}
          `

          const customerData = {
            shopify_id: shopifyId,
            email: cliente.email || `cliente-${shopifyId}@example.com`,
            nombre: `${cliente.firstName || ""} ${cliente.lastName || ""}`.trim() || "Cliente",
            telefono: cliente.phone || null,
            estado: cliente.state || "ENABLED",
            total_pedidos: Number.parseInt(cliente.numberOfOrders || "0"),
            total_gastado: Number.parseFloat(cliente.totalSpent || "0"),
          }

          if (existingCustomer.rows.length > 0) {
            await sql`
              UPDATE clientes SET
                email = ${customerData.email},
                nombre = ${customerData.nombre},
                telefono = ${customerData.telefono},
                estado = ${customerData.estado},
                total_pedidos = ${customerData.total_pedidos},
                total_gastado = ${customerData.total_gastado},
                actualizado_en = NOW()
              WHERE shopify_id = ${shopifyId}
            `
            results.clientes.actualizados++
          } else {
            await sql`
              INSERT INTO clientes (
                shopify_id, email, nombre, telefono, estado,
                total_pedidos, total_gastado, creado_en, actualizado_en
              ) VALUES (
                ${customerData.shopify_id}, ${customerData.email}, ${customerData.nombre},
                ${customerData.telefono}, ${customerData.estado}, ${customerData.total_pedidos},
                ${customerData.total_gastado}, NOW(), NOW()
              )
            `
            results.clientes.insertados++
          }
        } catch (error) {
          console.error("Error sincronizando cliente:", error)
          results.clientes.errores++
        }
      }
    }

    // SINCRONIZAR PEDIDOS
    if (dashboardData.allOrders && Array.isArray(dashboardData.allOrders)) {
      console.log(`🛒 Sincronizando ${dashboardData.allOrders.length} pedidos...`)

      for (const pedido of dashboardData.allOrders) {
        try {
          if (!pedido.id) {
            results.pedidos.errores++
            continue
          }

          const shopifyId = pedido.id.toString().replace("gid://shopify/Order/", "")

          const existingOrder = await sql`
            SELECT id FROM pedidos WHERE shopify_id = ${shopifyId}
          `

          let total = 0
          let moneda = "EUR"

          if (pedido.totalPriceSet?.shopMoney?.amount) {
            total = Number.parseFloat(pedido.totalPriceSet.shopMoney.amount)
            moneda = pedido.totalPriceSet.shopMoney.currencyCode || "EUR"
          } else if (pedido.total) {
            total = Number.parseFloat(pedido.total)
          }

          const orderData = {
            shopify_id: shopifyId,
            numero_pedido: pedido.name || `#${shopifyId}`,
            total: total,
            moneda: moneda,
            email_cliente: pedido.customer?.email || pedido.email || "",
            estado: pedido.displayFulfillmentStatus || pedido.fulfillmentStatus || "PENDING",
            estado_financiero: pedido.displayFinancialStatus || pedido.financialStatus || "PENDING",
          }

          if (existingOrder.rows.length > 0) {
            await sql`
              UPDATE pedidos SET
                numero_pedido = ${orderData.numero_pedido},
                total = ${orderData.total},
                moneda = ${orderData.moneda},
                email_cliente = ${orderData.email_cliente},
                estado = ${orderData.estado},
                estado_financiero = ${orderData.estado_financiero},
                actualizado_en = NOW()
              WHERE shopify_id = ${shopifyId}
            `
            results.pedidos.actualizados++
          } else {
            await sql`
              INSERT INTO pedidos (
                shopify_id, numero_pedido, total, moneda, email_cliente,
                estado, estado_financiero, creado_en, actualizado_en
              ) VALUES (
                ${orderData.shopify_id}, ${orderData.numero_pedido}, ${orderData.total},
                ${orderData.moneda}, ${orderData.email_cliente}, ${orderData.estado},
                ${orderData.estado_financiero}, NOW(), NOW()
              )
            `
            results.pedidos.insertados++
          }
        } catch (error) {
          console.error("Error sincronizando pedido:", error)
          results.pedidos.errores++
        }
      }
    }

    // SINCRONIZAR COLECCIONES
    if (dashboardData.allCollections && Array.isArray(dashboardData.allCollections)) {
      console.log(`📚 Sincronizando ${dashboardData.allCollections.length} colecciones...`)

      for (const coleccion of dashboardData.allCollections) {
        try {
          if (!coleccion.id || !coleccion.title) {
            results.colecciones.errores++
            continue
          }

          const shopifyId = coleccion.id.toString().replace("gid://shopify/Collection/", "")

          const existingCollection = await sql`
            SELECT id FROM colecciones WHERE shopify_id = ${shopifyId}
          `

          const collectionData = {
            shopify_id: shopifyId,
            titulo: coleccion.title,
            descripcion: coleccion.description || "",
            url_handle: coleccion.handle || coleccion.title.toLowerCase().replace(/\s+/g, "-"),
            imagen_url: coleccion.image?.url || coleccion.image || null,
            productos_count: Number.parseInt(coleccion.productsCount?.count || coleccion.productsCount || "0"),
            publicado: true,
          }

          if (existingCollection.rows.length > 0) {
            await sql`
              UPDATE colecciones SET
                titulo = ${collectionData.titulo},
                descripcion = ${collectionData.descripcion},
                url_handle = ${collectionData.url_handle},
                imagen_url = ${collectionData.imagen_url},
                productos_count = ${collectionData.productos_count},
                publicado = ${collectionData.publicado},
                actualizado_en = NOW()
              WHERE shopify_id = ${shopifyId}
            `
            results.colecciones.actualizados++
          } else {
            await sql`
              INSERT INTO colecciones (
                shopify_id, titulo, descripcion, url_handle, imagen_url,
                productos_count, publicado, creado_en, actualizado_en
              ) VALUES (
                ${collectionData.shopify_id}, ${collectionData.titulo}, ${collectionData.descripcion},
                ${collectionData.url_handle}, ${collectionData.imagen_url}, ${collectionData.productos_count},
                ${collectionData.publicado}, NOW(), NOW()
              )
            `
            results.colecciones.insertados++
          }
        } catch (error) {
          console.error("Error sincronizando colección:", error)
          results.colecciones.errores++
        }
      }
    }

    // SINCRONIZAR PROMOCIONES
    if (dashboardData.allPromotions && Array.isArray(dashboardData.allPromotions)) {
      console.log(`🎯 Sincronizando ${dashboardData.allPromotions.length} promociones...`)

      for (const promocion of dashboardData.allPromotions) {
        try {
          if (!promocion.id) {
            results.promociones.errores++
            continue
          }

          const shopifyId = promocion.id
            .toString()
            .replace("gid://shopify/DiscountNode/", "")
            .replace("gid://shopify/DiscountCodeNode/", "")

          const existingPromotion = await sql`
            SELECT id FROM promociones WHERE shopify_id = ${shopifyId}
          `

          let valor = 0
          if (promocion.discount?.customerGets?.value?.percentage) {
            valor = Number.parseFloat(promocion.discount.customerGets.value.percentage)
          } else if (promocion.discount?.customerGets?.value?.discountAmount?.amount) {
            valor = Number.parseFloat(promocion.discount.customerGets.value.discountAmount.amount)
          } else if (promocion.value) {
            valor = Number.parseFloat(promocion.value.toString())
          }

          const promotionData = {
            shopify_id: shopifyId,
            titulo: promocion.title || promocion.codeDiscount?.title || "Promoción sin título",
            descripcion: promocion.summary || promocion.codeDiscount?.summary || "",
            tipo: promocion.discount?.discountClass || promocion.type || "PERCENTAGE",
            valor: valor,
            codigo: promocion.codeDiscount?.codes?.nodes?.[0]?.code || promocion.code || null,
            activo: promocion.status === "ACTIVE" || promocion.status === "active",
          }

          if (existingPromotion.rows.length > 0) {
            await sql`
              UPDATE promociones SET
                titulo = ${promotionData.titulo},
                descripcion = ${promotionData.descripcion},
                tipo = ${promotionData.tipo},
                valor = ${promotionData.valor},
                codigo = ${promotionData.codigo},
                activo = ${promotionData.activo},
                actualizado_en = NOW()
              WHERE shopify_id = ${shopifyId}
            `
            results.promociones.actualizados++
          } else {
            await sql`
              INSERT INTO promociones (
                shopify_id, titulo, descripcion, tipo, valor, codigo,
                activo, fecha_inicio, creado_en, actualizado_en
              ) VALUES (
                ${promotionData.shopify_id}, ${promotionData.titulo}, ${promotionData.descripcion},
                ${promotionData.tipo}, ${promotionData.valor}, ${promotionData.codigo},
                ${promotionData.activo}, NOW(), NOW(), NOW()
              )
            `
            results.promociones.insertados++
          }
        } catch (error) {
          console.error("Error sincronizando promoción:", error)
          results.promociones.errores++
        }
      }
    }

    const totalInsertados = Object.values(results).reduce((sum, result) => sum + result.insertados, 0)
    const totalActualizados = Object.values(results).reduce((sum, result) => sum + result.actualizados, 0)

    console.log("✅ Sincronización completada:", results)

    return NextResponse.json({
      success: true,
      message: `Sincronización exitosa: ${totalInsertados} insertados, ${totalActualizados} actualizados`,
      results,
      totalInsertados,
      totalActualizados,
    })
  } catch (error) {
    console.error("❌ Error en sincronización:", error)
    return NextResponse.json(
      {
        error: "Error en la sincronización",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
