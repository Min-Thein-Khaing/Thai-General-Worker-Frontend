"use client"

import useSWR from "swr"

import { getWorkers } from "@/services/worker"
import type { WorkerListParams } from "@/types/worker"

export function useWorkers(params: WorkerListParams, enabled = true) {
  return useSWR(enabled ? ["workers", params] : null, () => getWorkers(params), {
    keepPreviousData: true,
    revalidateOnFocus: false,
  })
}
