/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TEMPLATES } from '../constants';
import { motion } from 'motion/react';
import { useData } from '../hooks/useData';
import { supabase } from '../lib/supabase';

export function Messages() {
  const { t, user } = useApp();
  const { messages: realMessages, loading, refresh } = useData();
  const [content, setContent] = useState('Hello parents! Just a friendly reminder that there will be no Art Class this Friday due to the public holiday. Classes resume as normal next week.');
  const [isSending, setIsSending] = useState(false);
  const [recipientType, setRecipientType] = useState<'all' | 'class'>('all');

  const handleSendMessage = async (channel: 'whatsapp' | 'email') => {
    if (!user) return;
    setIsSending(true);

    const { error } = await supabase
      .from('messages')
      .insert([{
        user_id: user.id,
        type: 'cancel', // Defaulting to cancel for now
        recipient_type: recipientType,
        recipient_id: recipientType === 'all' ? 'All Parents' : 'Current Class',
        content: content,
        sent_at: new Date().toISOString(),
        channel: channel
      }]);

    if (error) {
      alert('Error logging message: ' + error.message);
    } else {
      // Simulate sending
      if (channel === 'whatsapp') {
        window.open(`https://wa.me/?text=${encodeURIComponent(content)}`, '_blank');
      } else {
        alert('Email scheduled for delivery.');
      }
      refresh();
    }
    setIsSending(false);
  };

  const displayLogs = realMessages.length > 0 ? realMessages.map(m => ({
    tag: m.type.charAt(0).toUpperCase() + m.type.slice(1).replace('_', ' '),
    time: new Date(m.sentAt || (m as any).sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    recipient: (m as any).recipient_id || m.recipientId,
    icon: (m as any).channel === 'whatsapp' || m.channel === 'whatsapp' ? 'sensors' : 'alternate_email',
    color: m.type === 'attendance' ? 'secondary' : m.type === 'payment' ? 'primary' : 'error'
  })) : [
    { tag: 'Attendance Reminder', time: '10:45 AM', recipient: 'Dance Class B', icon: 'sensors', color: 'secondary' },
    { tag: 'Fee Due Notice', time: 'Yesterday', recipient: 'Mrs. Tan', icon: 'history', color: 'primary' },
    { tag: 'Class Cancellation', time: 'Mon', recipient: 'Public Holiday Alert', icon: 'block', color: 'error' }
  ];

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div id="messages-page" className="space-y-8 max-w-lg mx-auto">
      {/* Templates Row */}
      <section id="templates-section">
        <div className="flex justify-between items-center mb-6 px-2">
          <h2 className="text-sm font-black font-heading text-neutral-400 uppercase tracking-[0.2em]">{t('chat.templates')}</h2>
          <button className="text-[10px] font-mono font-black text-primary hover:bg-primary/5 px-3 py-1 rounded-lg transition-all border border-transparent hover:border-primary/20">FETCH All</button>
        </div>
        <div className="flex overflow-x-auto gap-4 hide-scrollbar pb-3">
          {TEMPLATES.map((item) => (
            <motion.div 
              key={item.id}
              whileHover={{ y: -4, scale: 1.02 }}
              className="flex-shrink-0 w-52 bg-white border border-neutral-100 rounded-[2rem] p-6 shadow-sm active:scale-95 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-neutral-50 text-primary rounded-2xl flex items-center justify-center mb-6 border border-neutral-100 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                <span className="material-symbols-outlined text-2xl">{item.icon}</span>
              </div>
              <h3 className="text-sm font-bold text-neutral-900 mb-2 italic underline underline-offset-4 decoration-neutral-100 group-hover:decoration-primary/50">{t(item.id === '1' ? 'chat.attendance_reminder' : item.id === '2' ? 'chat.fee_due' : 'chat.progress_update') || item.title}</h3>
              <p className="text-[11px] font-medium text-neutral-500 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Composer */}
      <section id="composer-section" className="bg-white border border-neutral-100 rounded-[2.5rem] overflow-hidden shadow-lg">
        <div className="p-6 border-b border-neutral-100 flex items-center gap-4 bg-neutral-50/50">
          <span className="material-symbols-outlined text-primary text-2xl">terminal</span>
          <h2 className="text-lg font-bold font-heading text-neutral-900 italic">{t('chat.compose')}</h2>
        </div>
        <div className="p-8 space-y-8">
          <div className="space-y-4">
            <label className="block text-[10px] font-mono font-black text-neutral-400 uppercase tracking-[0.3em]">{t('chat.recipients')}</label>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => setRecipientType('all')}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${recipientType === 'all' ? 'bg-primary text-white shadow-md scale-105' : 'bg-neutral-50 text-neutral-400'}`}
              >
                {t('chat.all_parents')}
              </button>
              <button 
                onClick={() => setRecipientType('class')}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${recipientType === 'class' ? 'bg-primary text-white shadow-md scale-105' : 'bg-neutral-50 text-neutral-400'}`}
              >
                {t('chat.this_class')}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-mono font-black text-neutral-400 uppercase tracking-[0.3em]">{t('chat.content')}</label>
            <div className="relative">
              <textarea 
                className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-6 text-sm font-medium text-neutral-600 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all resize-none leading-relaxed h-40" 
                placeholder="Type your message here..." 
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="absolute bottom-4 right-4 text-[9px] font-mono text-neutral-400">UTF-8 // READY</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-2">
            <button 
              disabled={isSending}
              onClick={() => handleSendMessage('whatsapp')}
              className="w-full bg-[#25D366] text-white h-14 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] shadow-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
              {t('chat.send_whatsapp')}
            </button>
            <button 
              disabled={isSending}
              onClick={() => handleSendMessage('email')}
              className="w-full border-2 border-neutral-100 text-neutral-400 h-14 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] hover:bg-neutral-50 active:scale-95 transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-xl">alternate_email</span>
              {t('chat.send_email')}
            </button>
          </div>
        </div>
      </section>

      {/* Message Log */}
      <section id="logs-section" className="pb-12">
        <div className="flex justify-between items-center mb-6 px-2">
          <h2 className="text-sm font-black font-heading text-neutral-400 uppercase tracking-[0.2em]">{t('chat.logs')}</h2>
          <span className="text-[9px] font-mono font-bold text-neutral-300 uppercase">Archive Mode Active</span>
        </div>
        <div className="space-y-4">
          {displayLogs.map((log, i) => (
            <div key={i} className="bg-white border border-neutral-100 rounded-[2rem] p-5 flex items-center gap-5 hover:border-primary/40 shadow-sm transition-all cursor-pointer group">
              <div className={`w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center text-${log.color} shrink-0 border border-neutral-100 group-hover:border-primary/30 transition-all`}>
                <span className="material-symbols-outlined text-xl">{log.icon}</span>
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-sm font-bold text-neutral-900 italic truncate group-hover:underline decoration-primary underline-offset-4">{log.tag}</h4>
                  <span className="text-[9px] font-mono font-bold text-neutral-400 shrink-0">{log.time}</span>
                </div>
                <p className="text-[10px] font-mono text-neutral-400 truncate uppercase tracking-widest">{log.recipient}</p>
              </div>
              <span className="material-symbols-outlined text-neutral-200 group-hover:text-primary transition-colors text-xl">chevron_right</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
