import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SkateSpotsGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array(6)
        .fill(null)
        .map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardHeader>
              <div className="flex items-start justify-between">
                <Skeleton className="h-6 w-[150px]" />
                <Skeleton className="h-5 w-[100px]" />
              </div>
              <Skeleton className="h-4 w-[120px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-[80%] mb-2" />
              <Skeleton className="h-4 w-[60%]" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-full" />
            </CardFooter>
          </Card>
        ))}
    </div>
  )
}
