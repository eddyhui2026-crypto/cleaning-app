'use client'
import React, { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

type Props = { userId: string | null, refresh: () => void }

export default function QuoteForm({ userId, refresh }: Props) {
  const [client, setClient] = useState('')
  const [postcode, setPostcode] = useState('')
  const [days, setDays] = useState<string[]>([])
  const [hours, setHours] = useState(1)
  const [cleaners, setCleaners] = useState(1)
  const [rate, setRate] = useState(18)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return alert('Please login')
    const total = hours * cleaners * rate
    const { error } = await supabase.from('quotes').insert([{
      client,
      postcode,
      days,
      hours,
      cleaners,
      rate,
      total,
      client_id: userId
    }])
    if (error) console.error(error)
    else {
      alert('Quote added!')
      refresh()
      setClient(''); setPostcode(''); setDays([]); setHours(1); setCleaners(1); setRate(18)
    }
  }

  const toggleDay = (day: string) => {
    setDays(prev => prev.includes(day) ? prev.filter(d=>d!==day) : [...prev, day])
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 border rounded shadow bg-white">
      <h2 className="text-xl font-bold mb-4">Add UK Quote</h2>
      <input placeholder="Client Name" value={client} onChange={e=>setClient(e.target.value)} className="border p-2 w-full mb-2"/>
      <input placeholder="Postcode" value={postcode} onChange={e=>setPostcode(e.target.value)} className="border p-2 w-full mb-2"/>
      <div className="mb-2">
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>(
          <label key={d} className="mr-2">
            <input type="checkbox" checked={days.includes(d)} onChange={()=>toggleDay(d)}/> {d}
          </label>
        ))}
      </div>
      <input type="number" min={1} value={hours} onChange={e=>setHours(Number(e.target.value))} className="border p-2 w-full mb-2" placeholder="Hours"/>
      <input type="number" min={1} value={cleaners} onChange={e=>setCleaners(Number(e.target.value))} className="border p-2 w-full mb-2" placeholder="Cleaners"/>
      <input type="number" min={0} value={rate} onChange={e=>setRate(Number(e.target.value))} className="border p-2 w-full mb-2" placeholder="Rate (£/hr)"/>
      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Add Quote</button>
    </form>
  )
}