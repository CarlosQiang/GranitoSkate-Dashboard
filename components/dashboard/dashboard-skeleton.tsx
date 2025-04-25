import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array(4)
        .fill(null)
        .map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-12 mb-1" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-4 w-24" />
            </CardFooter>
          </Card>
        ))}
    </div>
  )
}
