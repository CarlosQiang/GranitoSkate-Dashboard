import type { ReactNode } from "react"

interface FormContainerProps {
  children: ReactNode
  className?: string
}

export function FormContainer({ children, className = "" }: FormContainerProps) {
  return <div className={`max-w-4xl mx-auto px-4 sm:px-6 ${className}`}>{children}</div>
}
