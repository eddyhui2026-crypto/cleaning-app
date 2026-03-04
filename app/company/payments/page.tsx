"use client"

import React, { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabaseClient"
import DataTable from "../../../components/DataTable"
import PaymentFormWrapper from "../../../components/PaymentForm"

type Payment = {
  id: string
  quote_id: string
  amount: number
  status: string
  due_date: string
  created_at: string
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])

  const fetchPayments = async () => {
    const { data, error } = await supabase.from("payments").select("*")
    if (error) return console.error(error)
    setPayments(data as Payment[])
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Payments</h1>
      <DataTable
        columns={["quote_id", "amount", "status", "due_date", "created_at"]}
        data={payments}
      />

      <h2 className="text-xl font-semibold mt-6">Make Payment</h2>
      {payments.map((p) => (
        <div key={p.id} className="my-2 p-2 border rounded">
          <p>
            Quote: {p.quote_id}, Amount: £{p.amount}, Status: {p.status}
          </p>
          {p.status !== "Paid" && <PaymentFormWrapper quoteId={p.quote_id} amount={p.amount} onSuccess={fetchPayments} />}
        </div>
      ))}
    </div>
  )
}