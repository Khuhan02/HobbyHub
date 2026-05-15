/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSACTIONS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { useData } from '../hooks/useData';
import { supabase } from '../lib/supabase';

import { generatePaymentReminder } from '../services/geminiService';

export function Payments() {
  const { t, user } = useApp();
  const { payments: realPayments, loading, refresh } = useData();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<any>(null);

  const handleMarkAsPaid = async (paymentId: string) => {
    if (!user) return;
    setIsUpdating(paymentId);
    
    const { error } = await supabase
      .from('payments')
      .update({ 
        status: 'paid',
        paid_date: new Date().toISOString().split('T')[0],
        method: 'transfer' // Defaulting to transfer for now
       })
      .eq('id', paymentId);

    if (error) {
      alert('Error updating payment: ' + error.message);
    } else {
      refresh();
    }
    setIsUpdating(null);
  };

  const handleGenerateReminder = async (tx: any) => {
    setIsGenerating(tx.id);
    setSelectedTx(tx);
    
    try {
      const message = await generatePaymentReminder({
        studentName: tx.studentName,
        parentName: tx.parentName,
        amount: tx.amountRaw.toString(),
        dueDate: tx.date,
        className: tx.className
      });
      setReminderMessage(message);
    } catch (error) {
      alert('Failed to generate reminder: ' + error);
    } finally {
      setIsGenerating(null);
    }
  };

  const displayTransactions = realPayments.length > 0 ? realPayments.map(p => ({
    id: p.id,
    studentName: (p as any).students?.name || 'Unknown Subject',
    parentName: (p as any).students?.parentName || (p as any).students?.parent_name || 'Guardian',
    parentPhone: (p as any).students?.parentPhone || (p as any).students?.parent_phone || '',
    className: (p as any).classes?.name || 'Class',
    date: p.paidDate || p.dueDate,
    method: p.method?.toUpperCase() || 'N/A',
    amount: `RM${p.amount}`,
    amountRaw: p.amount,
    status: p.status === 'paid' ? 'Paid' : p.status === 'overdue' ? 'Overdue' : 'Pending',
    rawStatus: p.status
  })) : TRANSACTIONS.map(tx => ({ 
    ...tx, 
    rawStatus: tx.status.toLowerCase(),
    parentName: 'Guardian',
    parentPhone: '60123456789',
    className: 'Class',
    amountRaw: parseInt(tx.amount.replace('RM', ''))
  }));

  const totalRevenue = realPayments
    .filter(p => p.status === 'paid')
    .reduce((acc, curr) => acc + curr.amount, 0);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div id="payments-page" className="space-y-6 max-w-lg mx-auto">
      <section id="revenue-summary">
        <div className="bg-white border border-neutral-100 rounded-[2.5rem] p-8 shadow-lg relative overflow-hidden group">
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-primary/5 rounded-full blur-[80px] group-hover:bg-primary/10 transition-all"></div>
          <div className="relative z-10">
            <p className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-neutral-400 mb-4">
              {t('payments.total_revenue')} • OCT_2023
            </p>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-mono font-black text-neutral-900 tracking-tighter">
                RM{totalRevenue > 0 ? totalRevenue : '8,400'}
              </span>
              <span className="text-xs font-mono font-bold text-secondary">NET_POSITIVE</span>
            </div>
            <div className="flex gap-3">
              <span className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 px-4 py-2 rounded-xl text-secondary text-[10px] font-black tracking-widest uppercase">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                +12.4% OFFSET
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="payment-actions" className="grid grid-cols-2 gap-4">
        <button className="flex items-center justify-center gap-3 bg-primary text-white py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/10">
          <span className="material-symbols-outlined text-xl">broadcast_on_home</span>
          {t('payments.bulk_remind')}
        </button>
        <button className="flex items-center justify-center gap-3 bg-white text-neutral-400 py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-neutral-50 active:scale-95 transition-all border border-neutral-100 shadow-sm">
          <span className="material-symbols-outlined text-xl">terminal</span>
          {t('payments.export_pdf')}
        </button>
      </section>

      <div id="search-transactions" className="mb-6">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-primary transition-colors">database</span>
          <input 
            type="text" 
            placeholder="Search Registry..."
            className="w-full pl-14 pr-6 py-5 bg-neutral-50 border border-neutral-100 rounded-[2rem] focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none text-sm font-bold text-neutral-700 transition-all shadow-sm"
          />
        </div>
      </div>

      <section id="transactions-list">
        <h3 className="text-[10px] font-mono font-black text-neutral-400 uppercase tracking-[0.3em] mb-6 pl-2">
          {t('payments.recent_transactions')}
        </h3>
        <div className="space-y-4">
          {displayTransactions.map((tx) => (
            <motion.div 
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white border border-neutral-100 rounded-[2rem] p-5 flex justify-between items-center shadow-sm hover:border-primary/40 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                  tx.status === 'Paid' ? 'bg-secondary/5 border-secondary/10 text-secondary' : 
                  tx.status === 'Overdue' ? 'bg-rose-50 border-rose-100 text-rose-500' : 
                  'bg-neutral-50 border-neutral-100 text-neutral-300'
                }`}>
                  <span className="material-symbols-outlined text-xl">fingerprint</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900 italic group-hover:underline underline-offset-4 decoration-primary">{tx.studentName}</p>
                  <p className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-widest mt-1">{tx.date} // {tx.method}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-mono font-black text-neutral-900 mb-1 tracking-tighter">{tx.amount}</p>
                <div className="flex flex-col items-end gap-2">
                  <div className={`inline-flex px-2 py-0.5 rounded-md text-[8px] font-mono font-black uppercase tracking-widest border ${
                    tx.status === 'Paid' ? 'bg-secondary/10 border-secondary/20 text-secondary' : 
                    tx.status === 'Overdue' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 
                    'bg-neutral-50 border-neutral-100 text-neutral-300'
                  }`}>
                    {tx.status}
                  </div>
                  {tx.rawStatus !== 'paid' && (
                    <div className="flex flex-col items-end gap-2">
                      <button 
                        onClick={() => handleMarkAsPaid(tx.id)}
                        disabled={isUpdating === tx.id}
                        className="text-[9px] font-black text-secondary uppercase tracking-widest hover:underline disabled:opacity-50"
                      >
                        {isUpdating === tx.id ? 'Updating...' : 'Mark Paid'}
                      </button>
                      {tx.rawStatus === 'overdue' && (
                        <button 
                          onClick={() => handleGenerateReminder(tx)}
                          disabled={isGenerating === tx.id}
                          className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline disabled:opacity-50 flex items-center gap-1"
                        >
                          {isGenerating === tx.id ? (
                            <span className="w-2 h-2 border border-primary border-t-transparent rounded-full animate-spin"></span>
                          ) : (
                            <span className="material-symbols-outlined text-[10px]">auto_awesome</span>
                          )}
                          Send Reminder
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-10 flex justify-center pb-12">
          <button className="text-[10px] font-black text-neutral-400 hover:text-primary transition-colors uppercase tracking-[0.3em] flex items-center gap-2">
            Show More Records
            <span className="material-symbols-outlined text-sm">expand_more</span>
          </button>
        </div>
      </section>

      <AnimatePresence>
        {reminderMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-neutral-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-neutral-100 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-neutral-50 bg-neutral-50/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-2xl">auto_awesome</span>
                  <h3 className="text-xl font-bold text-neutral-900 italic">Fee Reminder</h3>
                </div>
                <button onClick={() => setReminderMessage(null)} className="text-neutral-400 hover:text-neutral-600 transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-mono font-black text-neutral-400 uppercase tracking-widest block ml-1">Generated Message</label>
                  <textarea 
                    value={reminderMessage}
                    onChange={(e) => setReminderMessage(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-6 text-sm text-neutral-700 leading-relaxed font-medium italic h-48 resize-none focus:border-primary outline-none shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(reminderMessage);
                      alert('Copied to clipboard');
                    }}
                    className="h-14 rounded-2xl border border-neutral-100 text-neutral-400 font-black text-[10px] uppercase tracking-widest hover:bg-neutral-50 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">content_copy</span>
                    Copy
                  </button>
                  <button 
                    onClick={() => {
                      const phone = selectedTx?.parentPhone;
                      const formattedPhone = `60${phone.replace(/^0/, '')}`;
                      window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(reminderMessage)}`, '_blank');
                    }}
                    className="h-14 rounded-2xl bg-[#25D366] text-white font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    <span className="material-symbols-outlined text-lg">chat</span>
                    WhatsApp
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
