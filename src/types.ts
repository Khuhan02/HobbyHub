/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Language {
  EN = 'EN',
  BM = 'BM',
}

export type ClassType = 'ART' | 'MUSIC' | 'ROBOTICS' | 'DANCE' | 'SCIENCE';

export interface ClassSession {
  id: string;
  name: string;
  type: ClassType;
  time: string;
  duration: string;
  teacher: string;
  fee: string;
  enrollment: string;
  maxEnrollment: number;
  status: 'Active' | 'Limited' | 'Full';
  location?: string;
}

export interface Student {
  id: string;
  name: string;
  className: string;
  guardian: string;
  attendanceRate: number;
  paymentStatus: 'Paid' | 'Overdue' | 'Pending';
  photoUrl: string;
  category: ClassType;
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
