"use client"

import React, { useEffect, useState } from "react"
import { supabase } from "../../lib/supabaseClient"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { utils as XLSXUtils, writeFile as XLSXWriteFile } from "xlsx"
import jsPDF from "jspdf"
import "jspdf-autotable"
import DataTable from "../../components/DataTable"

type Payroll = {
  id: string
  staff_name: string
  hours: number
  rate: number
  total: number
  month: string
}

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([])
  const [chartData, setChartData] = useState<any[]>([])

  const fetchPayrolls = async () => {
    const { data, error } = await supabase.from("payrolls").select("*")
    if (error) return console.error(error)
    setPayrolls(data as Payroll[])
    setChartData(
      (data as Payroll[]).map((p) => ({
        staff_name: p.staff_name,
        total: p.total
      }))
    )
  }

  useEffect(() => {
    fetchPayrolls()
  }, [])

  const exportExcel = () => {
    const data = payrolls.map((p) => ({
      Staff: p.staff_name,
      Hours: p.hours,
      Rate: p.rate,
      Total: p.total,
      Month: p.month
    }))
    const ws = XLSXUtils.json_to_sheet(data)
    const wb = XLSXUtils.book_new()
    XLSXUtils.book_append_sheet(wb, ws, "Payrolls")
    XLSXWriteFile(wb, "payrolls.xlsx")
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    // @ts-ignore
    doc.autoTable({
      head: [["Staff","Hours","Rate","Total","Month"]],
      body: payrolls.map((p) => [p.staff_name,p.hours,p.rate,p.total,p.month])
    })
    doc.save("payrolls.pdf")
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Payroll / Monthly Report</h1>

      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="staff_name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#4ade80" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <DataTable
        columns={["staff_name", "hours", "rate", "total", "month"]}
        data={payrolls}
      />

      <div className="flex space-x-2">
        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600" onClick={exportExcel}>Export Excel</button>
        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600" onClick={exportPDF}>Export PDF</button>
      </div>
    </div>
  )
}