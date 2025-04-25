import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function OrderDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="mt-2 h-4 w-[150px]" />
        </div>
        <Skeleton className="h-10 w-[150px]" />
      </div>

      <div className="flex gap-2">
        <Skeleton className="h-6 w-[80px]" />
        <Skeleton className="h-6 w-[120px]" />
      </div>

      <Tabs defaultValue="items" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="items">Productos</TabsTrigger>
          <TabsTrigger value="customer">Cliente</TabsTrigger>
          <TabsTrigger value="shipping">Envío</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[100px]" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array(3)
                .fill(null)
                .map((_, i) => (
                  <div key={i} className="flex items-start justify-between border-b pb-4 last:border-0">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-[60px] w-[60px] rounded-md" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-3 w-[150px]" />
                        <Skeleton className="h-3 w-[100px]" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-[80px]" />
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
