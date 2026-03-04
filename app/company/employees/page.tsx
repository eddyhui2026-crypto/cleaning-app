"use client"

import React, { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabaseClient"
import DataTable from "../../../components/DataTable"

type Employee = {
  id: string
  name: string
  role: string
  created_at: string
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [name, setName] = useState("")
  const [role, setRole] = useState("Staff")

  const fetchEmployees = async () => {
    const { data, error } = await supabase.from("employees").select("*")
    if (error) return console.error(error)
    setEmployees(data as Employee[])
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const addEmployee = async () => {
    if (!name) return alert("Please enter employee name")
    const { error } = await supabase.from("employees").insert([{ name, role }])
    if (error) return console.error(error)
    setName("")
    setRole("Staff")
    fetchEmployees()
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Employees</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Employee Name"
          className="p-2 border rounded"
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="p-2 border rounded">
          <option value="Staff">Staff</option>
          <option value="Supervisor">Supervisor</option>
        </select>
        <button onClick={addEmployee} className="bg-green-500 text-white p-2 rounded hover:bg-green-600">
          Add Employee
        </button>
      </div>

      <DataTable columns={["name", "role", "created_at"]} data={employees} />
    </div>
  )
}