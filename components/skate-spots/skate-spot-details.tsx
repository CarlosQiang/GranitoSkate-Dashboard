"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { MapPin, Star, Clock, Calendar, Users, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Datos de ejemplo para un skate spot específico
const skateSpotData = {
  "1": {
    id: "1",
    name: "Downtown Skatepark",
    location: "Centro de la ciudad, Calle Principal #123",
    description:
      "Un skatepark moderno con rampas, rails y bowls para todos los niveles. Cuenta con iluminación nocturna y está abierto todos los días. Hay fuentes de agua y baños disponibles. Se organizan competencias mensuales.",
    difficulty: "Intermedio",
    rating: 4.5,
    openHours: "8:00 AM - 10:00 PM",
    bestTime: "Tardes y fines de semana",
    crowdLevel: "Moderado",
    features: ["Half-pipe", "Bowl", "Rails", "Stairs", "Funbox"],
    images: [
      "/placeholder.svg?height=400&width=600&query=skatepark+main",
      "/placeholder.svg?height=400&width=600&query=skatepark+ramp",
      "/placeholder.svg?height=400&width=600&query=skatepark+rail",
    ],
    reviews: [
      { user: "Carlos R.", rating: 5, comment: "El mejor skatepark de la ciudad. Muy bien mantenido." },
      { user: "Laura M.", rating: 4, comment: "Buenas instalaciones, pero se llena los fines de semana." },
      { user: "Miguel A.", rating: 4.5, comment: "Excelente para practicar, tiene secciones para todos los niveles." },
    ],
  },
  "2": {
    id: "2",
    name: "Beach Bowl",
    location: "Playa Norte, Paseo Marítimo",
    description:
      "Bowl de concreto con vista al mar, perfecto para sesiones al atardecer. El spot está situado junto al paseo marítimo y ofrece una experiencia única de skate con vistas panorámicas al océano.",
    difficulty: "Avanzado",
    rating: 4.8,
    openHours: "24 horas",
    bestTime: "Atardecer",
    crowdLevel: "Bajo",
    features: ["Bowl profundo", "Sección street", "Vista al mar"],
    images: [
      "/placeholder.svg?height=400&width=600&query=beach+bowl+skate",
      "/placeholder.svg?height=400&width=600&query=ocean+view+skatepark",
      "/placeholder.svg?height=400&width=600&query=concrete+bowl+skate",
    ],
    reviews: [
      { user: "Ana P.", rating: 5, comment: "Increíble spot con vistas espectaculares. El bowl es perfecto." },
      { user: "David L.", rating: 5, comment: "Mi lugar favorito para patinar al atardecer." },
      { user: "Sofía G.", rating: 4.5, comment: "Bowl desafiante pero muy divertido. Recomendado para avanzados." },
    ],
  },
}

interface SkateSpotDetailsProps {
  spotId: string
}

export function SkateSpotDetails({ spotId }: SkateSpotDetailsProps) {
  const router = useRouter()
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // En un caso real, aquí cargaríamos los datos del spot desde una API
  const spot = skateSpotData[spotId as keyof typeof skateSpotData]

  if (!spot) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center">
        <p className="text-muted-foreground">No se encontró el spot de skate</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/dashboard/skate-spots")}>
          Volver a spots
        </Button>
      </div>
    )
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Principiante":
        return "bg-green-500"
      case "Intermedio":
        return "bg-blue-500"
      case "Avanzado":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.push("/dashboard/skate-spots")} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a spots
      </Button>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <Image
              src={spot.images[activeImageIndex] || "/placeholder.svg"}
              alt={`${spot.name} - Imagen ${activeImageIndex + 1}`}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex gap-2 overflow-auto pb-2">
            {spot.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setActiveImageIndex(index)}
                className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md border-2 ${
                  activeImageIndex === index ? "border-primary" : "border-transparent"
                }`}
              >
                <Image src={image || "/placeholder.svg"} alt={`Miniatura ${index + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{spot.name}</h2>
              <Badge className={getDifficultyColor(spot.difficulty)}>{spot.difficulty}</Badge>
            </div>
            <div className="mt-1 flex items-center text-muted-foreground">
              <MapPin className="mr-1 h-4 w-4" />
              {spot.location}
            </div>
            <div className="mt-2 flex items-center">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="ml-1 font-medium">{spot.rating}</span>
              <span className="ml-1 text-muted-foreground">({spot.reviews.length} reseñas)</span>
            </div>
          </div>

          <p>{spot.description}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Horario</p>
                <p className="text-sm text-muted-foreground">{spot.openHours}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Mejor momento</p>
                <p className="text-sm text-muted-foreground">{spot.bestTime}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Nivel de gente</p>
                <p className="text-sm text-muted-foreground">{spot.crowdLevel}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-medium">Características</h3>
            <div className="flex flex-wrap gap-2">
              {spot.features.map((feature, index) => (
                <Badge key={index} variant="outline">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="reviews" className="w-full">
        <TabsList>
          <TabsTrigger value="reviews">Reseñas</TabsTrigger>
          <TabsTrigger value="map">Mapa</TabsTrigger>
        </TabsList>
        <TabsContent value="reviews" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Reseñas de usuarios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {spot.reviews.map((review, index) => (
                <div key={index} className="border-b pb-4 last:border-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{review.user}</p>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 text-sm">{review.rating}</span>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="map" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Ubicación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-muted-foreground">Mapa no disponible en la versión de demostración</p>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Dirección completa: {spot.location}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
