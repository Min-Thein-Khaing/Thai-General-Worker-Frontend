"use client"

import * as React from "react"
import { ResponsiveContainer } from "recharts"

import { cn } from "@/lib/utils"

function ChartContainer({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ResponsiveContainer> & { className?: string }) {
  return (
    <div data-slot="chart" className={cn("h-[280px] w-full text-xs", className)}>
      <ResponsiveContainer width="100%" height="100%" {...props}>
        {children}
      </ResponsiveContainer>
    </div>
  )
}

export { ChartContainer }
