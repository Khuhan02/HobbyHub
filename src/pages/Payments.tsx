/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { TRANSACTIONS } from '../constants';
import { motion } from 'motion/react';

export function Payments() {
  const { t } = useApp();

  return (
    <div id="payments-page" className="space-y-6 max-w-lg mx-auto">
      <section id="revenue-summary">
        <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-primary/20 rounded-full blur-[80px] group-hover:bg-primary/30 transition-all"></div>
          <div className="relative z-10">
            <p className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-neutral-500 mb-4">
              {t('payments.total_revenue')} • OCT_2023
            </p>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-mono font-black text-white tracking-tighter">RM8,400</span>
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
        <button className="flex items-center justify-center gap-3 bg-primary text-white py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-xl">broadcast_on_home</span>
          {t('payments.bulk_remind')}
        </button>
        <button className="flex items-center justify-center gap-3 bg-neutral-900 text-neutral-400 py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-neutral-800 active:scale-95 transition-all border border-neutral-800 shadow-xl">
          <span className="material-symbols-outlined text-xl">terminal</span>
          {t('payments.export_pdf')}
        </button>
      </section>

      <div id="search-transactions" className="mb-6">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-primary transition-colors">database</span>
          <input 
            type="text" 
            placeholder="Search Registry..."
            className="w-full pl-14 pr-6 py-5 bg-neutral-950 border border-neutral-800 rounded-[2rem] focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none text-sm font-bold text-on-surface transition-all"
          />
        </div>
      </div>

      <section id="transactions-list">
        <h3 className="text-[10px] font-mono font-black text-neutral-600 uppercase tracking-[0.3em] mb-6 pl-2">
          {t('payments.recent_transactions')}
        </h3>
        <div className="space-y-4">
          {TRANSACTIONS.map((tx) => (
            <motion.div 
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-neutral-900 border border-neutral-800 rounded-[2rem] p-5 flex justify-between items-center shadow-lg hover:border-primary/40 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                  tx.status === 'Paid' ? 'bg-secondary/10 border-secondary/20 text-secondary' : 
                  tx.status === 'Overdue' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 
                  'bg-neutral-800 border-neutral-700 text-neutral-500'
                }`}>
                  <span className="material-symbols-outlined text-xl">fingerprint</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white italic group-hover:underline underline-offset-4 decoration-primary">{tx.studentName}</p>
                  <p className="text-[9px] font-mono font-bold text-neutral-600 uppercase tracking-widest mt-1">{tx.date} // {tx.method}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-mono font-black text-white mb-1 tracking-tighter">{tx.amount}</p>
                <div className={`inline-flex px-2 py-0.5 rounded-md text-[8px] font-mono font-black uppercase tracking-widest border ${
                  tx.status === 'Paid' ? 'bg-secondary/10 border-secondary/20 text-secondary' : 
                  tx.status === 'Overdue' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 
                  'bg-neutral-800 border-neutral-700 text-neutral-500'
                }`}>
                  {tx.status}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-10 flex justify-center pb-12">
          <button className="text-[10px] font-black text-neutral-500 hover:text-primary transition-colors uppercase tracking-[0.3em] flex items-center gap-2">
            Show More Records
            <span className="material-symbols-outlined text-sm">expand_more</span>
          </button>
        </div>
      </section>
    </div>
  );
}
