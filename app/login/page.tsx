"use client"
import React, { useState } from "react"
import { supabase } from "../../lib/supabaseClient"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return alert(error.message)
    window.location.href = "/company/dashboard"
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="w-96 p-6 bg-white rounded shadow space-y-4">
        <h2 className="text-xl font-bold">Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button onClick={handleLogin} className="w-full bg-green-500 p-2 text-white rounded hover:bg-green-600">
          Login
        </button>
      </div>
    </div>
  )
}