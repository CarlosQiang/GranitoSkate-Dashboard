"use client"

import Link from "next/link"
import { MoreHorizontal, Pencil, Copy, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

interface OrdersTableActionsProps {
  order: {
    id: string
    name: string
  }
}

export function OrdersTableActions({ order }: OrdersTableActionsProps) {
  const { toast } = useToast()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/pedidos/${order.id}`}>
            <Pencil className="mr-2 h-4 w-4" />
            Ver detalles
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={`https://${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN}/admin/orders/${order.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Ver en Shopify
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            navigator.clipboard.writeText(order.id)
            toast({
              title: "ID copiado",
              description: "ID del pedido copiado al portapapeles",
            })
          }}
        >
          <Copy className="mr-2 h-4 w-4" />
          Copiar ID
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
