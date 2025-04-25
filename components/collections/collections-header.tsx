"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export function CollectionsHeader() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)

    if (searchQuery) {
      params.set("q", searchQuery)
    } else {
      params.delete("q")
    }

    router.push(`/dashboard/colecciones?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Colecciones</h1>
        <p className="text-muted-foreground">Gestiona las colecciones de tu tienda Shopify</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar colecciones..."
            className="w-full pl-8 sm:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        <Button asChild>
          <Link href="/dashboard/colecciones/nueva">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Colección
          </Link>
        </Button>
      </div>
    </div>
  )
}
