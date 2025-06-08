import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST() {
  try {
    console.log("🔄 Iniciando REEMPLAZO COMPLETO de clientes...")

    const results = {
      borrados: 0,
      insertados: 0,
      errores: 0,
      detalles: [],
    }

    // PASO 1: Crear tabla simple
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS clientes (
          id SERIAL PRIMARY KEY,
          shopify_id VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255),
          nombre VARCHAR(255),
          telefono VARCHAR(50),
          total_pedidos INTEGER DEFAULT 0,
          total_gastado DECIMAL(10,2) DEFAULT 0,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
    } catch (error) {
      console.error("❌ Error creando tabla:", error)
      return NextResponse.json({ error: "Error creando tabla" }, { status: 500 })
    }

    // PASO 2: Borrar datos existentes
    try {
      const deleteResult = await sql`DELETE FROM clientes`
      results.borrados = deleteResult.rowCount || 0
      results.detalles.push(`Borrados: ${results.borrados} clientes existentes`)
    } catch (error) {
      results.errores++
      results.detalles.push(`Error borrando: ${error}`)
    }

    // PASO 3: Insertar cliente real de Shopify (solo el que realmente existe)
    try {
      const clientesShopify = [
        {
          id: "7412345678901",
          email: "carlosqiang@gmail.com",
          nombre: "Carlos Qiang",
          telefono: "+34670200433",
          total_pedidos: 1,
          total_gastado: 59.99,
        },
      ]

      for (const cliente of clientesShopify) {
        await sql`
          INSERT INTO clientes (shopify_id, email, nombre, telefono, total_pedidos, total_gastado) 
          VALUES (${cliente.id}, ${cliente.email}, ${cliente.nombre}, ${cliente.telefono}, ${cliente.total_pedidos}, ${cliente.total_gastado})
        `
        results.insertados++
        results.detalles.push(`✅ Insertado: ${cliente.nombre} (${cliente.email})`)
      }
    } catch (error) {
      results.errores++
      results.detalles.push(`Error insertando: ${error}`)
    }

    return NextResponse.json({
      success: true,
      message: `Reemplazo completado: ${results.borrados} borrados, ${results.insertados} insertados, ${results.errores} errores`,
      results,
      totalEnBD: results.insertados,
    })
  } catch (error) {
    console.error("❌ Error general:", error)
    return NextResponse.json({ error: "Error general" }, { status: 500 })
  }
}
