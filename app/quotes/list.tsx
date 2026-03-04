'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function QuotesList() {
  const [quotes, setQuotes] = useState<any[]>([])
  const [editQuoteId, setEditQuoteId] = useState<string | null>(null)
  const [area, setArea] = useState('')
  const [rate, setRate] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchQuotes = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await supabase
        .from('quotes')
        .select('id, client_id, area, rate, total, created_at, clients(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) setMessage('Error fetching quotes: ' + error.message)
      else setQuotes(data || [])
    }
    fetchQuotes()
  }, [])

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('quotes').delete().eq('id', id)
    if (error) setMessage('Delete failed: ' + error.message)
    else setQuotes(quotes.filter(q => q.id !== id))
  }

  const handleEdit = (quote: any) => {
    setEditQuoteId(quote.id)
    setArea(String(quote.area))
    setRate(String(quote.rate))
  }

  const handleUpdate = async () => {
    const total = Number(area) * Number(rate)
    const { error } = await supabase.from('quotes').update({ area: Number(area), rate: Number(rate), total }).eq('id', editQuoteId)
    if (error) setMessage('Update failed: ' + error.message)
    else {
      setQuotes(quotes.map(q => q.id === editQuoteId ? { ...q, area: Number(area), rate: Number(rate), total } : q))
      setEditQuoteId(null)
      setArea('')
      setRate('')
      setMessage('Quote updated successfully!')
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Your Quotes</h1>
      {message && <p className="mb-4 text-green-600">{message}</p>}

      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-2 py-1">Client</th>
            <th className="border border-gray-300 px-2 py-1">Area</th>
            <th className="border border-gray-300 px-2 py-1">Rate</th>
            <th className="border border-gray-300 px-2 py-1">Total</th>
            <th className="border border-gray-300 px-2 py-1">Date</th>
            <th className="border border-gray-300 px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map(q => (
            <tr key={q.id}>
              <td className="border border-gray-300 px-2 py-1">{q.clients.name}</td>
              <td className="border border-gray-300 px-2 py-1">
                {editQuoteId === q.id ? <input className="border p-1" type="number" value={area} onChange={e => setArea(e.target.value)} /> : q.area}
              </td>
              <td className="border border-gray-300 px-2 py-1">
                {editQuoteId === q.id ? <input className="border p-1" type="number" value={rate} onChange={e => setRate(e.target.value)} /> : q.rate}
              </td>
              <td className="border border-gray-300 px-2 py-1">{q.total}</td>
              <td className="border border-gray-300 px-2 py-1">{new Date(q.created_at).toLocaleString()}</td>
              <td className="border border-gray-300 px-2 py-1 flex gap-2">
                {editQuoteId === q.id ? (
                  <button className="bg-green-500 text-white px-2 py-1 rounded" onClick={handleUpdate}>Save</button>
                ) : (
                  <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={() => handleEdit(q)}>Edit</button>
                )}
                <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => handleDelete(q.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}