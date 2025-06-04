"use client"

import { ErrorHandler } from "@/components/error-handler"

export default function CollectionsError({ error, reset }) {
  return <ErrorHandler error={error} reset={reset} />
}
