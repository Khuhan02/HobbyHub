/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Language {
  EN = 'EN',
  BM = 'BM',
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: 'art' | 'coding' | 'music' | 'robotics' | 'sports' | 'other';
  plan: 'free' | 'pro';
  city: string;
  createdAt: string;
}

export interface ClassSession {
  id: string;
  userId: string;
  name: string;
  type: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  teacherName: string;
  termFee: number;
  enrolledCount: number;
  isActive: boolean;
}

export interface Student {
  id: string;
  userId: string;
  name: string;
  age: number;
  photoUrl: string;
  classId: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  enrolledDate: string;
  notes: string;
  // Local UI convenience fields (can be computed)
  className?: string; 
  attendanceRate?: number;
  paymentStatus?: 'Paid' | 'Overdue' | 'Pending';
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  classId: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  markedAt: string;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  studentId: string;
  classId: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: 'paid' | 'overdue' | 'pending';
  method: 'cash' | 'transfer' | 'qr' | null;
  termLabel: string;
}

export interface MessageLog {
  id: string;
  userId: string;
  type: 'attendance' | 'payment' | 'progress' | 'cancel';
  recipientType: 'all' | 'class' | 'individual';
  recipientId: string;
  content: string;
  sentAt: string;
  channel: 'whatsapp' | 'email';
}

export interface MessageTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Transaction {
  id: string;
  studentName: string;
  date: string;
  method: string;
  amount: string;
  status: 'Paid' | 'Overdue' | 'Pending';
}

export type ClassType = 'ART' | 'MUSIC' | 'ROBOTICS' | 'CODING' | 'SPORTS' | 'OTHER';
