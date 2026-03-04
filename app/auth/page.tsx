'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import NavBar from '../../components/NavBar'

export default function AuthPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  // 登入 / 註冊後自動跳 Dashboard
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) router.push('/dashboard')  // 已登入直接去 Dashboard
    }
    checkUser()
  }, [router])

  // Sign Up
  const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) setMessage('Sign up failed: ' + error.message)
    else {
      setMessage('Sign up successful! Please check your email to confirm.')
      router.push('/dashboard')  // 註冊完成直接跳 Dashboard
    }
  }

  // Login
  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMessage('Login failed: ' + error.message)
    else {
      setMessage('Login successful!')
      router.push('/dashboard')  // 登入成功直接跳 Dashboard
    }
  }

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setMessage('Logged out.')
  }

  return (
    <>
      <NavBar />
      <div className="p-8 max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6">Login / Sign Up</h1>
        {message && <p className="text-green-600 mb-4">{message}</p>}

        <div className="flex flex-col gap-3 mb-4">
          <input
            type="email"
            placeholder="Email"
            className="border p-2 rounded"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-2 rounded"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button onClick={handleSignUp} className="bg-blue-500 text-white px-4 py-2 rounded">
            Sign Up
          </button>
          <button onClick={handleLogin} className="bg-green-500 text-white px-4 py-2 rounded">
            Login
          </button>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
            Logout
          </button>
        </div>
      </div>
    </>
  )
}