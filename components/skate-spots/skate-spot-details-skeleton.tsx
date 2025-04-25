import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function SkateSpotDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-[100px]" />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <div className="flex gap-2">
            {Array(3)
              .fill(null)
              .map((_, i) => (
                <Skeleton key={i} className="h-16 w-24 rounded-md" />
              ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-[200px]" />
              <Skeleton className="h-6 w-[100px]" />
            </div>
            <Skeleton className="mt-2 h-4 w-[250px]" />
            <Skeleton className="mt-2 h-5 w-[120px]" />
          </div>

          <Skeleton className="h-20 w-full" />

          <div className="grid gap-4 sm:grid-cols-2">
            {Array(3)
              .fill(null)
              .map((_, i) => (
                <div key={i} className="flex items-center">
                  <Skeleton className="mr-2 h-4 w-4" />
                  <div>
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="mt-1 h-3 w-[120px]" />
                  </div>
                </div>
              ))}
          </div>

          <div>
            <Skeleton className="mb-2 h-5 w-[120px]" />
            <div className="flex flex-wrap gap-2">
              {Array(5)
                .fill(null)
                .map((_, i) => (
                  <Skeleton key={i} className="h-6 w-[80px] rounded-full" />
                ))}
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="reviews" className="w-full">
        <TabsList>
          <TabsTrigger value="reviews">Reseñas</TabsTrigger>
          <TabsTrigger value="map">Mapa</TabsTrigger>
        </TabsList>
        <TabsContent value="reviews" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[150px]" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array(3)
                .fill(null)
                .map((_, i) => (
                  <div key={i} className="border-b pb-4 last:border-0">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-[100px]" />
                      <Skeleton className="h-4 w-[50px]" />
                    </div>
                    <Skeleton className="mt-2 h-4 w-full" />
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
