import { hashPassword } from "../lib/auth-service"
import { prisma } from "../lib/prisma"

async function main() {
  try {
    // Verificar si ya existe un usuario administrador
    const existingAdmin = await prisma.user.findFirst({
      where: {
        email: "admin@granitoskate.com",
      },
    })

    if (!existingAdmin) {
      // Crear usuario administrador
      const hashedPassword = await hashPassword("adminPassword123")

      await prisma.user.create({
        data: {
          name: "Administrador",
          email: "admin@granitoskate.com",
          password: hashedPassword,
          role: "admin",
        },
      })

      console.log("✅ Usuario administrador creado correctamente")
    } else {
      console.log("ℹ️ El usuario administrador ya existe")
    }

    // No se crean datos de prueba, solo el administrador
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
