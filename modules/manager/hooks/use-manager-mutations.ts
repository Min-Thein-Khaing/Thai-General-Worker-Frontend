"use client"

import { useAdminCrud } from "@/modules/admin-resources/hooks/use-admin-crud"

export function useManagerMutations() {
  return useAdminCrud("managers")
}
