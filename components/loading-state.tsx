import { RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface LoadingStateProps {
  message?: string
  fullPage?: boolean
}

export function LoadingState({ message = "Cargando...", fullPage = false }: LoadingStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <RefreshCw className="h-8 w-8 animate-spin mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  )

  if (fullPage) {
    return <div className="flex items-center justify-center min-h-[400px] w-full">{content}</div>
  }

  return (
    <Card>
      <CardContent className="p-0">{content}</CardContent>
    </Card>
  )
}
