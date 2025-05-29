import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(request: Request) {
  try {
    const { dashboardData } = await request.json()

    if (!dashboardData) {
      return NextResponse.json({ error: "No se proporcionaron datos para sincronizar" }, { status: 400 })
    }

    console.log("🔄 Iniciando sincronización completa...")

    const results = {
      productos: { insertados: 0, actualizados: 0, errores: 0 },
      pedidos: { insertados: 0, actualizados: 0, errores: 0 },
      clientes: { insertados: 0, actualizados: 0, errores: 0 },
      colecciones: { insertados: 0, actualizados: 0, errores: 0 },
      configuracion: { guardada: false },
      seo: { guardado: false },
      personalizacion: { guardada: false },
    }

    // 1. Sincronizar productos
    if (dashboardData.allProducts && Array.isArray(dashboardData.allProducts)) {
      console.log(`📦 Sincronizando ${dashboardData.allProducts.length} productos...`)

      for (const producto of dashboardData.allProducts) {
        try {
          // Extraer ID de Shopify
          const shopifyId = producto.id.replace("gid://shopify/Product/", "")

          // Verificar si existe
          const existeProducto = await sql`
            SELECT id FROM productos WHERE shopify_id = ${shopifyId}
          `

          if (existeProducto.rows.length > 0) {
            // Actualizar
            await sql`
              UPDATE productos SET 
                titulo = ${producto.title},
                estado = ${producto.status},
                precio_base = ${Number.parseFloat(producto.price || "0")},
                inventario_disponible = ${producto.inventory || 0},
                tipo_producto = ${producto.productType || "SKATEBOARD"},
                proveedor = ${producto.vendor || "GranitoSkate"},
                imagen_destacada_url = ${producto.image || null},
                url_handle = ${producto.handle || producto.title.toLowerCase().replace(/\s+/g, "-")},
                actualizado_en = NOW()
              WHERE shopify_id = ${shopifyId}
            `
            results.productos.actualizados++
          } else {
            // Insertar
            await sql`
              INSERT INTO productos (
                shopify_id, titulo, estado, precio_base, inventario_disponible,
                tipo_producto, proveedor, imagen_destacada_url, url_handle,
                creado_en, actualizado_en
              ) VALUES (
                ${shopifyId}, ${producto.title}, ${producto.status},
                ${Number.parseFloat(producto.price || "0")}, ${producto.inventory || 0},
                ${producto.productType || "SKATEBOARD"}, ${producto.vendor || "GranitoSkate"},
                ${producto.image || null}, ${producto.handle || producto.title.toLowerCase().replace(/\s+/g, "-")},
                NOW(), NOW()
              )
            `
            results.productos.insertados++
          }
        } catch (error) {
          console.error(`Error sincronizando producto ${producto.id}:`, error)
          results.productos.errores++
        }
      }
    }

    // 2. Sincronizar pedidos
    if (dashboardData.allOrders && Array.isArray(dashboardData.allOrders)) {
      console.log(`🛒 Sincronizando ${dashboardData.allOrders.length} pedidos...`)

      for (const pedido of dashboardData.allOrders) {
        try {
          const shopifyId = pedido.id.replace("gid://shopify/Order/", "")

          const existePedido = await sql`
            SELECT id FROM pedidos WHERE shopify_id = ${shopifyId}
          `

          if (existePedido.rows.length > 0) {
            await sql`
              UPDATE pedidos SET 
                numero_pedido = ${pedido.name},
                total = ${Number.parseFloat(pedido.total || "0")},
                moneda = ${pedido.currency || "EUR"},
                email_cliente = ${pedido.customer?.email || ""},
                actualizado_en = NOW()
              WHERE shopify_id = ${shopifyId}
            `
            results.pedidos.actualizados++
          } else {
            await sql`
              INSERT INTO pedidos (
                shopify_id, numero_pedido, total, moneda, email_cliente,
                creado_en, actualizado_en
              ) VALUES (
                ${shopifyId}, ${pedido.name}, ${Number.parseFloat(pedido.total || "0")},
                ${pedido.currency || "EUR"}, ${pedido.customer?.email || ""},
                NOW(), NOW()
              )
            `
            results.pedidos.insertados++
          }
        } catch (error) {
          console.error(`Error sincronizando pedido ${pedido.id}:`, error)
          results.pedidos.errores++
        }
      }
    }

    // 3. Sincronizar clientes
    if (dashboardData.allCustomers && Array.isArray(dashboardData.allCustomers)) {
      console.log(`👥 Sincronizando ${dashboardData.allCustomers.length} clientes...`)

      for (const cliente of dashboardData.allCustomers) {
        try {
          const shopifyId = cliente.id.replace("gid://shopify/Customer/", "")

          const existeCliente = await sql`
            SELECT id FROM clientes WHERE shopify_id = ${shopifyId}
          `

          const nombreCompleto = `${cliente.firstName || ""} ${cliente.lastName || ""}`.trim()

          if (existeCliente.rows.length > 0) {
            await sql`
              UPDATE clientes SET 
                email = ${cliente.email},
                nombre = ${nombreCompleto},
                telefono = ${cliente.phone || null},
                actualizado_en = NOW()
              WHERE shopify_id = ${shopifyId}
            `
            results.clientes.actualizados++
          } else {
            await sql`
              INSERT INTO clientes (
                shopify_id, email, nombre, telefono, creado_en, actualizado_en
              ) VALUES (
                ${shopifyId}, ${cliente.email}, ${nombreCompleto},
                ${cliente.phone || null}, NOW(), NOW()
              )
            `
            results.clientes.insertados++
          }
        } catch (error) {
          console.error(`Error sincronizando cliente ${cliente.id}:`, error)
          results.clientes.errores++
        }
      }
    }

    // 4. Sincronizar colecciones
    if (dashboardData.allCollections && Array.isArray(dashboardData.allCollections)) {
      console.log(`📚 Sincronizando ${dashboardData.allCollections.length} colecciones...`)

      for (const coleccion of dashboardData.allCollections) {
        try {
          const shopifyId = coleccion.id.replace("gid://shopify/Collection/", "")

          const existeColeccion = await sql`
            SELECT id FROM colecciones WHERE shopify_id = ${shopifyId}
          `

          if (existeColeccion.rows.length > 0) {
            await sql`
              UPDATE colecciones SET 
                titulo = ${coleccion.title},
                descripcion = ${coleccion.description || ""},
                url_handle = ${coleccion.handle || coleccion.title.toLowerCase().replace(/\s+/g, "-")},
                imagen_url = ${coleccion.image || null},
                actualizado_en = NOW()
              WHERE shopify_id = ${shopifyId}
            `
            results.colecciones.actualizados++
          } else {
            await sql`
              INSERT INTO colecciones (
                shopify_id, titulo, descripcion, url_handle, imagen_url,
                creado_en, actualizado_en
              ) VALUES (
                ${shopifyId}, ${coleccion.title}, ${coleccion.description || ""},
                ${coleccion.handle || coleccion.title.toLowerCase().replace(/\s+/g, "-")},
                ${coleccion.image || null}, NOW(), NOW()
              )
            `
            results.colecciones.insertados++
          }
        } catch (error) {
          console.error(`Error sincronizando colección ${coleccion.id}:`, error)
          results.colecciones.errores++
        }
      }
    }

    // 5. Guardar configuración de Shopify
    try {
      console.log("⚙️ Guardando configuración de Shopify...")

      const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
      const hasToken = !!process.env.SHOPIFY_ACCESS_TOKEN

      await sql`
        INSERT INTO configuracion_shopify (
          dominio_tienda, token_configurado, activa, creado_en, actualizado_en
        ) VALUES (
          ${shopDomain || "no-configurado"}, ${hasToken}, ${hasToken},
          NOW(), NOW()
        )
        ON CONFLICT (dominio_tienda) 
        DO UPDATE SET 
          token_configurado = ${hasToken},
          activa = ${hasToken},
          actualizado_en = NOW()
      `

      results.configuracion.guardada = true
    } catch (error) {
      console.error("Error guardando configuración de Shopify:", error)
    }

    // 6. Guardar configuración SEO básica
    try {
      console.log("🔍 Guardando configuración SEO...")

      await sql`
        INSERT INTO metadatos_seo (
          tipo_entidad, titulo, descripcion, palabras_clave,
          creado_en, actualizado_en
        ) VALUES (
          'tienda', 'GranitoSkate - Tienda de Skate Online',
          'Tienda especializada en productos de skate. Encuentra tablas, ruedas, trucks y accesorios.',
          'skate,skateboard,tienda,online,granito',
          NOW(), NOW()
        )
        ON CONFLICT (tipo_entidad) 
        DO UPDATE SET 
          actualizado_en = NOW()
      `

      results.seo.guardado = true
    } catch (error) {
      console.error("Error guardando configuración SEO:", error)
    }

    // 7. Guardar configuración de personalización
    try {
      console.log("🎨 Guardando configuración de personalización...")

      await sql`
        INSERT INTO theme_configs (
          shop_id, config_name, primary_color, secondary_color, accent_color,
          font_family, enable_dark_mode, shop_name, created_at, updated_at
        ) VALUES (
          'granito-skate', 'default', '#D4A574', '#8B4513', '#FF6B35',
          'Inter', true, 'GranitoSkate', NOW(), NOW()
        )
        ON CONFLICT (shop_id, config_name) 
        DO UPDATE SET 
          updated_at = NOW()
      `

      results.personalizacion.guardada = true
    } catch (error) {
      console.error("Error guardando configuración de personalización:", error)
    }

    // 8. Registrar la actividad de sincronización
    await sql`
      INSERT INTO registros_actividad (
        accion, tipo_entidad, resultado, descripcion, creado_en
      ) VALUES (
        'sincronizacion_completa', 'sistema', 'completado',
        'Sincronización completa: ' || ${results.productos.insertados + results.productos.actualizados} || ' productos, ' ||
        ${results.pedidos.insertados + results.pedidos.actualizados} || ' pedidos, ' ||
        ${results.clientes.insertados + results.clientes.actualizados} || ' clientes, ' ||
        ${results.colecciones.insertados + results.colecciones.actualizados} || ' colecciones',
        NOW()
      )
    `

    console.log("✅ Sincronización completa finalizada")

    return NextResponse.json({
      success: true,
      message: "Sincronización completa exitosa",
      results,
    })
  } catch (error) {
    console.error("❌ Error en sincronización completa:", error)

    return NextResponse.json(
      {
        error: "Error en la sincronización completa",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
