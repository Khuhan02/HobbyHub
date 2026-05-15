/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { STUDENTS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

export function Students() {
  const { t } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const filteredStudents = STUDENTS.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentStudent = STUDENTS.find(s => s.id === selectedStudent);

  return (
    <div id="students-page" className="space-y-6 max-w-lg mx-auto">
      <AnimatePresence mode="wait">
        {!selectedStudent ? (
          <motion.div
            key="gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <section id="search-section">
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-neutral-600 transition-colors group-focus-within:text-primary">search</span>
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('students.search')}
                  className="w-full pl-14 pr-6 py-5 rounded-[2rem] border border-neutral-800 bg-neutral-900 focus:bg-neutral-950 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-sm text-on-surface"
                />
              </div>
            </section>

            <div className="flex justify-between items-end px-2">
              <h2 className="text-sm font-black font-heading text-neutral-500 uppercase tracking-[0.2em]">{t('students.gallery')}</h2>
              <span className="text-[10px] font-mono font-black text-neutral-400 bg-neutral-800 px-3 py-1 rounded-lg border border-neutral-700">INDEXED: {STUDENTS.length}</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredStudents.map((student) => (
                <div 
                  key={student.id}
                  onClick={() => setSelectedStudent(student.id)}
                  className={`bg-neutral-900 rounded-[2rem] border border-neutral-800 p-5 flex gap-5 shadow-lg active:scale-[0.98] transition-all cursor-pointer hover:border-primary/50 group ${student.paymentStatus === 'Overdue' ? 'border-dashed border-rose-500/30' : ''}`}
                >
                  <div className={`w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border border-neutral-800 group-hover:border-primary/30 transition-all ${student.paymentStatus === 'Overdue' ? 'grayscale opacity-70' : ''}`}>
                    <img src={student.photoUrl} className="w-full h-full object-cover" alt={student.name} />
                  </div>
                  <div className="flex-grow flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-white italic underline underline-offset-4 decoration-primary/20 group-hover:decoration-primary transition-all leading-tight">{student.name}</h3>
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                        student.paymentStatus === 'Paid' ? 'bg-secondary/10 text-secondary border-secondary/20' : 
                        'bg-rose-500/10 text-rose-500 border-rose-500/20'
                      }`}>
                        {student.paymentStatus}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono font-black text-neutral-400 uppercase tracking-widest">{student.className}</p>
                    <div className="flex items-center gap-4 text-neutral-500">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base">verified</span>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest">{student.attendanceRate}% ATD</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="progress"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <button 
              onClick={() => setSelectedStudent(null)}
              className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest hover:translate-x-[-4px] transition-transform"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Back to Records
            </button>

            <div className="flex items-center gap-5 bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-6 shadow-2xl">
              <div className="w-20 h-20 rounded-3xl overflow-hidden border-2 border-primary/20 shadow-inner">
                <img src={currentStudent?.photoUrl} className="w-full h-full object-cover" alt="Student" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-black text-neutral-500 uppercase tracking-[0.2em] block mb-1">Subject Profile</span>
                <h2 className="text-3xl font-bold font-heading text-white italic">
                  {currentStudent?.name}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-900 rounded-[2rem] p-6 border border-neutral-800 shadow-xl flex flex-col justify-between min-h-[160px] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                   <span className="material-symbols-outlined text-6xl text-white">analytics</span>
                </div>
                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{t('students.attendance')}</span>
                <div className="text-5xl font-bold text-primary font-mono tracking-tighter">{currentStudent?.attendanceRate}%</div>
                <div className="flex items-end gap-1.5 h-10 mt-2">
                  {[40, 70, 90, 85, 60, 95].map((h, i) => (
                    <div key={i} className="flex-1 bg-primary/40 group-hover:bg-primary rounded-sm transition-all" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>

              <div className="bg-neutral-900 rounded-[2rem] p-6 border border-neutral-800 shadow-xl flex flex-col justify-between min-h-[160px]">
                <div>
                  <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-3">Unit Status</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-mono font-bold text-secondary uppercase tracking-[0.15em]">System Active</span>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest block mb-1">Next Sync</span>
                  <div className="text-xl font-bold text-neutral-200 font-mono tracking-tighter">OCT. 15. 23</div>
                </div>
              </div>

              <div className="col-span-2 bg-neutral-900 rounded-[2rem] p-8 border border-neutral-800 shadow-xl space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-xl">history_edu</span>
                    {t('students.milestones')}
                  </h4>
                  <span className="text-[9px] font-mono font-bold text-neutral-600">SECURE LOG</span>
                </div>
                <div className="space-y-8">
                  <div className="flex gap-6 relative">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 rounded-full bg-primary z-10 border-[5px] border-neutral-950 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                      <div className="w-px flex-1 bg-neutral-800 absolute top-4 bottom-[-32px] left-2"></div>
                    </div>
                    <div className="flex-1 pb-2">
                      <p className="text-[9px] font-mono font-black text-primary uppercase tracking-widest mb-2">2023_SEP_12</p>
                      <p className="text-lg font-bold text-white italic underline underline-offset-4 decoration-neutral-800 leading-tight">Built first circuit</p>
                      <p className="text-xs text-neutral-500 mt-3 font-medium leading-relaxed max-w-[90%]">Successfully connected an LED and switch using a breadboard without assistance. Integrity check passed.</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 rounded-full bg-neutral-800 z-10 border-[5px] border-neutral-950"></div>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono font-black text-neutral-600 uppercase tracking-widest mb-2">2023_AUG_28</p>
                      <p className="text-lg font-bold text-neutral-500 leading-tight">Basic logic gates intro</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button className="fixed bottom-32 right-8 w-16 h-16 bg-neutral-800 text-white rounded-3xl shadow-2xl flex items-center justify-center active:scale-90 transition-all hover:bg-primary/20 hover:text-primary group border border-neutral-700">
              <span className="material-symbols-outlined text-3xl group-hover:scale-125 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
