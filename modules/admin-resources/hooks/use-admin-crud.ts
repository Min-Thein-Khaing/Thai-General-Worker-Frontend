"use client"

import { useSWRConfig } from "swr"
import { toast } from "sonner"

import {
  createCompany,
  deleteCompany,
  updateCompany,
} from "@/services/company"
import {
  createManager,
  deleteManager,
  updateManager,
} from "@/services/manager"
import {
  createYear,
  deleteYear,
  updateYear,
} from "@/services/year"
import type { AdminResourcePayload } from "@/types/admin-resource"
import type { AdminResourceName } from "@/modules/admin-resources/hooks/use-admin-resource-list"

const crudOperations = {
  companies: { create: createCompany, update: updateCompany, delete: deleteCompany },
  managers: { create: createManager, update: updateManager, delete: deleteManager },
  years: { create: createYear, update: updateYear, delete: deleteYear },
}

export function useAdminCrud(resource: AdminResourceName) {
  const { mutate } = useSWRConfig()
  const operations = crudOperations[resource]

  const create = async (payload: AdminResourcePayload) => {
    await operations.create(payload)
    await mutate((key) => Array.isArray(key) && key[0] === resource)
    toast.success(`${resource.slice(0, -1)} created`)
  }

  const update = async (id: string | number, payload: AdminResourcePayload) => {
    await operations.update(id, payload)
    await mutate((key) => Array.isArray(key) && key[0] === resource)
    toast.success(`${resource.slice(0, -1)} updated`)
  }

  const remove = async (id: string | number) => {
    await operations.delete(id)
    await mutate((key) => Array.isArray(key) && key[0] === resource)
    toast.success(`${resource.slice(0, -1)} deleted`)
  }

  return { create, update, remove }
}
