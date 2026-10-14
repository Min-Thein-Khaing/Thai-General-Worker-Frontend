"use client"

import { useAdminResourceList } from "@/modules/admin-resources/hooks/use-admin-resource-list"
import type { AdminResourceParams } from "@/types/admin-resource"

export function useManagers(params: AdminResourceParams, enabled = true) {
  return useAdminResourceList("managers", params, enabled)
}
