"use client"

import React, { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabaseClient"
import DataTable from "../../../components/DataTable"

type Attendance = {
  id: string
  staff_id: string
  clock_in: string | null
  clock_out: string | null
  date: string
}

export default function AttendancePage() {
  const [records, setRecords] = useState<Attendance[]>([])

  const fetchAttendance = async () => {
    const { data, error } = await supabase.from("attendance").select("*").order("date", { ascending: false })
    if (error) return console.error(error)
    setRecords(data as Attendance[])
  }

  useEffect(() => {
    fetchAttendance()
  }, [])

  const handleClockIn = async (staffId: string) => {
    const now = new Date().toISOString()
    const { error } = await supabase.from("attendance").upsert([{ staff_id: staffId, clock_in: now, date: now.slice(0,10) }])
    if (error) return console.error(error)
    fetchAttendance()
  }

  const handleClockOut = async (staffId: string) => {
    const now = new Date().toISOString()
    const { error } = await supabase.from("attendance").update({ clock_out: now }).eq("staff_id", staffId).eq("date", now.slice(0,10))
    if (error) return console.error(error)
    fetchAttendance()
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Staff Attendance</h1>
      <DataTable
        columns={["staff_id", "date", "clock_in", "clock_out"]}
        data={records}
      />
      <div className="space-x-2 mt-4">
        <button onClick={() => handleClockIn("staff-uuid")} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Clock In
        </button>
        <button onClick={() => handleClockOut("staff-uuid")} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Clock Out
        </button>
      </div>
    </div>
  )
}