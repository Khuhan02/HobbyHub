/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { useData } from '../hooks/useData';

export function Dashboard() {
  const { t, user } = useApp();
  const { classes, students, payments, messages, loading, refresh } = useData();

  const metrics = [
    { label: 'dashboard.students_today', value: students.length.toString(), color: 'primary' },
    { label: 'dashboard.classes_today', value: classes.length.toString(), color: 'on-surface' },
    { label: 'dashboard.payments_overdue', value: payments.filter(p => p.status === 'overdue').length.toString(), color: 'error', isAlert: payments.filter(p => p.status === 'overdue').length > 0 },
    { label: 'dashboard.messages_sent', value: messages.length.toString(), color: 'on-surface' },
  ];

  const handleQuickMark = async (classId: string) => {
    if (!user) return;
    // Just a placeholder for "Quick Mark" logic - real app would open a scanner or picker
    alert('Attendance system initialized for class: ' + classId);
  };

  const overduePayments = payments
    .filter(p => p.status === 'overdue')
    .slice(0, 3)
    .map(p => ({
      name: (p as any).students?.name || 'Unknown Student',
      amount: `RM${p.amount}`
    }));

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div id="dashboard-page" className="space-y-6 max-w-lg mx-auto pb-10">
      {/* Metrics Horizontal Scroll */}
      <section id="metrics-section">
        <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar">
          {metrics.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`flex-shrink-0 w-36 p-5 rounded-3xl border ${
                m.isAlert 
                  ? 'bg-rose-50 border-rose-100 text-rose-600' 
                  : 'bg-white border-neutral-100 shadow-sm'
              }`}
            >
              <span className={`text-[9px] font-black block mb-2 uppercase tracking-[0.15em] ${
                m.isAlert ? 'text-rose-400' : 'text-neutral-400'
              }`}>
                {t(m.label)}
              </span>
              <span className={`text-3xl font-bold font-mono tracking-tighter ${
                m.isAlert ? 'text-rose-600' : 'text-neutral-900'
              }`}>
                {m.value}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Class Timeline - Bento Style */}
      <section id="timeline-section">
        <h2 className="text-sm font-black font-heading mb-4 uppercase tracking-[0.2em] text-neutral-400 px-1">{t('dashboard.class_timeline')}</h2>
        <div className="relative bg-white border border-neutral-100 rounded-[2rem] p-6 overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <span className="material-symbols-outlined text-8xl text-neutral-900">timeline</span>
          </div>
          
          <div className="flex justify-between text-[10px] text-neutral-300 mb-6 font-mono uppercase tracking-[0.1em] border-b border-neutral-50 pb-3">
            <span>Morning</span><span>Afternoon</span><span>Evening</span>
          </div>
          
          <div className="space-y-4 relative z-10">
            {classes.length > 0 ? classes.slice(0, 3).map((c, i) => (
              <div key={c.id} className="flex items-center gap-4">
                <span className="text-[10px] font-mono text-neutral-400 w-12 shrink-0">{(c as any).start_time || '10:00'}</span>
                <div className={`flex-1 ${i === 0 ? 'bg-primary/5 border-primary/20' : 'bg-neutral-50 border-neutral-100'} border p-3.5 rounded-2xl flex justify-between items-center group cursor-pointer active:scale-95 transition-all`} onClick={() => handleQuickMark(c.id)}>
                   <div className="min-w-0">
                      <p className={`text-xs font-bold truncate ${i === 0 ? 'text-primary' : 'text-neutral-900'}`}>{c.name}</p>
                      <p className="text-[9px] font-mono text-neutral-400 mt-0.5">{(c as any).teacher_name || c.teacherName}</p>
                   </div>
                   {i === 0 ? (
                      <span className="px-2.5 py-1 bg-primary text-white text-[8px] font-black rounded-lg animate-pulse">LIVE</span>
                   ) : (
                      <span className="material-symbols-outlined text-neutral-300 text-lg group-hover:text-primary transition-colors">qr_code_scanner</span>
                   )}
                </div>
              </div>
            )) : (
              <div className="py-10 text-center">
                <p className="text-sm font-bold text-neutral-300">No classes found for today.</p>
                <p className="text-[10px] font-mono text-neutral-200 mt-2 uppercase tracking-widest">AOD_SYSTEM_IDLE</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Grid for Messages and Alerts */}
      <div className="grid grid-cols-1 gap-6">
        <section id="messages-section" className="bg-white border border-neutral-100 rounded-[2rem] p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-black font-heading uppercase tracking-[0.2em] text-neutral-400">{t('dashboard.recent_messages')}</h2>
            <span className="material-symbols-outlined text-primary text-xl">forum</span>
          </div>
          <div className="space-y-4">
            {messages.length > 0 ? messages.slice(0, 2).map((msg, i) => (
              <div key={i} className="flex items-start gap-4 p-2 hover:bg-neutral-50 rounded-2xl transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center flex-shrink-0 border border-primary/10">
                  <span className="material-symbols-outlined text-primary text-lg">{msg.channel === 'whatsapp' ? 'sensors' : 'mail'}</span>
                </div>
                <div className="flex-1 min-w-0 border-b border-neutral-50 pb-2 group-last:border-0">
                  <p className="text-sm font-bold text-neutral-900 truncate">{msg.recipientId}</p>
                  <p className="text-xs text-neutral-500 truncate mt-1">{msg.content}</p>
                </div>
              </div>
            )) : (
              <p className="text-xs text-neutral-300 py-4 italic text-center">No recent communication logs found.</p>
            )}
          </div>
        </section>

        <section id="alerts-section" className="bg-white border border-neutral-100 rounded-[2rem] p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-black font-heading uppercase tracking-[0.2em] text-neutral-400">{t('dashboard.payment_alerts')}</h2>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${overduePayments.length > 0 ? 'bg-rose-500 animate-ping' : 'bg-secondary'}`}></span>
              <span className={`text-[10px] font-mono ${overduePayments.length > 0 ? 'text-rose-500' : 'text-secondary'}`}>
                {overduePayments.length > 0 ? 'ACTION REQUIRED' : 'ALL CLEAR'}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            {overduePayments.length > 0 ? overduePayments.map((pay, i) => (
              <div key={i} className="bg-neutral-50 border border-neutral-100 p-4 rounded-2xl flex justify-between items-center group hover:border-rose-100 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-rose-400 group-hover:scale-110 transition-transform">payment</span>
                  <p className="text-sm font-bold text-neutral-900 italic underline decoration-neutral-100 underline-offset-4">{pay.name}</p>
                </div>
                <span className="text-sm font-mono font-black text-rose-500">{pay.amount}</span>
              </div>
            )) : (
               <div className="py-4 text-center">
                  <p className="text-xs font-bold text-neutral-300">ZERO_OVERDUE_DEBT_DETECTED</p>
               </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
