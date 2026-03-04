'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function NavBar() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const session = supabase.auth.getSession().then(r => setUser(r.data.session?.user))
    supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user))
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <nav className="p-4 bg-gray-800 text-white flex justify-between">
      <div className="font-bold text-xl">Cleaning Dashboard</div>
      {user && (
        <div>
          <span className="mr-4">{user.email}</span>
          <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded">Logout</button>
        </div>
      )}
    </nav>
  )
}