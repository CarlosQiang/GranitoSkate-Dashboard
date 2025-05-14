import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Insertar tutorial de ejemplo
  const tutorialEjemplo = await prisma.tutorial.upsert({
    where: { slug: "como-elegir-tu-primera-tabla-de-skate" },
    update: {},
    create: {
      titulo: "Cómo elegir tu primera tabla de skate",
      slug: "como-elegir-tu-primera-tabla-de-skate",
      descripcion: "Guía completa para principiantes sobre cómo elegir la tabla de skate perfecta para empezar.",
      contenido: `
# Cómo elegir tu primera tabla de skate

## Introducción

Elegir tu primera tabla de skate puede ser abrumador con tantas opciones disponibles. Esta guía te ayudará a entender los aspectos más importantes a considerar.

## Tamaño de la tabla

El ancho de la tabla es uno de los factores más importantes:

- **7.5" - 7.75"**: Para niños o adultos con pies pequeños
- **7.75" - 8.25"**: Tamaño más común para adolescentes y adultos
- **8.25" - 8.5"**: Para patinadores más altos o con pies grandes

## Forma y cóncavo

La forma de la tabla afecta cómo se siente bajo tus pies:

- **Cóncavo bajo**: Más estable, ideal para principiantes
- **Cóncavo medio**: Equilibrio entre estabilidad y capacidad de respuesta
- **Cóncavo alto**: Mayor capacidad de respuesta, para trucos técnicos

## Materiales

La mayoría de las tablas están hechas de 7 capas de arce canadiense, pero algunas marcas utilizan materiales adicionales para mayor durabilidad o ligereza.

## Marcas recomendadas

Algunas marcas confiables para principiantes incluyen:

- GranitoSkate
- Element
- Powell-Peralta
- Baker
- Real

## Conclusión

No te preocupes demasiado por tu primera elección. Lo más importante es comenzar a patinar y aprender. Con el tiempo, desarrollarás preferencias personales.
      `,
      imagen_url: "https://example.com/images/primera-tabla-skate.jpg",
      nivel_dificultad: "principiante",
      tiempo_estimado: 10,
      categorias: ["Equipamiento", "Principiantes"],
      tags: ["tabla", "skate", "principiante", "compra"],
      publicado: true,
      destacado: true,
      fecha_publicacion: new Date(),
      metadatos: {
        video_url: "https://www.youtube.com/watch?v=example",
        productos_relacionados: ["gid://shopify/Product/123456789"],
      },
    },
  })

  console.log("Tutorial de ejemplo creado:", tutorialEjemplo)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
