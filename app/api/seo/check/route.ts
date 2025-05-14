import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const { url, title, description } = body

    if (!url) {
      return NextResponse.json({ error: "Falta la URL" }, { status: 400 })
    }

    // Simular verificación SEO
    const seoScore = calculateSeoScore(title, description)
    const recommendations = generateRecommendations(title, description)

    return NextResponse.json({
      url,
      seoScore,
      recommendations,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error en verificación SEO:", error)
    return NextResponse.json(
      {
        error: "Error al procesar la verificación SEO",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

// Función para calcular puntuación SEO
function calculateSeoScore(title?: string, description?: string): number {
  let score = 70 // Puntuación base

  if (title) {
    // Evaluar longitud del título
    if (title.length >= 50 && title.length <= 60) {
      score += 10
    } else if (title.length > 30 && title.length < 50) {
      score += 5
    }

    // Evaluar palabras clave en el título
    if (title.includes("producto") || title.includes("comprar") || title.includes("oferta")) {
      score += 5
    }
  } else {
    score -= 15
  }

  if (description) {
    // Evaluar longitud de la descripción
    if (description.length >= 150 && description.length <= 160) {
      score += 10
    } else if (description.length > 100 && description.length < 150) {
      score += 5
    }

    // Evaluar palabras clave en la descripción
    if (
      description.includes("producto") ||
      description.includes("comprar") ||
      description.includes("oferta") ||
      description.includes("calidad")
    ) {
      score += 5
    }
  } else {
    score -= 15
  }

  // Asegurar que la puntuación esté entre 0 y 100
  return Math.max(0, Math.min(100, score))
}

// Función para generar recomendaciones SEO
function generateRecommendations(title?: string, description?: string): string[] {
  const recommendations = []

  if (!title) {
    recommendations.push("Añade un título a tu página")
  } else if (title.length < 30) {
    recommendations.push("El título es demasiado corto. Debería tener entre 50-60 caracteres")
  } else if (title.length > 60) {
    recommendations.push("El título es demasiado largo. Debería tener entre 50-60 caracteres")
  }

  if (!description) {
    recommendations.push("Añade una meta descripción a tu página")
  } else if (description.length < 100) {
    recommendations.push("La descripción es demasiado corta. Debería tener entre 150-160 caracteres")
  } else if (description.length > 160) {
    recommendations.push("La descripción es demasiado larga. Debería tener entre 150-160 caracteres")
  }

  // Recomendaciones generales
  recommendations.push("Incluye palabras clave relevantes en el título y la descripción")
  recommendations.push("Asegúrate de que el contenido de la página sea relevante para el título y la descripción")
  recommendations.push("Optimiza las imágenes con textos alternativos descriptivos")

  return recommendations
}
