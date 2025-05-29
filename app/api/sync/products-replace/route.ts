import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(request: Request) {
  try {
    const { products } = await request.json()

    if (!products || !Array.isArray(products)) {
      return NextResponse.json({ error: "No se proporcionaron productos para sincronizar" }, { status: 400 })
    }

    console.log("🔄 Iniciando REEMPLAZO COMPLETO de productos...")
    console.log("📦 Productos recibidos:", products.length)
    console.log("📋 Datos de ejemplo del primer producto:", JSON.stringify(products[0], null, 2))

    const results = {
      borrados: 0,
      insertados: 0,
      errores: 0,
      detalles: [],
    }

    // PASO 1: Verificar/crear tabla productos
    try {
      console.log("🔍 Verificando tabla productos...")
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'productos'
        );
      `

      if (!tableCheck.rows[0].exists) {
        console.log("📝 Creando tabla productos...")
        await sql`
          CREATE TABLE productos (
            id SERIAL PRIMARY KEY,
            shopify_id VARCHAR(255) UNIQUE NOT NULL,
            titulo VARCHAR(500) NOT NULL,
            descripcion TEXT,
            estado VARCHAR(50) DEFAULT 'ACTIVE',
            precio_base DECIMAL(10,2) DEFAULT 0,
            inventario_disponible INTEGER DEFAULT 0,
            tipo_producto VARCHAR(100),
            proveedor VARCHAR(255),
            imagen_destacada_url TEXT,
            publicado BOOLEAN DEFAULT true,
            creado_en TIMESTAMP DEFAULT NOW(),
            actualizado_en TIMESTAMP DEFAULT NOW()
          );
        `
        console.log("✅ Tabla productos creada")
      } else {
        console.log("✅ Tabla productos ya existe")

        // Verificamos las columnas existentes
        const columnsCheck = await sql`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'productos';
        `

        const existingColumns = columnsCheck.rows.map((row) => row.column_name)
        console.log("📋 Columnas existentes:", existingColumns)
      }
    } catch (error) {
      console.error("❌ Error con tabla productos:", error)
      return NextResponse.json({ error: "Error con la tabla productos" }, { status: 500 })
    }

    // PASO 2: BORRAR TODOS los productos existentes
    try {
      console.log("🗑️ Borrando TODOS los productos existentes...")
      const deleteResult = await sql`DELETE FROM productos`
      results.borrados = deleteResult.rowCount || 0
      console.log(`✅ ${results.borrados} productos borrados`)
      results.detalles.push(`Borrados: ${results.borrados} productos existentes`)
    } catch (error) {
      console.error("❌ Error borrando productos:", error)
      results.errores++
      results.detalles.push(`Error borrando productos: ${error}`)
    }

    // PASO 3: INSERTAR todos los productos nuevos
    console.log("➕ Insertando productos nuevos...")

    for (let i = 0; i < products.length; i++) {
      const producto = products[i]

      try {
        console.log(`\n📝 Insertando producto ${i + 1}/${products.length}:`)
        console.log("- ID:", producto.id)
        console.log("- Título:", producto.title)
        console.log("- Precio:", producto.price)
        console.log("- Inventario:", producto.inventory)

        // Limpiar y validar datos
        const shopifyId = String(producto.id || "").replace("gid://shopify/Product/", "")
        const titulo = String(producto.title || "Sin título")
        const descripcion = String(producto.description || "")
        const precio = Number.parseFloat(String(producto.price || "0"))
        const inventario = Number.parseInt(String(producto.inventory || "0"))

        if (!shopifyId || !titulo) {
          console.warn("⚠️ Producto sin ID o título válido, saltando...")
          results.errores++
          results.detalles.push(`Error: Producto ${i + 1} sin ID o título válido`)
          continue
        }

        console.log("📊 Datos procesados:")
        console.log("- Shopify ID:", shopifyId)
        console.log("- Título:", titulo)
        console.log("- Precio:", precio)
        console.log("- Inventario:", inventario)

        // Insertar producto - SIN url_handle
        await sql`
          INSERT INTO productos (
            shopify_id, 
            titulo, 
            descripcion, 
            estado, 
            precio_base,
            inventario_disponible, 
            tipo_producto, 
            proveedor,
            imagen_destacada_url, 
            publicado,
            creado_en, 
            actualizado_en
          ) VALUES (
            ${shopifyId},
            ${titulo},
            ${descripcion},
            'ACTIVE',
            ${precio},
            ${inventario},
            ${producto.product_type || "SKATEBOARD"},
            ${producto.vendor || "GranitoSkate"},
            ${producto.image || null},
            true,
            NOW(),
            NOW()
          )
        `

        results.insertados++
        results.detalles.push(`✅ Insertado: ${titulo}`)
        console.log(`✅ Producto ${i + 1} insertado correctamente`)
      } catch (error) {
        console.error(`❌ Error insertando producto ${i + 1}:`, error)
        results.errores++
        results.detalles.push(
          `❌ Error en producto ${i + 1}: ${error instanceof Error ? error.message : "Error desconocido"}`,
        )
      }
    }

    // PASO 4: Verificar resultado final
    const finalCount = await sql`SELECT COUNT(*) as count FROM productos`
    const totalFinal = Number.parseInt(finalCount.rows[0].count)

    console.log("📊 RESUMEN FINAL:")
    console.log("- Productos borrados:", results.borrados)
    console.log("- Productos insertados:", results.insertados)
    console.log("- Errores:", results.errores)
    console.log("- Total en BD:", totalFinal)

    return NextResponse.json({
      success: true,
      message: `Reemplazo completado: ${results.borrados} borrados, ${results.insertados} insertados, ${results.errores} errores`,
      results,
      totalEnBD: totalFinal,
    })
  } catch (error) {
    console.error("❌ Error general en reemplazo de productos:", error)
    return NextResponse.json(
      {
        error: "Error en el reemplazo de productos",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
