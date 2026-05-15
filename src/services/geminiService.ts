/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ProgressReportData {
  studentName: string;
  age: number;
  classType: string;
  attendanceRate: string;
  notes: string[];
}

export interface AttendanceStats {
  studentName: string;
  attendanceRate: number;
  longestAbsenceStreak: number;
}

export interface AttendanceInsight {
  studentName: string;
  attendanceRate: number;
  riskLevel: 'high' | 'medium';
  suggestedAction: string;
}

export interface CancellationData {
  className: string;
  date: string;
  time: string;
  reason: string;
  note?: string;
  businessPhone: string;
}

export async function generateCancellationNotice(data: CancellationData): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined. Please configure it in your environment.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    systemInstruction: 'You are writing on behalf of a kids hobby class centre manager.',
  });

  const prompt = `
    Write a WhatsApp cancellation notice for ${data.className} scheduled on ${data.date} at ${data.time}. 
    Reason: ${data.reason}. 
    ${data.note ? `Extra note: ${data.note}.` : ''}
    Include: apology, reschedule offer, contact number ${data.businessPhone}.
    Keep under 80 words. Warm, professional Malaysian English. Plain text only.
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error generating cancellation notice:', error);
    throw new Error('Failed to generate cancellation notice. Please try again.');
  }
}

export async function analyzeAttendance(className: string, stats: AttendanceStats[]): Promise<AttendanceInsight[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined. Please configure it in your environment.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    systemInstruction: 'You are a class management advisor for kids hobby classes.',
  });

  const prompt = `
    Class: ${className}. Past 60 days attendance data:
    ${stats.map(s => `- ${s.studentName}: ${s.attendanceRate}% rate, longest absence streak: ${s.longestAbsenceStreak}`).join('\n')}

    Identify: which 3 students are at highest dropout risk based on attendance pattern, and suggest one specific action per student.
    Return JSON: [{"studentName": "string", "attendanceRate": number, "riskLevel": "high"|"medium", "suggestedAction": "string"}]
    Return ONLY valid JSON.
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // Basic cleanup in case Gemini includes markdown blocks
    const cleanText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Error analyzing attendance:', error);
    throw new Error('Failed to analyze attendance. Please try again.');
  }
}

export interface PaymentReminderData {
  studentName: string;
  parentName: string;
  amount: string;
  dueDate: string;
  className: string;
}

export async function generateProgressReport(data: ProgressReportData): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined. Please configure it in your environment.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    systemInstruction: 'You are a helpful assistant for kids hobby class teachers in Malaysia. Write progress reports that are warm, specific, and encouraging.',
  });

  const prompt = `
    Student: ${data.studentName}, age ${data.age}, enrolled in ${data.classType} class.
    Attendance: ${data.attendanceRate} sessions attended.
    Notes from teacher: ${data.notes.join('; ')}.
    Write a 3-paragraph parent-ready progress report:
    paragraph 1 — skills demonstrated this term,
    paragraph 2 — areas to continue developing,
    paragraph 3 — encouraging closing note personalised to the student.
    Tone: warm, professional, Malaysian English.
    Return plain text only — no headers, no markdown.
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error generating report:', error);
    throw new Error('Failed to generate progress report. Please try again.');
  }
}

export async function generatePaymentReminder(data: PaymentReminderData): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined. Please configure it in your environment.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    systemInstruction: 'You are a polite, professional assistant helping a small Malaysian hobby class business collect fees. Write in warm Malaysian English — friendly but clear.',
  });

  const prompt = `
    Write a WhatsApp payment reminder for parent ${data.parentName} whose child ${data.studentName} has an overdue class fee of RM${data.amount} for ${data.className}. Due date was ${data.dueDate}.
    Keep it under 60 words. Polite and not aggressive.
    Include: the amount, class name, and a simple payment instruction line.
    No emojis. Return plain text only.
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error generating reminder:', error);
    throw new Error('Failed to generate payment reminder. Please try again.');
  }
}
