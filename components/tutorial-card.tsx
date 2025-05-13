import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface TutorialCardProps {
  tutorial: any
}

export function TutorialCard({ tutorial }: TutorialCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold line-clamp-2">{tutorial.titulo}</h3>
          {tutorial.destacado && (
            <Badge variant="secondary" className="ml-2 shrink-0">
              Destacado
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
          {tutorial.nivel_dificultad && (
            <Badge variant="outline" className="capitalize">
              {tutorial.nivel_dificultad}
            </Badge>
          )}
          {tutorial.tiempo_estimado && <Badge variant="outline">{tutorial.tiempo_estimado} min</Badge>}
        </div>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">{tutorial.descripcion}</p>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between items-center text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>
            {tutorial.fecha_actualizacion
              ? `Actualizado ${formatDistanceToNow(new Date(tutorial.fecha_actualizacion), {
                  addSuffix: true,
                  locale: es,
                })}`
              : `Creado ${formatDistanceToNow(new Date(tutorial.fecha_creacion), {
                  addSuffix: true,
                  locale: es,
                })}`}
          </span>
        </div>
        <div className="flex gap-1">
          {tutorial.publicado ? (
            <Badge variant="success" className="text-xs">
              Publicado
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">
              Borrador
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
