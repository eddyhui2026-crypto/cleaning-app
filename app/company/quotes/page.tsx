"use client"

import React, { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabaseClient"
import DataTable from "../../../components/DataTable"

type Quote = {
  id: string
  client_id: string
  hours: number
  cleaners: number
  rate: number
  total: number
  start_date: string
  end_date: string
  created_at: string
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])

  const fetchQuotes = async () => {
    const { data, error } = await supabase.from("quotes").select("*")
    if (error) return console.error(error)
    setQuotes(data as Quote[])
  }

  useEffect(() => {
    fetchQuotes()
  }, [])

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Quotes</h1>
      <DataTable
        columns={["client_id", "hours", "cleaners", "rate", "total", "start_date", "end_date", "created_at"]}
        data={quotes}
      />
    </div>
  )
}