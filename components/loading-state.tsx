import { RefreshCw } from "lucide-react"

interface LoadingStateProps {
  message?: string
  size?: "sm" | "md" | "lg"
}

export function LoadingState({ message = "Cargando...", size = "md" }: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <RefreshCw className={`${sizeClasses[size]} animate-spin text-primary mb-2`} />
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}
