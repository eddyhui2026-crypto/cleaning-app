'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function ClientsPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [clients, setClients] = useState<any[]>([])

  useEffect(() => {
    const fetchClients = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await supabase.from('clients').select('*').eq('user_id', user.id)
      if (data) setClients(data)
    }
    fetchClients()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setMessage('Please log in first!')
      return
    }

    const { error } = await supabase.from('clients').insert([{
      name, email, phone, user_id: user.id
    }])

    if (error) setMessage('Failed to add client: ' + error.message)
    else {
      setMessage('Client added successfully!')
      setName('')
      setEmail('')
      setPhone('')
      setClients([...clients, { name, email, phone }])
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Add Client</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
        <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="tel" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} required />
        <button type="submit" style={{ padding: '0.5rem', background: '#4ade80', color: 'white', border: 'none', borderRadius: '4px' }}>Add Client</button>
      </form>
      {message && <p>{message}</p>}

      <h2 style={{ marginTop: '2rem' }}>Your Clients</h2>
      <ul>
        {clients.map((c, idx) => <li key={idx}>{c.name} - {c.email} - {c.phone}</li>)}
      </ul>
    </div>
  )
}