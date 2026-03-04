"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({
    company_name: '',
    bank_name: '',
    sort_code: '',
    account_number: '',
    payment_terms: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('admin_settings').select('*').eq('id', 1).single();
      if (data) setSettings(data);
    }
    fetchSettings();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    const { error } = await supabase.from('admin_settings').upsert({ id: 1, ...settings });
    if (error) alert(error.message);
    else alert("Settings saved! Your PDFs will now use these details.");
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/admin/dashboard" className="text-slate-400 font-bold">← Back</Link>
          <h1 className="text-2xl font-black text-slate-900">App Settings</h1>
        </div>

        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200 space-y-6">
          <div>
            <label className="block text-xs font-black uppercase text-slate-400 mb-2">Company Name</label>
            <input 
              className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500"
              value={settings.company_name}
              onChange={(e) => setSettings({...settings, company_name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-2">Sort Code</label>
              <input 
                className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500"
                value={settings.sort_code}
                onChange={(e) => setSettings({...settings, sort_code: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-2">Account No</label>
              <input 
                className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500"
                value={settings.account_number}
                onChange={(e) => setSettings({...settings, account_number: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-400 mb-2">Payment Terms (Optional)</label>
            <textarea 
              className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              value={settings.payment_terms}
              onChange={(e) => setSettings({...settings, payment_terms: e.target.value})}
            />
          </div>

          <button 
            onClick={saveSettings}
            disabled={saving}
            className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-xl hover:bg-black transition-all"
          >
            {saving ? "SAVING..." : "SAVE SETTINGS"}
          </button>
        </div>
      </div>
    </div>
  );
}