"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import imageCompression from 'browser-image-compression';

export default function StaffDashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  // 1. Fetch Today's Jobs for the staff
  useEffect(() => {
    const fetchJobs = async () => {
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'pending')
        .order('job_date', { ascending: true });
      if (data) setJobs(data);
    };
    fetchJobs();
  }, []);

  // 2. Handle Photo Upload + Auto-Compression (Saves Storage Costs!)
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, jobId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(jobId);
    try {
      // Compress to 200KB to keep your Supabase bill at £0
      const compressedFile = await imageCompression(file, { maxSizeMB: 0.2, maxWidthOrHeight: 1024 });
      
      const filePath = `proofs/${jobId}-${Date.now()}.webp`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cleaning-photos')
        .upload(filePath, compressedFile);

      if (uploadError) throw uploadError;

      // Update Job status to 'completed' and save photo URL
      const { error: updateError } = await supabase
        .from('jobs')
        .update({ 
          status: 'completed', 
          photo_url: filePath 
        })
        .eq('id', jobId);

      if (updateError) throw updateError;
      
      setJobs(jobs.filter(j => j.id !== jobId)); // Remove from pending list
      alert("Job Completed! Owner notified. ✅");
    } catch (err) {
      console.error(err);
      alert("Upload failed. Check signal.");
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Jobs Today 🧹</h1>
        <p className="text-slate-500">Tap to upload proof and finish.</p>
      </header>

      <div className="space-y-4">
        {jobs.length === 0 && <p className="text-center py-10 text-slate-400">No jobs assigned yet.</p>}
        
        {jobs.map((job) => (
          <div key={job.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-3">
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-lg uppercase">
                {job.postcode}
              </span>
              <span className="font-bold text-lg text-slate-700">£{job.price}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-4">{job.address}</h2>
            
            {/* The Big Action Button */}
            <label className={`block w-full text-center py-4 rounded-2xl font-bold text-white transition active:scale-95 cursor-pointer ${uploadingId === job.id ? 'bg-slate-400' : 'bg-emerald-600 shadow-lg shadow-emerald-100'}`}>
              {uploadingId === job.id ? "Uploading..." : "📸 Take Photo & Finish"}
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                className="hidden" 
                onChange={(e) => handleUpload(e, job.id)}
                disabled={uploadingId !== null}
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
