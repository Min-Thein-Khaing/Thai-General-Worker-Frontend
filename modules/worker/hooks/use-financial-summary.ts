"use client"

import useSWR from "swr"

import { getFinancialSummary } from "@/services/worker"

export function useFinancialSummary(enabled: boolean) {
  return useSWR(enabled ? "worker-financial-summary" : null, getFinancialSummary, {
    revalidateOnFocus: false,
  })
}
