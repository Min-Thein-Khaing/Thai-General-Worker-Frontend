"use client"

import { useAdminResourceList } from "@/modules/admin-resources/hooks/use-admin-resource-list"
import type { AdminResourceParams } from "@/types/admin-resource"

export function useCompanies(params: AdminResourceParams, enabled = true) {
  return useAdminResourceList("companies", params, enabled)
}
