/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';

export function ProfileSetup() {
  const { user, refreshProfile, t } = useApp();
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'art',
    city: '',
    phone: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .insert([
        {
          id: user.id,
          name: user.user_metadata.full_name || user.email?.split('@')[0],
          email: user.email,
          phone: formData.phone,
          business_name: formData.businessName,
          business_type: formData.businessType,
          city: formData.city,
          plan: 'free',
          created_at: new Date().toISOString(),
        }
      ]);

    if (error) {
      console.error('Error saving profile:', error.message);
      setSaving(false);
    } else {
      await refreshProfile();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-on-surface">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-10 shadow-2xl space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-black font-heading text-white italic underline underline-offset-8 decoration-primary">
              {t('auth.setup_profile')}
            </h1>
            <p className="text-xs text-neutral-500 leading-relaxed uppercase tracking-widest font-mono">
              Initialize Local System Params
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-black text-neutral-500 uppercase tracking-[0.3em] block ml-1">
                {t('auth.business_name')}
              </label>
              <input 
                required
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                placeholder="e.g., Star Arts Academy"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-black text-neutral-500 uppercase tracking-[0.3em] block ml-1">
                  {t('auth.business_type')}
                </label>
                <select 
                  value={formData.businessType}
                  onChange={(e) => setFormData({...formData, businessType: e.target.value as any})}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none"
                >
                  <option value="art">Art</option>
                  <option value="coding">Coding</option>
                  <option value="music">Music</option>
                  <option value="robotics">Robotics</option>
                  <option value="sports">Sports</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-black text-neutral-500 uppercase tracking-[0.3em] block ml-1">
                  {t('auth.city')}
                </label>
                <input 
                  required
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  placeholder="e.g., Kuala Lumpur"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono font-black text-neutral-500 uppercase tracking-[0.3em] block ml-1">
                Contact Phone
              </label>
              <input 
                required
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                placeholder="e.g., 012-3456789"
              />
            </div>

            <button 
              disabled={saving}
              type="submit"
              className="w-full bg-primary text-white h-14 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
            >
              {saving ? 'Processing...' : t('auth.save_profile')}
              <span className="material-symbols-outlined">api</span>
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
