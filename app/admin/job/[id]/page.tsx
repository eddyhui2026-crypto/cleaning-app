"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import jsPDF from 'jspdf';

export default function AdminJobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      const { data: jobData } = await supabase.from('jobs').select('*').eq('id', id).single();
      const { data: photoData } = await supabase.from('job_photos').select('*').eq('job_id', id);
      setJob(jobData);
      setPhotos(photoData || []);
      setLoading(false);
    };
    fetchDetails();
  }, [id]);

  // 輔助函數：將圖片 URL 轉為 Base64
  const fetchImageBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const generatePDF = async () => {
    if (!job) return;
    setGenerating(true);

    try {
      // 1. 先抓取老闆的銀行設定
      const { data: st } = await supabase.from('admin_settings').select('*').eq('id', 1).single();

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPos = 25;

      const checkPageBreak = (neededHeight: number) => {
        if (yPos + neededHeight > 275) {
          pdf.addPage();
          yPos = 20;
          return true;
        }
        return false;
      };

      // --- PDF 內容繪製 ---
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(24);
      pdf.setTextColor(30, 41, 59);
      pdf.text("CLEANING REPORT", margin, yPos);
      yPos += 12;

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 116, 139);
      pdf.text(`Property Address: ${job.address}, ${job.postcode}`, margin, yPos);
      yPos += 6;
      pdf.text(`Client: ${job.client_name}  |  Service Date: ${job.job_date}`, margin, yPos);
      yPos += 12;

      // 照片區塊 (Before & After)
      const sections: { type: 'before' | 'after'; label: string; color: [number, number, number] }[] = [
        { type: 'before', label: 'BEFORE CLEANING', color: [225, 29, 72] },
        { type: 'after', label: 'AFTER CLEANING', color: [5, 150, 105] }
      ];

      for (const section of sections) {
        const sectionPhotos = photos.filter(p => p.photo_type === section.type);
        if (sectionPhotos.length === 0) continue;

        checkPageBreak(20);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(section.color[0], section.color[1], section.color[2]);
        pdf.text(section.label, margin, yPos);
        yPos += 8;

        const gap = 5;
        const imgWidth = (contentWidth - gap) / 2;
        const imgHeight = (imgWidth * 3) / 4;

        for (let i = 0; i < sectionPhotos.length; i += 2) {
          checkPageBreak(imgHeight + 10);
          const base64_1 = await fetchImageBase64(sectionPhotos[i].photo_url);
          pdf.addImage(base64_1, 'JPEG', margin, yPos, imgWidth, imgHeight);

          if (sectionPhotos[i + 1]) {
            const base64_2 = await fetchImageBase64(sectionPhotos[i + 1].photo_url);
            pdf.addImage(base64_2, 'JPEG', margin + imgWidth + gap, yPos, imgWidth, imgHeight);
          }
          yPos += imgHeight + gap;
        }
        yPos += 10;
      }

      // --- 底部收款資料 (與 Admin Settings 連動) ---
      checkPageBreak(45);
      yPos += 5;
      pdf.setDrawColor(226, 232, 240);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(79, 70, 229);
      pdf.text("INVOICE & PAYMENT DETAILS", margin, yPos);
      yPos += 8;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(30, 41, 59);
      
      // 使用資料庫讀取的設定，如果沒有就顯示預設值
      pdf.text(`Total Amount Due: GBP £${job.price}`, margin, yPos);
      yPos += 6;
      pdf.text(`Business: ${st?.company_name || 'Your Company Name'}`, margin, yPos);
      yPos += 6;
      pdf.text(`Bank: ${st?.bank_name || 'Bank'} | Sort Code: ${st?.sort_code || '00-00-00'}`, margin, yPos);
      yPos += 6;
      pdf.text(`Account No: ${st?.account_number || '12345678'} | Ref: ${job.postcode}`, margin, yPos);
      
      if (st?.payment_terms) {
        yPos += 10;
        pdf.setFontSize(8);
        pdf.setTextColor(148, 163, 184); // Slate-400
        pdf.text(st.payment_terms, margin, yPos);
      }

      pdf.save(`Cleaning_Report_${job.postcode}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Error generating PDF. Please ensure your Admin Settings are configured.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-sans">Loading Job...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans pb-28 text-slate-900">
      <div className="max-w-3xl mx-auto">
        <Link href="/admin/dashboard" className="text-slate-400 text-sm font-bold mb-4 block hover:text-indigo-600">
          ← Back to Dashboard
        </Link>
        
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200 mb-6">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-black mb-1">{job.address}</h1>
              <p className="text-slate-500 font-bold">{job.postcode} • {job.client_name}</p>
            </div>
            <div className="bg-indigo-50 px-4 py-2 rounded-2xl text-right">
              <p className="text-indigo-600 font-black text-2xl">£{job.price}</p>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Job Total</p>
            </div>
          </div>

          <div className="space-y-8">
            {['before', 'after'].map((type) => (
              <div key={type}>
                <h3 className={`text-sm font-black uppercase mb-4 ${type === 'before' ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {type} Photos ({photos.filter(p => p.photo_type === type).length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {photos.filter(p => p.photo_type === type).map(p => (
                    <img key={p.id} src={p.photo_url} className="w-full aspect-square object-cover rounded-2xl border border-slate-100" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fixed bottom-8 left-0 right-0 px-6">
          <div className="max-w-3xl mx-auto">
            <button 
              onClick={generatePDF}
              disabled={generating}
              className={`w-full py-5 rounded-3xl font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-3 ${
                generating ? 'bg-slate-400 cursor-not-allowed text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
              }`}
            >
              {generating ? "PREPARING REPORT..." : "DOWNLOAD PDF REPORT"}
              {!generating && <span className="bg-white/20 px-2 py-1 rounded-lg text-xs">📄</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}