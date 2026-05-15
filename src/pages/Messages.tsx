/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { TEMPLATES } from '../constants';
import { motion } from 'motion/react';

export function Messages() {
  const { t } = useApp();

  return (
    <div id="messages-page" className="space-y-8 max-w-lg mx-auto">
      {/* Templates Row */}
      <section id="templates-section">
        <div className="flex justify-between items-center mb-6 px-2">
          <h2 className="text-sm font-black font-heading text-neutral-500 uppercase tracking-[0.2em]">{t('chat.templates')}</h2>
          <button className="text-[10px] font-mono font-black text-primary hover:bg-primary/5 px-3 py-1 rounded-lg transition-all border border-transparent hover:border-primary/20">FETCH All</button>
        </div>
        <div className="flex overflow-x-auto gap-4 hide-scrollbar pb-3">
          {TEMPLATES.map((item) => (
            <motion.div 
              key={item.id}
              whileHover={{ y: -4, scale: 1.02 }}
              className="flex-shrink-0 w-52 bg-neutral-900 border border-neutral-800 rounded-[2rem] p-6 shadow-xl active:scale-95 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-neutral-800 text-primary rounded-2xl flex items-center justify-center mb-6 border border-neutral-700 group-hover:bg-primary group-hover:text-white transition-all shadow-lg">
                <span className="material-symbols-outlined text-2xl">{item.icon}</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-2 italic underline underline-offset-4 decoration-neutral-800 group-hover:decoration-primary/50">{t(item.id === '1' ? 'chat.attendance_reminder' : item.id === '2' ? 'chat.fee_due' : 'chat.progress_update') || item.title}</h3>
              <p className="text-[11px] font-medium text-neutral-500 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Composer */}
      <section id="composer-section" className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-neutral-800 flex items-center gap-4 bg-neutral-800/20">
          <span className="material-symbols-outlined text-primary text-2xl">terminal</span>
          <h2 className="text-lg font-bold font-heading text-white italic">{t('chat.compose')}</h2>
        </div>
        <div className="p-8 space-y-8">
          <div className="space-y-4">
            <label className="block text-[10px] font-mono font-black text-neutral-500 uppercase tracking-[0.3em]">{t('chat.recipients')}</label>
            <div className="flex flex-wrap gap-3">
              <button className="px-6 py-3 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                {t('chat.all_parents')}
              </button>
              <button className="px-6 py-3 rounded-xl border border-neutral-800 text-neutral-500 text-[10px] font-black uppercase tracking-widest hover:border-neutral-700 hover:text-neutral-300 transition-all">
                {t('chat.this_class')}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-mono font-black text-neutral-500 uppercase tracking-[0.3em]">{t('chat.content')}</label>
            <div className="relative">
              <textarea 
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-6 text-sm font-medium text-neutral-300 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none leading-relaxed h-40" 
                placeholder="Type your message here..." 
                defaultValue="Hello parents! Just a friendly reminder that there will be no Art Class this Friday due to the public holiday. Classes resume as normal next week."
              />
              <div className="absolute bottom-4 right-4 text-[9px] font-mono text-neutral-600">UTF-8 // READY</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-2">
            <button className="w-full bg-secondary text-white h-14 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-secondary/10 hover:brightness-110 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
              {t('chat.send_whatsapp')}
            </button>
            <button className="w-full border-2 border-neutral-800 text-neutral-400 h-14 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] hover:bg-neutral-800 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-xl">alternate_email</span>
              {t('chat.send_email')}
            </button>
          </div>
        </div>
      </section>

      {/* Message Log */}
      <section id="logs-section" className="pb-12">
        <div className="flex justify-between items-center mb-6 px-2">
          <h2 className="text-sm font-black font-heading text-neutral-500 uppercase tracking-[0.2em]">{t('chat.logs')}</h2>
          <span className="text-[9px] font-mono font-bold text-neutral-700 uppercase">Archive Mode Active</span>
        </div>
        <div className="space-y-4">
          {[
            { tag: 'Attendance Reminder', time: '10:45 AM', recipient: 'Dance Class B', icon: 'sensors', color: 'secondary' },
            { tag: 'Fee Due Notice', time: 'Yesterday', recipient: 'Mrs. Tan', icon: 'history', color: 'primary' },
            { tag: 'Class Cancellation', time: 'Mon', recipient: 'Public Holiday Alert', icon: 'block', color: 'error' }
          ].map((log, i) => (
            <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-[2rem] p-5 flex items-center gap-5 hover:border-primary/40 transition-all shadow-lg cursor-pointer group">
              <div className={`w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center text-${log.color} shrink-0 border border-neutral-700 group-hover:border-primary/30 transition-all`}>
                <span className="material-symbols-outlined text-xl">{log.icon}</span>
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-sm font-bold text-white italic truncate group-hover:underline decoration-primary underline-offset-4">{log.tag}</h4>
                  <span className="text-[9px] font-mono font-bold text-neutral-600 shrink-0">{log.time}</span>
                </div>
                <p className="text-[10px] font-mono text-neutral-500 truncate uppercase tracking-widest">{log.recipient}</p>
              </div>
              <span className="material-symbols-outlined text-neutral-700 group-hover:text-primary transition-colors text-xl">chevron_right</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
