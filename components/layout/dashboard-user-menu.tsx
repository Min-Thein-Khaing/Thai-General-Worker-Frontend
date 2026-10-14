"use client"

import { LogOut } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logoutAndRedirect } from "@/lib/axios"
import { useAuthStore } from "@/store/auth-store"

export function DashboardUserMenu() {
  const user = useAuthStore((state) => state.user)
  const role = user?.role ?? "GENERAL_WORKER"
  const initials =
    user?.fullName
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() ?? "TW"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="h-auto gap-2 px-2 py-1.5">
            <Avatar>
              {user?.imageUrl ? <AvatarImage src={user.imageUrl} alt="" /> : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden min-w-0 text-left sm:grid">
              <span className="max-w-40 truncate text-sm font-medium">{user?.fullName ?? "Account"}</span>
              <span className="max-w-40 truncate text-xs text-muted-foreground">{user?.email ?? ""}</span>
            </span>
            <span className="sr-only">Open account menu</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-56">
        <div className="px-1.5 py-2">
          <div className="flex items-center justify-between gap-3">
            <span className="grid min-w-0">
              <span className="truncate text-sm font-medium">{user?.fullName ?? "Account"}</span>
              <span className="truncate text-xs text-muted-foreground">{user?.email ?? ""}</span>
            </span>
            <Badge variant="secondary">{role.replaceAll("_", " ")}</Badge>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void logoutAndRedirect()} variant="destructive">
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
