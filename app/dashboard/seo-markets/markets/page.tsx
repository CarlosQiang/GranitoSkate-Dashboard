"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Globe, MapPin, Plus, Settings } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { fetchMarkets, fetchBackupRegion } from "@/lib/api/markets"
import type { Market, MarketRegion } from "@/types/markets"
import Link from "next/link"

export default function MarketsPage() {
  const { toast } = useToast()
  const [markets, setMarkets] = useState<Market[]>([])
  const [backupRegion, setBackupRegion] = useState<MarketRegion | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const [marketsData, backupRegionData] = await Promise.all([fetchMarkets(), fetchBackupRegion()])

        setMarkets(marketsData)
        setBackupRegion(backupRegionData)
      } catch (error) {
        console.error("Error loading markets data:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información de mercados",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [toast])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mercados</h1>
            <p className="text-muted-foreground">Gestiona los mercados de tu tienda</p>
          </div>
        </div>
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Cargando...</CardTitle>
              <CardDescription>Obteniendo información de mercados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-40 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mercados</h1>
          <p className="text-muted-foreground">Gestiona los mercados de tu tienda</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/seo-markets/markets/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo mercado
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {markets.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No hay mercados configurados</CardTitle>
              <CardDescription>Configura mercados para ofrecer experiencias de compra localizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Los mercados te permiten configurar precios, idiomas y dominios específicos para diferentes regiones
                geográficas.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/dashboard/seo-markets/markets/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear primer mercado
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {markets.map((market) => (
              <Card key={market.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="flex items-center">
                      {market.name}
                      {market.primary && (
                        <Badge className="ml-2" variant="outline">
                          Principal
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{market.regions.map((region) => region.name).join(", ")}</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/seo-markets/markets/${market.id}`}>
                      <Settings className="h-4 w-4" />
                      <span className="sr-only">Configurar</span>
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Moneda</div>
                      <div className="text-sm text-muted-foreground">
                        {market.currency.code} ({market.currency.symbol})
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Idiomas</div>
                      <div className="text-sm text-muted-foreground">
                        {market.languages.map((lang) => lang.name).join(", ")}
                      </div>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <div className="text-sm font-medium flex items-center">
                        <Globe className="mr-1 h-4 w-4" />
                        Dominio
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {market.web.domain || "No configurado"}
                        {market.web.subfolderSuffix && <span> (/{market.web.subfolderSuffix})</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {backupRegion && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4" />
                    Región de respaldo
                  </CardTitle>
                  <CardDescription>
                    Región utilizada cuando no hay un mercado específico para la ubicación del cliente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">{backupRegion.name}</div>
                    <div className="text-sm text-muted-foreground">Código de país: {backupRegion.countryCode}</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
