"use client"

import { AdminResourceList } from "@/modules/admin-resources/components/admin-resource-list"

export function ManagersPage() {
  return (
    <AdminResourceList
      resource="managers"
      title="Managers"
      description="Create, search, edit, and manage manager records."
    />
  )
}
