/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { useData } from '../hooks/useData';
import { CLASSES, STUDENTS } from '../constants';
import { supabase } from '../lib/supabase';
import { analyzeAttendance, AttendanceInsight, AttendanceStats, generateCancellationNotice } from '../services/geminiService';

export function Classes() {
  const { t, user } = useApp();
  const { classes: realClasses, students, attendance, loading, refresh } = useData();
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [insights, setInsights] = useState<AttendanceInsight[] | null>(null);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Teacher unwell');
  const [cancelNote, setCancelNote] = useState('');
  const [generatedNotice, setGeneratedNotice] = useState<string | null>(null);
  const [isGeneratingNotice, setIsGeneratingNotice] = useState(false);

  useEffect(() => {
    setInsights(null);
    setGeneratedNotice(null);
  }, [selectedClass]);

  const handleGenerateNotice = async () => {
    if (!selectedClass) return;
    setIsGeneratingNotice(true);
    
    const currentClass = displayClasses.find(c => c.id === selectedClass);
    const businessPhone = "+603-1234 5678"; 
    
    try {
      const notice = await generateCancellationNotice({
        className: currentClass?.name || 'Class',
        date: 'next session', 
        time: currentClass?.time || 'Scheduled time',
        reason: cancelReason,
        note: cancelNote,
        businessPhone
      });
      setGeneratedNotice(notice);
    } catch (error) {
      alert('Failed to generate notice: ' + error);
    } finally {
      setIsGeneratingNotice(false);
    }
  };

  const handleSendNoticeToAll = () => {
    if (!generatedNotice) return;
    
    const parents = classStudents
      .map(s => (s as any).parentPhone || (s as any).parent_phone)
      .filter(Boolean);
      
    if (parents.length === 0) {
      alert('No parent contact numbers found for this class.');
      return;
    }

    const encodedMessage = encodeURIComponent(generatedNotice);
    
    parents.forEach((phone, index) => {
      setTimeout(() => {
        const formattedPhone = `60${phone.replace(/^0/, '')}`;
        window.open(`https://wa.me/${formattedPhone}?text=${encodedMessage}`, '_blank');
      }, index * 1500); 
    });
    
    setShowCancelModal(false);
    setGeneratedNotice(null);
  };

  const handleAnalyseAttendance = async () => {
    if (!selectedClass || !user) return;
    setIsAnalysing(true);

    try {
      // 1. Check cache first (ignore for now if table might not exist, but let's try)
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 24);
      
      const { data: cached } = await supabase
        .from('class_insights')
        .select('*')
        .eq('class_id', selectedClass)
        .gt('created_at', yesterday.toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (cached && cached.length > 0) {
        setInsights(cached[0].insights as AttendanceInsight[]);
        setIsAnalysing(false);
        return;
      }

      // 2. Fetch 60 days of attendance
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const { data: attData } = await supabase
        .from('attendance')
        .select('*')
        .eq('class_id', selectedClass)
        .gte('date', sixtyDaysAgo.toISOString().split('T')[0]);

      if (!attData || attData.length === 0) {
        alert('Not enough attendance data for analysis.');
        setIsAnalysing(false);
        return;
      }

      // 3. Process stats
      const stats: AttendanceStats[] = classStudents.map(student => {
        const studentAtt = attData.filter(a => ((a as any).student_id || (a as any).studentId) === student.id);
        const presentCount = studentAtt.filter(a => a.status === 'present').length;
        const totalSessions = studentAtt.length;
        const rate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

        const sorted = [...studentAtt].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        let currentStreak = 0;
        let maxStreak = 0;
        for (const record of sorted) {
          if (record.status === 'absent') {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
          } else {
            currentStreak = 0;
          }
        }

        return {
          studentName: student.name,
          attendanceRate: rate,
          longestAbsenceStreak: maxStreak
        };
      });

      // 4. Call Gemini
      const className = displayClasses.find(c => c.id === selectedClass)?.name || 'Class';
      const result = await analyzeAttendance(className, stats);
      setInsights(result.slice(0, 3)); // Only 3 students as per prompt

      // 5. Cache result
      await supabase.from('class_insights').insert([{
        user_id: user.id,
        class_id: selectedClass,
        insights: result.slice(0, 3),
        created_at: new Date().toISOString()
      }]);

    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalysing(false);
    }
  };

  const getStudentStreak = (studentId: string, classId: string) => {
    const studentAttendance = attendance
      .filter(a => 
        ((a as any).student_id === studentId || a.studentId === studentId) && 
        ((a as any).class_id === classId || a.classId === classId)
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);
    
    const streak = [...studentAttendance].reverse();
    const paddedStreak = [...Array(8 - streak.length).fill(null), ...streak];
    return paddedStreak;
  };

  const displayStudents = students.length > 0 ? students : STUDENTS;
  const classStudents = displayStudents.filter(s => s.classId === selectedClass || (s as any).class_id === selectedClass);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'art',
    dayOfWeek: 'Monday',
    startTime: '10:00',
    endTime: '11:00',
    maxCapacity: 20,
    teacherName: '',
    termFee: 150
  });

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    const { error } = await supabase
      .from('classes')
      .insert([{
        user_id: user.id,
        name: formData.name,
        type: formData.type,
        day_of_week: formData.dayOfWeek,
        start_time: formData.startTime,
        end_time: formData.endTime,
        max_capacity: formData.maxCapacity,
        teacher_name: formData.teacherName,
        term_fee: formData.termFee,
        enrolled_count: 0,
        is_active: true
      }]);

    if (error) {
      alert('Error adding class: ' + error.message);
    } else {
      setShowAddModal(false);
      refresh();
      setFormData({
        name: '',
        type: 'art',
        dayOfWeek: 'Monday',
        startTime: '10:00',
        endTime: '11:00',
        maxCapacity: 20,
        teacherName: '',
        termFee: 150
      });
    }
    setIsSaving(false);
  };

  const displayClasses = realClasses.length > 0 ? realClasses.map(c => ({
    id: c.id,
    name: c.name,
    teacher: (c as any).teacher_name || c.teacherName,
    time: `${(c as any).start_time || c.startTime} - ${(c as any).end_time || c.endTime}`,
    status: c.isActive ? 'Active' : 'Archived',
    fee: `RM${(c as any).term_fee || c.termFee}`,
    enrollment: `${(c as any).enrolled_count || c.enrolledCount}/${(c as any).max_capacity || c.maxCapacity}`,
    maxEnrollment: (c as any).max_capacity || c.maxCapacity
  })) : CLASSES;

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div id="classes-page" className="space-y-6 max-w-lg mx-auto">
      <header className="px-1">
          <h2 className="text-sm font-black font-heading text-neutral-400 uppercase tracking-[0.2em] mb-1">
            {selectedClass 
              ? displayClasses.find(c => c.id === selectedClass)?.name 
              : t('classes.active_classes')}
          </h2>
        <p className="text-2xl font-bold text-neutral-900">
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
            {displayClasses.map((item) => (
              <div 
                key={item.id} 
                className="bg-white border border-neutral-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md active:bg-neutral-50 transition-all cursor-pointer group"
                onClick={() => setSelectedClass(item.id)}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold font-heading text-neutral-900 italic underline underline-offset-4 decoration-primary/20 group-hover:decoration-primary transition-all">{item.name}</h3>
                    <div className="flex items-center gap-2 text-neutral-400 mt-2">
                       <span className="material-symbols-outlined text-[14px]">schedule</span>
                       <span className="text-[10px] font-mono uppercase tracking-widest">{item.time}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    item.status === 'Active' ? 'bg-secondary/5 text-secondary border-secondary/10' : 
                    item.status === 'Limited' ? 'bg-tertiary/5 text-tertiary border-tertiary/10' : 'bg-neutral-100 text-neutral-400 border-neutral-200'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neutral-50/50 p-4 rounded-2xl border border-neutral-100">
                    <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-1">Teacher</span>
                    <span className="text-sm font-bold text-neutral-700">{item.teacher}</span>
                  </div>
                  <div className="bg-neutral-50/50 p-4 rounded-2xl border border-neutral-100 text-right">
                    <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-1">Term Fee</span>
                    <span className="text-sm font-mono font-black text-primary">{item.fee}</span>
                  </div>
                  
                  <div className="col-span-2 bg-neutral-50/30 p-4 rounded-2xl border border-neutral-100 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
                      <span>Enrollment</span>
                      <span className="text-neutral-600">{item.enrollment}</span>
                    </div>
                    <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-700 rounded-full ${
                          parseFloat(item.enrollment) / item.maxEnrollment > 0.9 ? 'bg-rose-500' : 'bg-primary'
                        }`}
                        style={{ width: `${(parseFloat(item.enrollment) / item.maxEnrollment) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <button className="w-full mt-6 bg-neutral-50 hover:bg-neutral-100 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-neutral-400 flex items-center justify-center gap-2 transition-all">
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

            <div className="bg-white border border-neutral-100 rounded-[2rem] overflow-hidden shadow-xl">
              <div className="bg-neutral-50/50 px-6 py-4 flex justify-between items-center border-b border-neutral-100">
                <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">
                  {t('classes.attendance')}
                </h3>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleAnalyseAttendance}
                    disabled={isAnalysing}
                    className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline disabled:opacity-50 flex items-center gap-1"
                  >
                    {isAnalysing ? (
                      <span className="w-2 h-2 border border-primary border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <span className="material-symbols-outlined text-[10px]">auto_awesome</span>
                    )}
                    Analyse Patterns
                  </button>
                  <button 
                    onClick={() => setShowCancelModal(true)}
                    className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[10px]">cancel</span>
                    Cancel Class
                  </button>
                  <span className="material-symbols-outlined text-primary text-xl">tune</span>
                </div>
              </div>
              <div className="divide-y divide-neutral-100">
                {classStudents.map((student) => {
                  const streak = getStudentStreak(student.id, selectedClass!);
                  return (
                    <div key={student.id} className="p-5 flex items-center justify-between hover:bg-neutral-50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-neutral-100 overflow-hidden border border-neutral-200 group-hover:border-primary/50 transition-all">
                          <img src={student.photoUrl} className="w-full h-full object-cover" alt={student.name} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-neutral-700">{student.name}</p>
                          <p className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest mt-1">ID • {student.id}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {streak.map((record, i) => (
                          <div 
                            key={i} 
                            className={`w-3 h-3 rounded-md shadow-sm transition-all ${
                              record === null ? 'bg-neutral-100' : 
                              record.status === 'present' ? 'bg-secondary' : 
                              record.status === 'absent' ? 'bg-rose-500' : 'bg-neutral-300'
                            }`}
                            title={record ? `${record.date}: ${record.status}` : 'No record'}
                          ></div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {insights && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-neutral-100 rounded-[2rem] p-8 shadow-sm space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
                    Attendance Insights
                  </h4>
                  <span className="text-[9px] font-mono font-bold text-neutral-200">GEMINI_ANALYTICS</span>
                </div>
                <div className="space-y-4">
                  {insights.map((insight, idx) => (
                    <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-neutral-50/50 border border-neutral-100">
                      <div className={`w-1 h-auto rounded-full ${insight.riskLevel === 'high' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-bold text-neutral-900 italic">{insight.studentName}</p>
                          <span className={`text-[8px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-md border ${
                            insight.riskLevel === 'high' ? 'bg-red-50 border-red-100 text-red-500' : 'bg-amber-50 border-amber-100 text-amber-500'
                          }`}>
                            {insight.riskLevel}_risk
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 leading-relaxed italic">
                          {insight.suggestedAction}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-neutral-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-neutral-100 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-neutral-50 bg-neutral-50/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-rose-500 text-2xl">event_busy</span>
                  <h3 className="text-xl font-bold text-neutral-900 italic">Cancel Notice</h3>
                </div>
                <button onClick={() => { setShowCancelModal(false); setGeneratedNotice(null); }} className="text-neutral-400 hover:text-neutral-600 transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="p-8 space-y-6">
                {!generatedNotice ? (
                  <>
                    <div className="space-y-2">
                       <label className="text-[10px] font-mono font-black text-neutral-400 uppercase tracking-widest block ml-1">Reason for Cancellation</label>
                       <select 
                         value={cancelReason}
                         onChange={(e) => setCancelReason(e.target.value)}
                         className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-sm font-bold text-neutral-800 focus:border-primary outline-none appearance-none"
                       >
                         <option>Teacher unwell</option>
                         <option>Public holiday</option>
                         <option>Venue issue</option>
                         <option>Other</option>
                       </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono font-black text-neutral-400 uppercase tracking-widest block ml-1">Additional Note (Optional)</label>
                      <textarea 
                        value={cancelNote}
                        onChange={(e) => setCancelNote(e.target.value)}
                        placeholder="e.g. Rescheduling to next Tuesday..."
                        className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-sm font-medium text-neutral-800 focus:border-primary outline-none h-24 resize-none shadow-inner"
                      />
                    </div>

                    <button 
                      onClick={handleGenerateNotice}
                      disabled={isGeneratingNotice}
                      className="w-full bg-neutral-900 text-white h-14 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isGeneratingNotice ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <span className="material-symbols-outlined text-xl">auto_awesome</span>
                      )}
                      Generate Notice
                    </button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono font-black text-neutral-400 uppercase tracking-widest block ml-1">Generated Message</label>
                      <textarea 
                        value={generatedNotice}
                        onChange={(e) => setGeneratedNotice(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-6 text-sm text-neutral-700 leading-relaxed font-medium italic h-48 resize-none focus:border-primary outline-none shadow-inner"
                      />
                    </div>

                    <button 
                      onClick={handleSendNoticeToAll}
                      className="w-full bg-[#25D366] text-white h-14 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:brightness-110 active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-xl">send_all</span>
                      Send to All Parents
                    </button>
                    
                    <button 
                      onClick={() => setGeneratedNotice(null)}
                      className="w-full text-neutral-400 font-black text-[9px] uppercase tracking-widest hover:text-neutral-600 transition-all"
                    >
                      Re-configure
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-32 right-8 w-14 h-14 bg-primary text-white rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-40"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-neutral-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-neutral-100 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-neutral-50 bg-neutral-50/50 flex justify-between items-center">
                <h3 className="text-xl font-bold text-neutral-900 italic">Add New Class</h3>
                <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-neutral-600 transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleAddClass} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-black text-neutral-400 uppercase tracking-widest block ml-1">Class Name</label>
                  <input 
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-sm font-bold text-neutral-800 focus:border-primary outline-none"
                    placeholder="e.g., Creative Arts Level 1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-black text-neutral-400 uppercase tracking-widest block ml-1">Teacher</label>
                    <input 
                      required
                      type="text"
                      value={formData.teacherName}
                      onChange={(e) => setFormData({...formData, teacherName: e.target.value})}
                      className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-sm font-bold text-neutral-800 focus:border-primary outline-none"
                      placeholder="Cikgu Aminah"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-black text-neutral-400 uppercase tracking-widest block ml-1">Term Fee (RM)</label>
                    <input 
                      required
                      type="number"
                      value={formData.termFee}
                      onChange={(e) => setFormData({...formData, termFee: parseInt(e.target.value)})}
                      className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-sm font-bold text-neutral-800 focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-black text-neutral-400 uppercase tracking-widest block ml-1">Start Time</label>
                    <input 
                      required
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-sm font-bold text-neutral-800 focus:border-primary outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-black text-neutral-400 uppercase tracking-widest block ml-1">End Time</label>
                    <input 
                      required
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                      className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-sm font-bold text-neutral-800 focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <button 
                  disabled={isSaving}
                  type="submit"
                  className="w-full bg-primary text-white h-14 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/10 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSaving ? 'SAVING...' : 'INITIATE CLASS'}
                  <span className="material-symbols-outlined">rocket_launch</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
