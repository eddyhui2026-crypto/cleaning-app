"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams, useRouter } from 'next/navigation';
import imageCompression from 'browser-image-compression';

export default function StaffJobPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [job, setJob] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // 1. 載入 Job 資料同埋已上傳嘅相片
  const fetchJobData = async () => {
    try {
      setLoading(true);
      // 攞 Job 詳情
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();

      if (jobError) throw jobError;
      setJob(jobData);

      // 攞相關相片
      const { data: photoData, error: photoError } = await supabase
        .from('job_photos')
        .select('*')
        .eq('job_id', id)
        .order('created_at', { ascending: true });

      if (photoError) throw photoError;
      setPhotos(photoData || []);
    } catch (error: any) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchJobData();
  }, [id]);

  // 2. 開工掣：更新狀態並記錄開始時間
  const handleStartJob = async () => {
    const { error } = await supabase
      .from('jobs')
      .update({ 
        status: 'in_progress', 
        start_at: new Date().toISOString() 
      })
      .eq('id', id);

    if (error) alert(error.message);
    else fetchJobData();
  };

  // 3. 影相、壓縮並上傳
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const file = e.target.files[0];

    // 圖片壓縮設定
    const options = {
      maxSizeMB: 0.2,          // 壓到 200KB 左右
      maxWidthOrHeight: 1280,  // 闊度最高 1280px
      useWebWorker: true,
    };

    try {
      // 執行壓縮
      const compressedFile = await imageCompression(file, options);
      
      // 準備檔案路徑 (用 Job ID 分 Folder)
      const fileExt = file.name.split('.').pop();
      const fileName = `${id}/${type}_${Date.now()}.${fileExt}`;

      // 上傳到 Supabase Storage (Bucket 名叫 job-photos)
      const { error: uploadError } = await supabase.storage
        .from('job-photos')
        .upload(fileName, compressedFile);

      if (uploadError) throw uploadError;

      // 攞返張相嘅 Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('job-photos')
        .getPublicUrl(fileName);

      // 寫入 Database
      const { error: dbError } = await supabase
        .from('job_photos')
        .insert([{
          job_id: id,
          photo_url: publicUrl,
          photo_type: type
        }]);

      if (dbError) throw dbError;

      fetchJobData(); // 重新整理顯示相片
    } catch (error: any) {
      alert("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // 4. 完工掣：更新狀態並記錄結束時間
  const handleFinishJob = async () => {
    const { error } = await supabase
      .from('jobs')
      .update({ 
        status: 'completed', 
        completed_at: new Date().toISOString() 
      })
      .eq('id', id);

    if (error) {
      alert(error.message);
    } else {
      alert("Job Completed! Good work.");
      router.push('/admin/dashboard'); // 暫時返去 dashboard，之後可以整 staff 首頁
    }
  };

  if (loading) return <div className="p-10 text-center text-white bg-slate-900 min-h-screen">Loading Job Details...</div>;
  if (!job) return <div className="p-10 text-center text-white bg-slate-900 min-h-screen">Job not found.</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 font-sans pb-20">
      {/* 地址詳情 */}
      <div className="mb-6">
        <h1 className="text-2xl font-black leading-tight">{job.address}</h1>
        <p className="text-slate-400 font-bold">{job.postcode} • {job.client_name}</p>
        <div className="mt-3 flex gap-2">
          <span className="px-3 py-1 bg-indigo-500 rounded-full text-xs font-black uppercase tracking-widest">
            {job.status.replace('_', ' ')}
          </span>
          {job.start_time && (
            <span className="px-3 py-1 bg-slate-700 rounded-full text-xs font-bold text-slate-300">
              Starts at: {job.start_time}
            </span>
          )}
        </div>
      </div>

      {/* 老闆備註 */}
      {job.notes && (
        <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-2xl mb-6">
          <p className="text-xs font-black text-amber-500 uppercase mb-1">Manager's Notes</p>
          <p className="text-slate-200 text-sm">{job.notes}</p>
        </div>
      )}

      {/* 主要動作按鈕 */}
      <div className="space-y-6">
        {job.status === 'pending' && (
          <button 
            onClick={handleStartJob}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-6 rounded-3xl font-black text-2xl shadow-[0_8px_0_rgb(16,185,129,0.3)] active:translate-y-1 active:shadow-none transition-all"
          >
            START JOB 🚀
          </button>
        )}

        {(job.status === 'in_progress' || job.status === 'completed') && (
          <>
            {/* 影相區域 */}
            <div className="grid grid-cols-2 gap-4">
              {/* Before Photo Button */}
              <div className="relative group">
                <div className="bg-slate-800 border-2 border-dashed border-slate-600 p-6 rounded-3xl text-center group-active:scale-95 transition-transform">
                  <p className="text-xs font-black uppercase text-slate-400 mb-2">Before Photo</p>
                  <div className="text-4xl">📸</div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" 
                    onChange={(e) => handleUpload(e, 'before')}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* After Photo Button */}
              <div className="relative group">
                <div className="bg-slate-800 border-2 border-dashed border-slate-600 p-6 rounded-3xl text-center group-active:scale-95 transition-transform">
                  <p className="text-xs font-black uppercase text-slate-400 mb-2">After Photo</p>
                  <div className="text-4xl">✨</div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" 
                    onChange={(e) => handleUpload(e, 'after')}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 相片預覽 (Thumbnail Grid) */}
            <div className="mt-6">
              <h3 className="text-xs font-black uppercase text-slate-500 mb-3 tracking-widest">Evidence Collected ({photos.length})</h3>
              <div className="grid grid-cols-3 gap-3">
                {photos.map((p) => (
                  <div key={p.id} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-700 bg-slate-800">
                    <img src={p.photo_url} alt="proof" className="w-full h-full object-cover" />
                    <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase ${p.photo_type === 'before' ? 'bg-rose-500' : 'bg-emerald-500'}`}>
                      {p.photo_type}
                    </div>
                  </div>
                ))}
                {uploading && (
                  <div className="aspect-square rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center animate-pulse">
                    <span className="text-[10px] font-bold text-slate-500">Uploading...</span>
                  </div>
                )}
              </div>
            </div>

            {/* 完工按鈕 */}
            {job.status === 'in_progress' && (
              <button 
                onClick={handleFinishJob}
                disabled={uploading}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-6 rounded-3xl font-black text-2xl shadow-[0_8px_0_rgb(99,102,241,0.3)] active:translate-y-1 active:shadow-none transition-all mt-8 disabled:bg-slate-700 disabled:shadow-none"
              >
                {uploading ? "WAITING..." : "FINISH JOB ✅"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}