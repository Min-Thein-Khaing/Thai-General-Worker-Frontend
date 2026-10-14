"use client"

import { AdminResourceList } from "@/modules/admin-resources/components/admin-resource-list"

export function YearsPage() {
  return (
    <AdminResourceList
      resource="years"
      title="Years"
      description="Create, search, edit, and manage year records."
    />
  )
}
