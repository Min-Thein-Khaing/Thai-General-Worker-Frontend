"use client"

import useSWR from "swr"

import { getWorker } from "@/services/worker"

export function useWorker(workerId: string) {
  return useSWR(workerId ? ["worker", workerId] : null, () => getWorker(workerId), {
    revalidateOnFocus: false,
  })
}
