"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AddJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    client_name: '',
    address: '',
    postcode: '',
    job_date: '',
    start_time: '',      // 新增：開始時間
    estimated_hours: '', // 新增：預計時數
    price: '',
    staff_id: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('jobs')
        .insert([{ 
          ...formData, 
          price: parseFloat(formData.price || '0'),
          estimated_hours: parseFloat(formData.estimated_hours || '0'),
          status: 'pending'
        }]);

      if (error) throw error;

      alert("🎉 Job Added Successfully!");
      router.push('/admin/dashboard');
      
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-indigo-900">New Cleaning Job ✨</h1>
          <p className="text-slate-500 text-sm mt-1">Assign a new task to your team.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* 客戶及地點 */}
          <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <h2 className="font-bold text-indigo-800 text-sm uppercase tracking-wider">Location Details</h2>
            <input 
              required
              className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Client Name"
              onChange={(e) => setFormData({...formData, client_name: e.target.value})}
            />
            <input 
              required
              className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Address"
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-4">
              <input 
                required
                className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                placeholder="Postcode"
                onChange={(e) => setFormData({...formData, postcode: e.target.value})}
              />
              <input 
                required
                type="number"
                step="0.01"
                className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Price (£)"
                onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
            </div>
          </div>

          {/* 時間及分配 */}
          <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <h2 className="font-bold text-indigo-800 text-sm uppercase tracking-wider">Schedule & Staff</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 ml-1">Date</label>
                <input 
                  required
                  type="date"
                  className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => setFormData({...formData, job_date: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 ml-1">Start Time</label>
                <input 
                  required
                  type="time"
                  className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 ml-1">Est. Hours</label>
                <input 
                  required
                  type="number"
                  step="0.5"
                  placeholder="e.g. 2.5"
                  className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => setFormData({...formData, estimated_hours: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 ml-1">Assign Staff</label>
                <input 
                  required
                  placeholder="Staff Name"
                  className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => setFormData({...formData, staff_id: e.target.value})}
                />
              </div>
            </div>

            <textarea 
              className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Special notes for staff..."
              rows={2}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <button 
            disabled={loading}
            type="submit"
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-indigo-700 active:scale-95 transition disabled:bg-slate-400"
          >
            {loading ? "Saving..." : "Create Job 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}