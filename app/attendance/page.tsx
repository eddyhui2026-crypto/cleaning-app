"use client"
import React, { useEffect, useState } from "react"
import { supabase } from "../../lib/supabaseClient"
import { ExportableTable } from "../../components/ExportableTable"

type Employee = {
  id: string
  name: string
  position: string
  hours: number
  created_at: string
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase.from("employees").select("*")
      if (error) return console.error(error)
      setEmployees(data || [])
    }
    fetchEmployees()
  }, [])

  const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "position", header: "Position" },
    { accessorKey: "hours", header: "Hours Worked" },
    { accessorKey: "created_at", header: "Joined", cell: (info: any) => new Date(info.getValue()).toLocaleDateString() }
  ]

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Employees / Attendance</h2>
      <ExportableTable columns={columns} data={employees} searchPlaceholder="Search employees..." />
    </div>
  )
}