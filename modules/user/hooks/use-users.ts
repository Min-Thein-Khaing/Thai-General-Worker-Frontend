"use client"

import { useAdminResourceList } from "@/modules/admin-resources/hooks/use-admin-resource-list"
import type { AdminResourceParams } from "@/types/admin-resource"

export function useUsers(params: AdminResourceParams, enabled = true) {
  return useAdminResourceList("users", params, enabled)
}
