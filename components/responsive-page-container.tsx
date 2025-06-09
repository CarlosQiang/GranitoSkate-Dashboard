import type { ReactNode } from "react"

interface ResponsivePageContainerProps {
  children: ReactNode
  className?: string
}

export function ResponsivePageContainer({ children, className = "" }: ResponsivePageContainerProps) {
  return (
    <div className={`min-h-screen w-full overflow-x-hidden ${className}`}>
      <div className="container mx-auto px-4 py-6 max-w-7xl">{children}</div>
    </div>
  )
}
