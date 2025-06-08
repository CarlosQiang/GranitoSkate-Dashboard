// Script para verificar que el despliegue funcione correctamente

async function verifyDeployment() {
  console.log("🔍 Verificando configuración del despliegue...")

  // Verificar variables de entorno críticas
  const requiredEnvVars = ["NEXTAUTH_SECRET", "NEXTAUTH_URL", "DATABASE_URL", "POSTGRES_URL"]

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

  if (missingVars.length > 0) {
    console.error("❌ Variables de entorno faltantes:", missingVars)
    return false
  }

  console.log("✅ Variables de entorno configuradas correctamente")

  // Verificar configuración de NextAuth
  try {
    const authUrl = process.env.NEXTAUTH_URL
    const authSecret = process.env.NEXTAUTH_SECRET

    if (!authUrl || !authSecret) {
      console.error("❌ Configuración de NextAuth incompleta")
      return false
    }

    console.log("✅ Configuración de NextAuth válida")
  } catch (error) {
    console.error("❌ Error verificando NextAuth:", error)
    return false
  }

  // Verificar conexión a base de datos
  try {
    const { sql } = await import("@vercel/postgres")
    const result = await sql`SELECT 1 as test`
    console.log("✅ Conexión a base de datos exitosa")
  } catch (error) {
    console.error("❌ Error conectando a base de datos:", error)
    return false
  }

  console.log("🎉 Verificación del despliegue completada exitosamente")
  return true
}

verifyDeployment().catch(console.error)
