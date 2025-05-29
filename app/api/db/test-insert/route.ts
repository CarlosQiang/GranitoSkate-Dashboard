import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 Iniciando prueba de inserción directa...")

    // Datos de prueba
    const productoTest = {
      shopify_id: "test-product-" + Date.now(),
      titulo: "Producto de Prueba",
      descripcion: "Este es un producto de prueba para verificar la inserción",
      tipo_producto: "test",
      proveedor: "Test Vendor",
      estado: "active",
      publicado: true,
      precio_base: 99.99,
      inventario_disponible: 10,
    }

    console.log("📦 Insertando producto de prueba:", productoTest)

    // Insertar producto de prueba
    const result = await sql`
      INSERT INTO productos (
        shopify_id, titulo, descripcion, tipo_producto, proveedor, estado,
        publicado, precio_base, inventario_disponible, creado_en, actualizado_en
      ) VALUES (
        ${productoTest.shopify_id},
        ${productoTest.titulo},
        ${productoTest.descripcion},
        ${productoTest.tipo_producto},
        ${productoTest.proveedor},
        ${productoTest.estado},
        ${productoTest.publicado},
        ${productoTest.precio_base},
        ${productoTest.inventario_disponible},
        NOW(),
        NOW()
      ) RETURNING *
    `

    console.log("✅ Producto insertado exitosamente:", result.rows[0])

    // Verificar que se insertó
    const verification = await sql`
      SELECT COUNT(*) as count FROM productos WHERE shopify_id = ${productoTest.shopify_id}
    `

    console.log("🔍 Verificación de inserción:", verification.rows[0])

    return NextResponse.json({
      success: true,
      mensaje: "Producto de prueba insertado exitosamente",
      producto: result.rows[0],
      verificacion: verification.rows[0],
    })
  } catch (error) {
    console.error("❌ Error en la inserción de prueba:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error en la inserción de prueba",
        mensaje: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
