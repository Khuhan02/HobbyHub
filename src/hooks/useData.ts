/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { ClassSession, Student, AttendanceRecord, PaymentRecord, MessageLog } from '../types';

export function useData() {
  const { user } = useApp();
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [messages, setMessages] = useState<MessageLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const [
        { data: classesData },
        { data: studentsData },
        { data: attendanceData },
        { data: paymentsData },
        { data: messagesData }
      ] = await Promise.all([
        supabase.from('classes').select('*').eq('user_id', user.id),
        supabase.from('students').select('*, classes(name)').eq('user_id', user.id),
        supabase.from('attendance').select('*').eq('user_id', user.id),
        supabase.from('payments').select('*, students(name, parentName, parentPhone), classes(name)').eq('user_id', user.id),
        supabase.from('messages').select('*').eq('user_id', user.id).order('sent_at', { ascending: false })
      ]);

      if (classesData) setClasses(classesData as ClassSession[]);
      if (studentsData) {
        setStudents(studentsData.map(s => ({
          ...s,
          className: (s as any).classes?.name
        })) as Student[]);
      }
      if (attendanceData) setAttendance(attendanceData as AttendanceRecord[]);
      if (paymentsData) setPayments(paymentsData as PaymentRecord[]);
      if (messagesData) setMessages(messagesData as MessageLog[]);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return { classes, students, attendance, payments, messages, loading, refresh: fetchData };
}
