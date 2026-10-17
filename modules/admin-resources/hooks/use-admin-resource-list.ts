"use client"

import useSWR from "swr"

import type { AdminResourceParams } from "@/types/admin-resource"
import { getCompanies } from "@/services/company"
import { getManagers } from "@/services/manager"
import { getYears } from "@/services/year"
import { getUsers } from "@/services/user"

const listFetchers = {
  companies: getCompanies,
  managers: getManagers,
  years: getYears,
  users: getUsers,
}

export type AdminResourceName = keyof typeof listFetchers

export function useAdminResourceList(
  resource: AdminResourceName,
  params: AdminResourceParams,
  enabled = true
) {
  const fetcher = listFetchers[resource]
  return useSWR(enabled ? [resource, params] : null, () => fetcher(params), {
    keepPreviousData: true,
    revalidateOnFocus: false,
  })
}
