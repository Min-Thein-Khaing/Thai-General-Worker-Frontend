"use client"

import { usePathname } from "next/navigation"

import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { DashboardUserMenu } from "@/components/layout/dashboard-user-menu"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

const pageTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/workers": "Workers",
  "/dashboard/users": "Users",
  "/dashboard/companies": "Companies",
  "/dashboard/managers": "Managers",
  "/dashboard/documents": "Documents",
  "/dashboard/years": "Years",
}

function getPageTitle(pathname: string) {
  if (pageTitles[pathname]) return pageTitles[pathname]
  if (pathname.startsWith("/dashboard/workers/")) return "Worker details"
  return "Workspace"
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset className="min-h-svh min-w-0 bg-background">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80 md:px-6">
          <SidebarTrigger aria-label="Toggle navigation" />
          <Separator orientation="vertical" className="h-5" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-semibold">{getPageTitle(pathname)}</h1>
          </div>
          <DashboardUserMenu />
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
