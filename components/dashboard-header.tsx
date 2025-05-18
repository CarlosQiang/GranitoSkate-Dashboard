"use client"

import Link from "next/link"
import { LogOut, Menu } from "lucide-react"
import { LogoutButton } from "./logout-button"
import Image from "next/image"

interface DashboardHeaderProps {
  onMenuToggle: () => void
}

export function DashboardHeader({ onMenuToggle }: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button type="button" className="text-gray-500 hover:text-gray-600 lg:hidden" onClick={onMenuToggle}>
              <span className="sr-only">Abrir menú</span>
              <Menu className="h-6 w-6" />
            </button>
            <Link href="/dashboard" className="flex-shrink-0 flex items-center ml-4 lg:ml-0">
              <Image
                src="/logo-con-nombre-marca.png"
                alt="Granito Skateboarding"
                width={180}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
          </div>
          <div className="flex items-center">
            <LogoutButton>
              <span className="sr-only">Cerrar sesión</span>
              <LogOut className="h-5 w-5" />
            </LogoutButton>
          </div>
        </div>
      </div>
    </header>
  )
}
