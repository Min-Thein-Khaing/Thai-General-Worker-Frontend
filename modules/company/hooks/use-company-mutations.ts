"use client"

import { useAdminCrud } from "@/modules/admin-resources/hooks/use-admin-crud"

export function useCompanyMutations() {
  return useAdminCrud("companies")
}
