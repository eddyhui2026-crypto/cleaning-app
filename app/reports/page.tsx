"use client"

import React, { useEffect, useState } from "react"
import { supabase } from "../../lib/supabaseClient"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { ExportableTable } from "../../components/ExportableTable"

type ReportItem = {
  month: string
  total: number
}

type QuoteItem = {
  created_at: string
  total: number
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([])

  useEffect(() => {
    const fetchReports = async () => {
      const { data, error } = await supabase.from("quotes").select("*")
      if (error) return console.error(error)

      const quotes: QuoteItem[] = (data || []).map((q: any) => ({
        created_at: q.created_at,
        total: q.total || 0,
      }))

      // Group by month
      const monthly: Record<string, number> = {}
      quotes.forEach((q) => {
        if (!q.created_at) return
        const month = new Date(q.created_at).toLocaleString("default", { month: "short", year: "numeric" })
        monthly[month] = (monthly[month] || 0) + (q.total || 0)
      })

      const reportData = Object.entries(monthly).map(([month, total]) => ({ month, total }))
      setReports(reportData)
    }
    fetchReports()
  }, [])

  const columns = [
    { accessorKey: "month", header: "Month" },
    { accessorKey: "total", header: "Total £" }
  ]

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold mb-4">Monthly Revenue Reports</h2>

      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={reports}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#4ade80" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ExportableTable columns={columns} data={reports} searchPlaceholder="Search reports..." />
    </div>
  )
}