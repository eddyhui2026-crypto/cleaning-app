"use client"

import React, { useEffect, useState } from "react"
import { supabase } from "../../lib/supabaseClient"
import DataTable from "../../components/DataTable"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"

type CompanyDashboardProps = {}

type QuoteSummary = {
  client: string
  total: number
}

export default function CompanyDashboard({}: CompanyDashboardProps) {
  const [quotes, setQuotes] = useState<QuoteSummary[]>([])
  const [chartData, setChartData] = useState<any[]>([])

  const fetchQuotes = async () => {
    const { data, error } = await supabase
      .from("quotes")
      .select(`
        total,
        client_id,
        clients(name)
      `)
      .order("created_at", { ascending: false })
    if (error) return console.error(error)

    const mapped = data.map((q: any) => ({
      client: q.clients.name,
      total: q.total,
    }))
    setQuotes(mapped)
    setChartData(mapped)
  }

  useEffect(() => {
    fetchQuotes()
  }, [])

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Company Dashboard</h1>

      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="client" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" stackId="a" fill="#4ade80" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Recent Quotes</h2>
        <DataTable columns={["client", "total"]} data={quotes} />
      </div>
    </div>
  )
}