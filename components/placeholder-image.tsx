import { Package } from "lucide-react"

interface PlaceholderImageProps {
  className?: string
}

export function PlaceholderImage({ className = "h-12 w-12 text-gray-400" }: PlaceholderImageProps) {
  return (
    <div className="flex items-center justify-center h-full w-full bg-gray-100">
      <Package className={className} />
    </div>
  )
}
