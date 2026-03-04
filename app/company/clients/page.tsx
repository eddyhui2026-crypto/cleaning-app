"use client"

import React, { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabaseClient"
import DataTable from "../../../components/DataTable"

type Client = {
  id: string
  name: string
  postcode: string
  created_at: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [name, setName] = useState("")
  const [postcode, setPostcode] = useState("")

  const fetchClients = async () => {
    const { data, error } = await supabase.from("clients").select("*")
    if (error) return console.error(error)
    setClients(data as Client[])
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const addClient = async () => {
    if (!name) return alert("Please enter client name")
    const { error } = await supabase.from("clients").insert([{ name, postcode }])
    if (error) return console.error(error)
    setName("")
    setPostcode("")
    fetchClients()
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Clients</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Client Name"
          className="p-2 border rounded"
        />
        <input
          type="text"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          placeholder="Postcode"
          className="p-2 border rounded"
        />
        <button onClick={addClient} className="bg-green-500 text-white p-2 rounded hover:bg-green-600">
          Add Client
        </button>
      </div>

      <DataTable columns={["name", "postcode", "created_at"]} data={clients} />
    </div>
  )
}