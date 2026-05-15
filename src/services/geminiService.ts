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
