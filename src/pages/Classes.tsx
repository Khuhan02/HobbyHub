/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CLASSES } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

export function Classes() {
  const { t } = useApp();
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  return (
    <div id="classes-page" className="space-y-6 max-w-lg mx-auto">
      <header className="px-1">
        <h2 className="text-sm font-black font-heading text-neutral-500 uppercase tracking-[0.2em] mb-1">
          {selectedClass 
            ? CLASSES.find(c => c.id === selectedClass)?.name 
            : t('classes.active_classes')}
        </h2>
        <p className="text-2xl font-bold text-on-surface">
          {t('classes.manage_schedules')}
        </p>
      </header>

      <AnimatePresence mode="wait">
        {!selectedClass ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {CLASSES.map((item) => (
              <div 
                key={item.id} 
                className="bg-neutral-900 border border-neutral-800 rounded-[2rem] p-6 shadow-xl active:bg-neutral-800 transition-all cursor-pointer group"
                onClick={() => setSelectedClass(item.id)}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold font-heading text-white italic underline underline-offset-4 decoration-primary/50 group-hover:decoration-primary transition-all">{item.name}</h3>
                    <div className="flex items-center gap-2 text-neutral-500 mt-2">
                       <span className="material-symbols-outlined text-[14px]">schedule</span>
                       <span className="text-[10px] font-mono uppercase tracking-widest">{item.time}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    item.status === 'Active' ? 'bg-secondary/10 text-secondary border-secondary/20' : 
                    item.status === 'Limited' ? 'bg-tertiary/10 text-tertiary border-tertiary/20' : 'bg-neutral-800 text-neutral-500 border-neutral-700'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neutral-800/40 p-4 rounded-2xl border border-neutral-700/30">
                    <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest block mb-1">Teacher</span>
                    <span className="text-sm font-bold text-neutral-200">{item.teacher}</span>
                  </div>
                  <div className="bg-neutral-800/40 p-4 rounded-2xl border border-neutral-700/30 text-right">
                    <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest block mb-1">Term Fee</span>
                    <span className="text-sm font-mono font-black text-primary">{item.fee}</span>
                  </div>
                  
                  <div className="col-span-2 bg-neutral-800/20 p-4 rounded-2xl border border-neutral-700/20 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest">
                      <span>Enrollment</span>
                      <span className="text-neutral-300">{item.enrollment}</span>
                    </div>
                    <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-700 rounded-full ${
                          parseFloat(item.enrollment) / item.maxEnrollment > 0.9 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-primary shadow-[0_0_8px_rgba(99,102,241,0.4)]'
                        }`}
                        style={{ width: `${(parseFloat(item.enrollment) / item.maxEnrollment) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <button className="w-full mt-6 bg-neutral-800 hover:bg-neutral-700 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-neutral-300 flex items-center justify-center gap-2 transition-all">
                  {t('classes.view_details')}
                  <span className="material-symbols-outlined text-sm">north_east</span>
                </button>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <button 
              onClick={() => setSelectedClass(null)}
              className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest hover:translate-x-[-4px] transition-transform"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Back to Fleet
            </button>

            <div className="bg-neutral-900 border border-neutral-800 rounded-[2rem] overflow-hidden shadow-2xl">
              <div className="bg-neutral-800/50 px-6 py-4 flex justify-between items-center border-b border-neutral-800">
                <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">
                  {t('classes.attendance')}
                </h3>
                <span className="material-symbols-outlined text-primary text-xl">tune</span>
              </div>
              <div className="divide-y divide-neutral-800">
                {[
                  { name: 'Adam Danish', id: '10294', history: [1, 1, 1, 0, 1], img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCY9PA8VVviUn8-PpmGmin_3IE2JErO5vNqc9mDBCG9U9BMVA-fD5Micy0_Ial__TyXLXoTfjebKexEZ1z7YwsELs3CrSbAEbVOV6LjrSYX92v0QzsIFNXWN5tyKPEZ6VVSjZgvFCmfymlnFFGiHR90tIb9HXCecNgWImB0FHxbZMxKAeTe89YbQwPU1heNHj4JhPElP3AGdJENm_m4az1_38VGM4m2Eichso1XUmXEFzk8y5qHkYaOwyDpeXWHwAI2xK8dTY3oA3k' },
                  { name: 'Laila Yusof', id: '10301', history: [1, 1, 1, 1, 1], img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0Th8j5F7Td7k29WXW3X_IjDmYXFcZIpmZybvfoBBD9-2HJbYZWcz-jHLwB1QZ6SGRR_kROeVmjqBWU1ISydfVEi26v6JeS64mWCePxiJjoz-CYN8ZVtTOApxih6URhR4LOwSxozlJ_hYJOgbzZDVVsbxQNeMEr3zny6SLW-UniiNW93tHzNiT9WF-ynef56de8tZwKg_EJuc9jZA9VMV4SdPGSt3drq6-6D3iisqTU7rompz_fo-pory3qLE4BxWSB0L4L1_HPqY' }
                ].map((student) => (
                  <div key={student.id} className="p-5 flex items-center justify-between hover:bg-neutral-800/30 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-neutral-800 overflow-hidden border border-neutral-700 group-hover:border-primary/50 transition-all">
                        <img src={student.img} className="w-full h-full object-cover" alt={student.name} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-neutral-200">{student.name}</p>
                        <p className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest mt-1">ID • {student.id}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {student.history.map((present, i) => (
                        <div 
                          key={i} 
                          className={`w-3 h-3 rounded-md shadow-sm transition-all ${present ? 'bg-secondary' : 'bg-rose-500 opacity-30 group-hover:opacity-100'}`}
                        ></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <button className="fixed bottom-32 right-8 w-14 h-14 bg-primary text-white rounded-2xl shadow-[0_8px_30px_rgb(99,102,241,0.4)] flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-40">
              <span className="material-symbols-outlined text-3xl">add</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
