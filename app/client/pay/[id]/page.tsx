"use client";
import { useEffect, useState, use } from 'react'; // 1. 加埋 'use'
import { supabase } from '@/lib/supabaseClient';

export default function ClientPayPage({ params }: { params: Promise<{ id: string }> }) {
  // 2. 用 React.use() 解開 params 攞出 id
  const { id } = use(params); 
  
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id) // 3. 直接用解開咗嘅 id
        .single();
      
      if (error) console.error("Error fetching job:", error.message);
      if (data) setJob(data);
      setLoading(false);
    };
    fetchJob();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Loading Invoice...</div>;
  if (!job) return <div className="p-10 text-center">Job not found.</div>;

  const handlePayment = async () => {
    setLoading(true);
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId: job.id,
        price: job.price,
        address: job.address
      }),
    });

    const { url, error } = await response.json();
    if (url) {
      window.location.href = url;
    } else {
      alert("Stripe Error: " + error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-900">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* 顯示相片 */}
        <div className="h-64 bg-slate-200 relative">
          {job.photo_url ? (
            <img 
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/cleaning-photos/${job.photo_url}`} 
              alt="Clean Home Proof"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 italic">
              Photo proof pending...
            </div>
          )}
          <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            COMPLETED ✅
          </div>
        </div>

        {/* 單據詳情 */}
        <div className="p-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Service Completed</h1>
          <p className="text-slate-500 text-sm mb-6">{job.address}, {job.postcode}</p>

          <div className="flex justify-between items-center py-4 border-t border-b border-slate-100 mb-6">
            <span className="text-slate-600 font-medium">Total Amount Due</span>
            <span className="text-3xl font-extrabold text-indigo-600">£{job.price}</span>
          </div>

          {job.status === 'paid' ? (
            <div className="w-full bg-emerald-100 text-emerald-700 py-4 rounded-2xl font-bold text-center">
              Payment Received! Thank you. 🙏
            </div>
          ) : (
            <button 
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-bold text-xl shadow-lg active:scale-95 transition"
            >
              {loading ? "Processing..." : "Pay Now Securely 💳"}
            </button>
          )}

          <p className="text-center text-xs text-slate-400 mt-6">
            Secure payment powered by <strong>Stripe</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
