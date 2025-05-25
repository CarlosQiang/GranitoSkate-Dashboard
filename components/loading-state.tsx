import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

interface LoadingStateProps {
  message?: string
  count?: number
}

export function LoadingState({ message = "Cargando...", count = 3 }: LoadingStateProps) {
  return (
    <div className="space-y-4">
      <div className="text-center text-muted-foreground">{message}</div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {Array(count)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-48 w-full mb-4" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )
}
