"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Package2, LogOut, Menu, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { navigationItems } from "@/config/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function DashboardHeader() {
  const { setTheme, theme } = useTheme()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 sm:h-16 items-center px-3 sm:px-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0 w-56 sm:w-64">
            <div className="px-4 sm:px-7">
              <Link href="/dashboard" className="flex items-center gap-2 font-semibold" onClick={() => setOpen(false)}>
                <Package2 className="h-5 w-5 sm:h-6 sm:w-6 text-granito" />
                <span>GranitoSkate</span>
              </Link>
            </div>
            <div className="mt-6 sm:mt-8 px-4 sm:px-7">
              <nav className="flex flex-col gap-4 sm:gap-6">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 text-xs sm:text-sm font-medium ${
                      pathname === item.href ? "text-foreground" : "text-muted-foreground"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/dashboard" className="flex items-center gap-1 sm:gap-2 font-semibold">
            <Package2 className="h-5 w-5 sm:h-6 sm:w-6 text-granito" />
            <span className="text-sm sm:text-base">GranitoSkate</span>
          </Link>
        </div>
        <div className="hidden md:flex md:items-center md:gap-2">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Package2 className="h-6 w-6 text-granito" />
            <span>GranitoSkate</span>
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            <Sun className="h-4 w-4 sm:h-5 sm:w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 sm:h-5 sm:w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Cambiar tema</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">Cerrar sesión</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleSignOut}>Cerrar sesión</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
