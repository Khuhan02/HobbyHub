/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { useData } from '../hooks/useData';
import { CLASSES, STUDENTS } from '../constants';
import { supabase } from '../lib/supabase';

export function Classes() {
  const { t, user } = useApp();
  const { classes: realClasses, students, attendance, loading, refresh } = useData();
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
                <span className="material-symbols-outlined text-primary text-xl">tune</span>
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
          </motion.div>
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
