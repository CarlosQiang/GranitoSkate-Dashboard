// Script para generar el hash de la contraseña
import bcrypt from "bcryptjs"

async function hashPassword() {
  const password = "GranitoSkate"
  const saltRounds = 12

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    console.log("Contraseña original:", password)
    console.log("Hash generado:", hashedPassword)

    // Verificar que el hash funciona
    const isValid = await bcrypt.compare(password, hashedPassword)
    console.log("Verificación del hash:", isValid ? "✅ CORRECTO" : "❌ ERROR")

    return hashedPassword
  } catch (error) {
    console.error("Error al generar hash:", error)
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  hashPassword()
}

export { hashPassword }
