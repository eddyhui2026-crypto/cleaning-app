"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function AdminDashboard() {
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data } = await supabase
        .from('jobs')
        .select('*, job_photos(count)')
        .order('created_at', { ascending: false });
      setJobs(data || []);
    };
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">All Jobs</h1>
          <Link href="/admin/add-job" className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold">
            + New Job
          </Link>
        </div>

        <div className="grid gap-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{job.address}</h3>
                <p className="text-slate-500 text-sm">{job.postcode} • {job.client_name}</p>
                <div className="flex gap-2 mt-2">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                    job.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {job.status}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-600 uppercase">
                    📸 {job.job_photos?.[0]?.count || 0} Photos
                  </span>
                </div>
              </div>
              <Link href={`/admin/job/${job.id}`} className="text-indigo-600 font-bold hover:underline">
                View Details →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}