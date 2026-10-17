"use client"

import { AdminResourceList } from "@/modules/admin-resources/components/admin-resource-list"

export function UsersPage() {
  return (
    <AdminResourceList
      resource="users"
      title="Users"
      description="Create, search, edit, and manage user accounts and system roles."
    />
  )
}
