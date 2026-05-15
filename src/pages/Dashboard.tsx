/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';

export function Dashboard() {
  const { t } = useApp();

  const metrics = [
    { label: 'dashboard.students_today', value: '42', color: 'primary' },
    { label: 'dashboard.classes_today', value: '6', color: 'on-surface' },
    { label: 'dashboard.payments_overdue', value: '8', color: 'error', isAlert: true },
    { label: 'dashboard.messages_sent', value: '124', color: 'on-surface' },
  ];

  return (
    <div id="dashboard-page" className="space-y-6 max-w-lg mx-auto">
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
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' 
                  : 'bg-neutral-900 border-neutral-800'
              }`}
            >
              <span className={`text-[9px] font-black block mb-2 uppercase tracking-[0.15em] ${
                m.isAlert ? 'text-rose-400' : 'text-neutral-500'
              }`}>
                {t(m.label)}
              </span>
              <span className={`text-3xl font-bold font-mono tracking-tighter ${
                m.isAlert ? 'text-rose-500' : 'text-white'
              }`}>
                {m.value}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Class Timeline - Bento Style */}
      <section id="timeline-section">
        <h2 className="text-sm font-black font-heading mb-4 uppercase tracking-[0.2em] text-neutral-500 px-1">{t('dashboard.class_timeline')}</h2>
        <div className="relative bg-neutral-900 rounded-[2rem] border border-neutral-800 p-6 overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <span className="material-symbols-outlined text-8xl text-white">timeline</span>
          </div>
          
          <div className="flex justify-between text-[10px] text-neutral-600 mb-6 font-mono uppercase tracking-[0.1em] border-b border-neutral-800 pb-3">
            <span>09:00</span><span>12:00</span><span>15:00</span><span>18:00</span>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-mono text-neutral-500 w-10">10:00</span>
              <div className="flex-1 bg-primary/20 border border-primary/30 p-3 rounded-2xl flex justify-between items-center">
                <span className="text-xs font-bold text-primary-on-container">Watercolor Jr.</span>
                <span className="px-2 py-0.5 bg-primary text-white text-[8px] font-black rounded-lg">LIVE</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-mono text-neutral-500 w-10">15:30</span>
              <div className="flex-1 bg-neutral-800/50 border border-neutral-700/50 p-3 rounded-2xl flex justify-between items-center opacity-80">
                <span className="text-xs font-bold text-neutral-300">Piano Intro</span>
                <span className="text-[10px] font-mono text-neutral-500">Scheduled</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid for Messages and Alerts */}
      <div className="grid grid-cols-1 gap-6">
        <section id="messages-section" className="bg-neutral-900 border border-neutral-800 rounded-[2rem] p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-black font-heading uppercase tracking-[0.2em] text-neutral-400">{t('dashboard.recent_messages')}</h2>
            <span className="material-symbols-outlined text-primary text-xl">forum</span>
          </div>
          <div className="space-y-4">
            {[
              { initial: 'JS', name: 'Jane Smith (Sarah)', text: 'Will Sarah be late for the art...', color: 'primary' },
              { initial: 'ML', name: 'Mike Lee (Kevin)', text: 'Thanks for the photos today!', color: 'secondary' }
            ].map((msg, i) => (
              <div key={i} className="flex items-start gap-4 p-2 hover:bg-neutral-800/50 rounded-2xl transition-colors cursor-pointer group">
                <div className={`w-10 h-10 rounded-xl bg-${msg.color}/10 flex items-center justify-center flex-shrink-0 border border-${msg.color}/20`}>
                  <span className={`text-${msg.color} text-xs font-black`}>{msg.initial}</span>
                </div>
                <div className="flex-1 min-w-0 border-b border-neutral-800 pb-2 group-last:border-0">
                  <p className="text-sm font-bold text-neutral-200 truncate">{msg.name}</p>
                  <p className="text-xs text-neutral-500 truncate mt-1">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="alerts-section" className="bg-neutral-900 border border-neutral-800 rounded-[2rem] p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-black font-heading uppercase tracking-[0.2em] text-neutral-400">{t('dashboard.payment_alerts')}</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
              <span className="text-[10px] font-mono text-rose-500">ACTION REQUIRED</span>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Ahmad Rizwan', amount: 'RM180' },
              { name: 'Lim Wei Han', amount: 'RM250' }
            ].map((pay, i) => (
              <div key={i} className="bg-neutral-800/40 border border-neutral-700/50 p-4 rounded-2xl flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-rose-500/70">payment</span>
                  <p className="text-sm font-bold text-neutral-300 italic underline decoration-neutral-700 underline-offset-4">{pay.name}</p>
                </div>
                <span className="text-sm font-mono font-black text-rose-500">{pay.amount}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
