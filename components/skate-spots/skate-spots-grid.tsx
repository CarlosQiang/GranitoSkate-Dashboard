import Image from "next/image"
import Link from "next/link"
import { MapPin, Star } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Datos de ejemplo para los skate spots
const skateSpots = [
  {
    id: "1",
    name: "Downtown Skatepark",
    location: "Centro de la ciudad",
    description: "Un skatepark moderno con rampas, rails y bowls para todos los niveles.",
    difficulty: "Intermedio",
    rating: 4.5,
    image: "/placeholder.svg?key=vs87c",
  },
  {
    id: "2",
    name: "Beach Bowl",
    location: "Playa Norte",
    description: "Bowl de concreto con vista al mar, perfecto para sesiones al atardecer.",
    difficulty: "Avanzado",
    rating: 4.8,
    image: "/concrete-curve.png",
  },
  {
    id: "3",
    name: "Plaza Central",
    location: "Centro histórico",
    description: "Spot urbano con escaleras, barandillas y gaps. Cuidado con la seguridad.",
    difficulty: "Intermedio",
    rating: 4.2,
    image: "/city-ledge-ollie.png",
  },
  {
    id: "4",
    name: "Parque Extremo",
    location: "Zona norte",
    description: "Skatepark público con secciones para principiantes y expertos.",
    difficulty: "Principiante",
    rating: 4.0,
    image: "/placeholder.svg?key=c8cdj",
  },
  {
    id: "5",
    name: "La Rampa",
    location: "Distrito industrial",
    description: "Half-pipe cubierto y área de street. Abierto hasta tarde.",
    difficulty: "Avanzado",
    rating: 4.7,
    image: "/placeholder.svg?key=6cs9z",
  },
  {
    id: "6",
    name: "Skate School",
    location: "Zona educativa",
    description: "Skatepark con instructores disponibles. Ideal para aprender.",
    difficulty: "Principiante",
    rating: 4.3,
    image: "/placeholder.svg?height=200&width=400&query=skate+school",
  },
]

export function SkateSpotsGrid() {
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
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {skateSpots.map((spot) => (
        <Card key={spot.id} className="overflow-hidden">
          <div className="relative h-48 w-full">
            <Image src={spot.image || "/placeholder.svg"} alt={spot.name} fill className="object-cover" />
          </div>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle>{spot.name}</CardTitle>
              <Badge className={getDifficultyColor(spot.difficulty)}>{spot.difficulty}</Badge>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="mr-1 h-4 w-4" />
              {spot.location}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{spot.description}</p>
            <div className="mt-2 flex items-center">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="ml-1 text-sm font-medium">{spot.rating}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/dashboard/skate-spots/${spot.id}`}>Ver detalles</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
