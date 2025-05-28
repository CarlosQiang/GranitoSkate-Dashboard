"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerWithRangeProps {
  date: { from: Date | null; to: Date | null }
  onDateChange: (range: { from: Date | null; to: Date | null }) => void
  className?: string
}

export function DatePickerWithRange({ date, onDateChange, className }: DatePickerWithRangeProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const formatDate = (date: Date | null) => {
    if (!date) return ""
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const handleSelect = (range: DateRange | undefined) => {
    if (range) {
      onDateChange({
        from: range.from || null,
        to: range.to || null,
      })
    } else {
      onDateChange({ from: null, to: null })
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn("w-full justify-start text-left font-normal", !date.from && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date.from ? (
              date.to ? (
                <>
                  {formatDate(date.from)} - {formatDate(date.to)}
                </>
              ) : (
                formatDate(date.from)
              )
            ) : (
              <span>Seleccionar fechas</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date.from || undefined}
            selected={{ from: date.from || undefined, to: date.to || undefined }}
            onSelect={handleSelect}
            numberOfMonths={2}
            className="rounded-md border"
          />
          <div className="p-3 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                onDateChange({ from: null, to: null })
                setIsOpen(false)
              }}
            >
              Limpiar fechas
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
