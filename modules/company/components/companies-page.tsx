"use client"

import { AdminResourceList } from "@/modules/admin-resources/components/admin-resource-list"

export function CompaniesPage() {
  return (
    <AdminResourceList
      resource="companies"
      title="Companies"
      description="Create, search, edit, and manage company records."
    />
  )
}
