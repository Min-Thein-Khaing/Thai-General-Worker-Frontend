"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  FileText,
  ShieldCheck,
  Users,
  UsersRound,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { useAuthStore } from "@/store/auth-store"
import { useReportNotifications } from "@/modules/worker/hooks/use-report-notifications"

const navItems = [
  { href: "/dashboard", label: "Overview", icon: BarChart3, roles: ["ADMIN", "MANAGER", "GENERAL_WORKER"] },
  { href: "/dashboard/workers", label: "Workers", icon: BriefcaseBusiness, roles: ["ADMIN", "MANAGER"] },
  { href: "/dashboard/documents", label: "Documents", icon: FileText, roles: ["ADMIN", "MANAGER", "GENERAL_WORKER"] },
  { href: "/dashboard/users", label: "Users", icon: Users, roles: ["ADMIN"] },
  { href: "/dashboard/companies", label: "Companies", icon: Building2, roles: ["ADMIN"] },
  { href: "/dashboard/managers", label: "Managers", icon: UsersRound, roles: ["ADMIN"] },
  { href: "/dashboard/years", label: "Years", icon: BarChart3, roles: ["ADMIN"] },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const role = useAuthStore((state) => state.user?.role ?? "GENERAL_WORKER")
  const notifications = useReportNotifications(role === "ADMIN")
  const notificationCount = notifications.data?.length ?? 0
  const visibleItems = navItems.filter((item) => item.roles.includes(role))

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <span className="grid min-w-0 text-left group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold">Thai General Worker</span>
            <span className="truncate text-xs text-sidebar-foreground/65">Operations workspace</span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => {
                const Icon = item.icon
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(`${item.href}/`)

                const hasNotification = item.href === "/dashboard/workers" && notificationCount > 0
                const tooltipText = hasNotification
                  ? `${item.label} (${notificationCount} due in 7 days)`
                  : item.label

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={tooltipText}
                      className="relative"
                    >
                      <Icon aria-hidden="true" />
                      <span>{item.label}</span>
                      {hasNotification ? (
                        <>
                          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500/20 px-1.5 text-[10px] font-bold text-amber-600 group-data-[collapsible=icon]:hidden dark:bg-amber-500/30 dark:text-amber-400">
                            {notificationCount}
                          </span>
                          <span className="absolute top-2 right-2 size-2 rounded-full bg-amber-500 hidden group-data-[collapsible=icon]:block" />
                        </>
                      ) : null}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3">
        <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-3 group-data-[collapsible=icon]:hidden">
          <p className="text-xs font-medium text-sidebar-foreground">Thai General Worker</p>
          <p className="mt-1 text-xs text-sidebar-foreground/65">Worker administration</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
