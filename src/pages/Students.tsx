/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { STUDENTS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { useData } from '../hooks/useData';
import { generateProgressReport } from '../services/geminiService';
import { supabase } from '../lib/supabase';

export function Students() {
  const { t, user } = useApp();
  const { students: realStudents, loading, classes, refresh } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: 8,
    classId: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    notes: ''
  });

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    const { error } = await supabase
      .from('students')
      .insert([{
        user_id: user.id,
        name: formData.name,
        age: formData.age,
        class_id: formData.classId || null,
        parent_name: formData.parentName,
        parent_phone: formData.parentPhone,
        parent_email: formData.parentEmail,
        notes: formData.notes,
        photo_url: 'https://images.unsplash.com/photo-1513973230513-290033beb8bc?q=80&w=256&h=256&auto=format&fit=crop',
        enrolled_date: new Date().toISOString()
      }]);

    if (error) {
      alert('Error adding student: ' + error.message);
    } else {
      setShowAddModal(false);
      refresh();
      setFormData({
        name: '',
        age: 8,
        classId: '',
        parentName: '',
        parentPhone: '',
        parentEmail: '',
        notes: ''
      });
    }
    setIsSaving(false);
  };

  const displayStudents = realStudents.length > 0 ? realStudents.map(s => ({
    id: s.id,
    name: s.name,
    className: (s as any).classes?.name || s.className || 'Unassigned',
    guardian: (s as any).parent_name || s.parentName,
    attendanceRate: 85, // Placeholder or computed
    paymentStatus: 'Paid', // Placeholder or computed
    photoUrl: s.photoUrl || 'https://images.unsplash.com/photo-1513973230513-290033beb8bc?q=80&w=256&h=256&auto=format&fit=crop',
    category: 'ROBOTICS' as any
  })) : STUDENTS;

  // AI Report States
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const filteredStudents = displayStudents.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentStudent = displayStudents.find(s => s.id === selectedStudent);
  const fullStudent = realStudents.find(s => s.id === selectedStudent);

  const handleGenerateReport = async () => {
    if (!currentStudent) return;
    
    setIsGenerating(true);
    setAiReport(null);
    setShowReportModal(true);

    const realStudent = realStudents.find(s => s.id === currentStudent.id);
    const studentNotes = realStudent?.notes ? [realStudent.notes] : ['Participates well in class', 'Shows interest in the weekly activities'];

    try {
      const report = await generateProgressReport({
        studentName: currentStudent.name,
        age: realStudent?.age || 8,
        classType: currentStudent.className,
        attendanceRate: `${currentStudent.attendanceRate}/10`,
        notes: studentNotes
      });
      setAiReport(report);
    } catch (error) {
      setAiReport(error instanceof Error ? error.message : 'Error generating report');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (aiReport) {
      navigator.clipboard.writeText(aiReport);
      // Optional: Add a toast notification
    }
  };

  const shareWhatsApp = () => {
    if (aiReport && currentStudent) {
      const encoded = encodeURIComponent(aiReport);
      window.open(`https://wa.me/60123456789?text=${encoded}`, '_blank');
    }
  };

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
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300 transition-colors group-focus-within:text-primary">search</span>
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('students.search')}
                  className="w-full pl-14 pr-6 py-5 rounded-[2rem] border border-neutral-100 bg-neutral-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-sm text-neutral-800 shadow-sm"
                />
              </div>
            </section>

            <div className="flex justify-between items-end px-2">
              <h2 className="text-sm font-black font-heading text-neutral-400 uppercase tracking-[0.2em]">{t('students.gallery')}</h2>
              <span className="text-[10px] font-mono font-black text-neutral-400 bg-neutral-50 px-3 py-1 rounded-lg border border-neutral-100">INDEXED: {displayStudents.length}</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredStudents.map((student) => (
                <div 
                  key={student.id}
                  onClick={() => setSelectedStudent(student.id)}
                  className={`bg-white rounded-[2rem] border border-neutral-100 p-5 flex gap-5 shadow-sm active:scale-[0.98] transition-all cursor-pointer hover:border-primary/50 group ${student.paymentStatus === 'Overdue' ? 'border-dashed border-rose-200' : ''}`}
                >
                  <div className={`w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border border-neutral-100 group-hover:border-primary/30 transition-all ${student.paymentStatus === 'Overdue' ? 'grayscale opacity-70' : ''}`}>
                    <img src={student.photoUrl} className="w-full h-full object-cover" alt={student.name} />
                  </div>
                  <div className="flex-grow flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-neutral-900 italic underline underline-offset-4 decoration-neutral-100 group-hover:decoration-primary transition-all leading-tight">{student.name}</h3>
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                        student.paymentStatus === 'Paid' ? 'bg-secondary/10 text-secondary border-secondary/20' : 
                        'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                        {student.paymentStatus}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono font-black text-neutral-400 uppercase tracking-widest">{student.className}</p>
                    <div className="flex items-center gap-4 text-neutral-400">
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
              {t('students.back')}
            </button>

            <div className="flex items-center justify-between gap-5 bg-white border border-neutral-100 rounded-[2.5rem] p-6 shadow-lg">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-3xl overflow-hidden border-2 border-primary/20 shadow-sm">
                  <img src={currentStudent?.photoUrl} className="w-full h-full object-cover" alt="Student" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-black text-neutral-400 uppercase tracking-[0.2em] block mb-1">Subject Profile</span>
                  <h2 className="text-3xl font-bold font-heading text-neutral-900 italic">
                    {currentStudent?.name}
                  </h2>
                </div>
              </div>
              <button 
                onClick={handleGenerateReport}
                className="bg-primary/5 border border-primary/10 text-primary px-5 py-3 rounded-2xl flex items-center gap-2 hover:bg-primary hover:text-white transition-all active:scale-95 group shadow-sm"
              >
                <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">Auto_Awesome</span>
                <span className="text-[10px] font-black uppercase tracking-widest leading-none pt-0.5">Generate Report</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-[2rem] p-6 border border-neutral-100 shadow-sm flex flex-col justify-between min-h-[160px] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                   <span className="material-symbols-outlined text-6xl text-neutral-900">analytics</span>
                </div>
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{t('students.attendance')}</span>
                <div className="text-5xl font-bold text-primary font-mono tracking-tighter">{currentStudent?.attendanceRate}%</div>
                <div className="flex items-end gap-1.5 h-10 mt-2">
                  {[40, 70, 90, 85, 60, 95].map((h, i) => (
                    <div key={i} className="flex-1 bg-primary/20 group-hover:bg-primary/40 rounded-sm transition-all" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-[2rem] p-6 border border-neutral-100 shadow-sm flex flex-col justify-between min-h-[160px]">
                <div>
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-3">Unit Status</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-mono font-bold text-secondary uppercase tracking-[0.15em]">System Active</span>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-[9px] font-black text-neutral-300 uppercase tracking-widest block mb-1">Next Sync</span>
                  <div className="text-xl font-bold text-neutral-700 font-mono tracking-tighter">OCT. 15. 23</div>
                </div>
              </div>

              <div className="col-span-2 bg-white rounded-[2rem] p-8 border border-neutral-100 shadow-sm space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-4">Guardian Information</span>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-neutral-400 text-lg">person</span>
                        <p className="text-sm font-bold text-neutral-900">{fullStudent?.parentName || (fullStudent as any)?.parent_name || 'N/A'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-neutral-400 text-lg">call</span>
                        <p className="text-sm font-mono font-bold text-neutral-700">{fullStudent?.parentPhone || (fullStudent as any)?.parent_phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-secondary text-2xl">contact_support</span>
                </div>

                {(fullStudent?.parentPhone || (fullStudent as any)?.parent_phone) && (
                  <button 
                    title="Opens WhatsApp on your device"
                    onClick={() => {
                      const phone = fullStudent?.parentPhone || (fullStudent as any)?.parent_phone;
                      if (phone) {
                        const formattedPhone = `60${phone.replace(/^0/, '')}`;
                        window.open(`https://wa.me/${formattedPhone}`, '_blank');
                      }
                    }}
                    className="w-full bg-[#25D366] text-white py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] shadow-md hover:brightness-110 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-xl">chat</span>
                    Message Parent
                  </button>
                )}
              </div>

              <div className="col-span-2 bg-white rounded-[2rem] p-8 border border-neutral-100 shadow-lg space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-xl">history_edu</span>
                    {t('students.milestones')}
                  </h4>
                  <span className="text-[9px] font-mono font-bold text-neutral-200">SECURE LOG</span>
                </div>
                <div className="space-y-8">
                  <div className="flex gap-6 relative">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 rounded-full bg-primary z-10 border-[5px] border-white shadow-sm"></div>
                      <div className="w-px flex-1 bg-neutral-100 absolute top-4 bottom-[-32px] left-2"></div>
                    </div>
                    <div className="flex-1 pb-2">
                      <p className="text-[9px] font-mono font-black text-primary uppercase tracking-widest mb-2">2023_SEP_12</p>
                      <p className="text-lg font-bold text-neutral-900 italic underline underline-offset-4 decoration-neutral-50 leading-tight">Built first circuit</p>
                      <p className="text-xs text-neutral-600 mt-3 font-medium leading-relaxed max-w-[90%]">Successfully connected an LED and switch using a breadboard without assistance. Integrity check passed.</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 rounded-full bg-neutral-100 z-10 border-[5px] border-white"></div>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono font-black text-neutral-300 uppercase tracking-widest mb-2">2023_AUG_28</p>
                      <p className="text-lg font-bold text-neutral-400 leading-tight">Basic logic gates intro</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button className="fixed bottom-32 right-8 w-16 h-16 bg-white text-neutral-400 rounded-3xl shadow-xl flex items-center justify-center active:scale-90 transition-all hover:bg-primary/10 hover:text-primary group border border-neutral-100">
              <span className="material-symbols-outlined text-3xl group-hover:scale-125 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedStudent && (
        <button 
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-32 right-8 w-14 h-14 bg-primary text-white rounded-2xl shadow-[0_8px_30px_rgb(99,102,241,0.4)] flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-40"
        >
          <span className="material-symbols-outlined text-3xl">person_add</span>
        </button>
      )}

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-neutral-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-neutral-100 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="p-8 border-b border-neutral-50 bg-neutral-50/50 flex justify-between items-center sticky top-0 z-10">
                <h3 className="text-xl font-bold text-neutral-900 italic">Add New Student</h3>
                <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-neutral-600 transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleAddStudent} className="p-8 space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-mono font-black text-neutral-400 uppercase tracking-widest block ml-1">Student Details</label>
                  <input 
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-sm font-bold text-neutral-800 focus:border-primary outline-none"
                    placeholder="Student Name"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      required
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})}
                      className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-sm font-bold text-neutral-800 focus:border-primary outline-none"
                      placeholder="Age"
                    />
                    <select 
                      value={formData.classId}
                      onChange={(e) => setFormData({...formData, classId: e.target.value})}
                      className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-sm font-bold text-neutral-800 focus:border-primary outline-none appearance-none"
                    >
                      <option value="">Enroll in Class...</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-mono font-black text-neutral-400 uppercase tracking-widest block ml-1">Guardian Information</label>
                  <input 
                    required
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                    className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-sm font-bold text-neutral-800 focus:border-primary outline-none"
                    placeholder="Parent Name"
                  />
                  <div className="grid grid-cols-1 gap-4">
                    <input 
                      required
                      type="tel"
                      value={formData.parentPhone}
                      onChange={(e) => setFormData({...formData, parentPhone: e.target.value})}
                      className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-sm font-bold text-neutral-800 focus:border-primary outline-none"
                      placeholder="WhatsApp Phone (e.g. 6012...)"
                    />
                    <input 
                      required
                      type="email"
                      value={formData.parentEmail}
                      onChange={(e) => setFormData({...formData, parentEmail: e.target.value})}
                      className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-sm font-bold text-neutral-800 focus:border-primary outline-none"
                      placeholder="Email Address"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-mono font-black text-neutral-400 uppercase tracking-widest block ml-1">Notes</label>
                    <textarea 
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-sm font-bold text-neutral-800 focus:border-primary outline-none h-24 resize-none"
                      placeholder="Medical history, interests, etc."
                    />
                 </div>

                 <button 
                   disabled={isSaving}
                   type="submit"
                   className="w-full bg-primary text-white h-14 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/10 hover:brightness-110 active:scale-90 transition-all disabled:opacity-50"
                 >
                   {isSaving ? 'REGISTERING...' : 'ENROLL STUDENT'}
                   <span className="material-symbols-outlined">how_to_reg</span>
                 </button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReportModal && (
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
                  <h3 className="text-xl font-bold text-neutral-900 italic">{t('students.report')}</h3>
                </div>
                <button onClick={() => setShowReportModal(false)} className="text-neutral-400 hover:text-neutral-600 transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="p-8">
                {isGenerating ? (
                  <div className="py-12 flex flex-col items-center gap-6 text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <div>
                      <p className="text-neutral-700 font-bold italic">{t('students.generating')}</p>
                      <p className="text-[10px] font-mono text-neutral-400 mt-2 uppercase tracking-widest">{t('students.gemini')}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-6 max-h-[300px] overflow-y-auto shadow-inner">
                      <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap font-medium italic">
                        {aiReport}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={copyToClipboard}
                        className="h-14 rounded-2xl border border-neutral-100 text-neutral-400 font-black text-[10px] uppercase tracking-widest hover:bg-neutral-50 transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-lg">content_copy</span>
                        {t('students.copy')}
                      </button>
                      <button 
                        onClick={shareWhatsApp}
                        className="h-14 rounded-2xl bg-[#25D366] text-white font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-md"
                      >
                        <span className="material-symbols-outlined text-lg">chat</span>
                        WhatsApp
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
