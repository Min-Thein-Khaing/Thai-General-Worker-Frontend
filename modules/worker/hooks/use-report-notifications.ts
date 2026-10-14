"use client"

import useSWR from "swr"

import { getReportNotifications } from "@/services/worker"

export function useReportNotifications(enabled: boolean) {
  return useSWR(enabled ? "worker-report-notifications" : null, getReportNotifications, {
    revalidateOnFocus: false,
  })
}
