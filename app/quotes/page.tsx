'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function QuotesPage() {
  const [clients, setClients] = useState<any[]>([])
  const [selectedClient, setSelectedClient] = useState('')
  const [area, setArea] = useState('')
  const [rate, setRate] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchClients = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('clients').select('id, name').eq('user_id', user.id)
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

    const total = Number(area) * Number(rate)
    const { error } = await supabase.from('quotes').insert([{
      client_id: selectedClient,
      area: Number(area),
      rate: Number(rate),
      total,
      user_id: user.id
    }])

    if (error) setMessage('Failed to add quote: ' + error.message)
    else {
      setMessage('Quote added successfully!')
      setArea('')
      setRate('')
      setSelectedClient('')
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Add Quote</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
        <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)} required>
          <option value="">Select Client</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="number" placeholder="Area" value={area} onChange={e => setArea(e.target.value)} required />
        <input type="number" placeholder="Rate" value={rate} onChange={e => setRate(e.target.value)} required />
        <button type="submit" style={{ padding: '0.5rem', background: '#4ade80', color: 'white', border: 'none', borderRadius: '4px' }}>Add Quote</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  )
}