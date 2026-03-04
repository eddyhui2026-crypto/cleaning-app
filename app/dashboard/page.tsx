"use client"

import React, { useEffect, useState } from "react"
import { supabase } from "../../lib/supabaseClient"
import { DataTable } from "../../components/DataTable"

type Quote = {
  id: string
  client: string
  postcode: string
  total: number
  created_at: string
}

export default function DashboardPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])

  const fetchQuotes = async () => {
    const { data, error } = await supabase.from("quotes").select("*")
    if (error) return console.error(error)
    setQuotes(data || [])
  }

  useEffect(() => { fetchQuotes() }, [])

  const columns = [
    { accessorKey: "client", header: "Client" },
    { accessorKey: "postcode", header: "Postcode" },
    { accessorKey: "total", header: "Total £" },
    { accessorKey: "created_at", header: "Date", cell: (info:any) => new Date(info.getValue()).toLocaleDateString() }
  ]

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Quotes</h2>
      <DataTable columns={columns} data={quotes} searchPlaceholder="Search quotes..." />
    </div>
  )
}