import { Loader2 } from "lucide-react"

interface LoadingStateProps {
  message?: string
}

export function LoadingState({ message = "Cargando..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12">
      <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
      <p className="mt-3 sm:mt-4 text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
