/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Language, UserProfile } from '../types';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  t: (key: string) => string;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const translations: Record<Language, Record<string, string>> = {
  [Language.EN]: {
    'nav.home': 'Home',
    'nav.classes': 'Classes',
    'nav.students': 'Students',
    'nav.pay': 'Pay',
    'nav.chat': 'Chat',
    'dashboard.students_today': 'Students Today',
    'dashboard.classes_today': 'Classes Today',
    'dashboard.payments_overdue': 'Payments Overdue',
    'dashboard.messages_sent': 'Messages Sent',
    'dashboard.class_timeline': 'Class Timeline',
    'dashboard.recent_messages': 'Recent Messages',
    'dashboard.payment_alerts': 'Payment Alerts',
    'classes.active_classes': 'Active Classes',
    'classes.manage_schedules': 'Manage your schedules and students',
    'classes.view_details': 'View Details',
    'classes.attendance': 'Student Attendance (Last 5 Weeks)',
    'students.gallery': 'Students',
    'students.search': 'Search students...',
    'students.progress': "'s Progress",
    'students.attendance': 'Attendance',
    'students.status': 'Status',
    'students.next_billing': 'Next Billing',
    'students.milestones': 'Learning Milestones',
    'students.recent_payments': 'Recent Payments',
    'students.report': 'Progress Report',
    'students.generating': 'Synthesizing Feedback...',
    'students.gemini': 'Querying Gemini Neural Engine',
    'students.copy': 'Copy Text',
    'students.back': 'Back to Records',
    'payments.total_revenue': 'Total Revenue',
    'payments.collected_month': 'collected this month',
    'payments.vs_last_month': 'vs last month',
    'payments.bulk_remind': 'Bulk Remind',
    'payments.export_pdf': 'Export PDF',
    'payments.recent_transactions': 'Recent Transactions',
    'chat.templates': 'Templates',
    'chat.compose': 'Compose Message',
    'chat.recipients': 'Select Recipients',
    'chat.all_parents': 'All Parents',
    'chat.this_class': 'This Class',
    'chat.individual': 'Individual',
    'chat.content': 'Message Content',
    'chat.send_whatsapp': 'Send to WhatsApp',
    'chat.send_email': 'Send as Email',
    'chat.logs': 'Recent Logs',
    'auth.login': 'Login with Google',
    'auth.welcome': 'Welcome to HobbyHub',
    'auth.setup_profile': 'Complete Your Profile',
    'auth.business_name': 'Business Name',
    'auth.business_type': 'Business Type',
    'auth.city': 'City',
    'auth.save_profile': 'Save and Continue',
  },
  [Language.BM]: {
    'nav.home': 'Utama',
    'nav.classes': 'Kelas',
    'nav.students': 'Pelajar',
    'nav.pay': 'Bayar',
    'nav.chat': 'Sembang',
    'dashboard.students_today': 'Pelajar Hari Ini',
    'dashboard.classes_today': 'Kelas Hari Ini',
    'dashboard.payments_overdue': 'Tunggakan Bayaran',
    'dashboard.messages_sent': 'Mesej Dihantar',
    'dashboard.class_timeline': 'Garis Masa Kelas',
    'dashboard.recent_messages': 'Mesej Terkini',
    'dashboard.payment_alerts': 'Amaran Pembayaran',
    'classes.active_classes': 'Kelas Aktif',
    'classes.manage_schedules': 'Urus jadual dan pelajar anda',
    'classes.view_details': 'Lihat Butiran',
    'classes.attendance': 'Kehadiran Pelajar (5 Minggu Terakhir)',
    'students.gallery': 'Pelajar',
    'students.search': 'Cari pelajar...',
    'students.progress': 'Kemajuan ',
    'students.attendance': 'Kehadiran',
    'students.status': 'Status',
    'students.next_billing': 'Bil Seterusnya',
    'students.milestones': 'Pencapaian Pembelajaran',
    'students.recent_payments': 'Pembayaran Terkini',
    'students.report': 'Laporan Kemajuan',
    'students.generating': 'Sintesis Maklum Balas...',
    'students.gemini': 'Enjin Neural Gemini',
    'students.copy': 'Salin Teks',
    'students.back': 'Kembali ke Rekod',
    'payments.total_revenue': 'Jumlah Hasil',
    'payments.collected_month': 'dikutip bulan ini',
    'payments.vs_last_month': 'berbanding bulan lepas',
    'payments.bulk_remind': 'Peringatan Pukal',
    'payments.export_pdf': 'Eksport PDF',
    'payments.recent_transactions': 'Transaksi Terkini',
    'chat.templates': 'Templat',
    'chat.compose': 'Tulis Mesej',
    'chat.recipients': 'Pilih Penerima',
    'chat.all_parents': 'Semua Ibu Bapa',
    'chat.this_class': 'Kelas Ini',
    'chat.individual': 'Individu',
    'chat.content': 'Isi Mesej',
    'chat.send_whatsapp': 'Hantar ke WhatsApp',
    'chat.send_email': 'Hantar sebagai Emel',
    'chat.logs': 'Log Terkini',
    'auth.login': 'Log Masuk dengan Google',
    'auth.welcome': 'Selamat Datang ke HobbyHub',
    'auth.setup_profile': 'Lengkapkan Profil Anda',
    'auth.business_name': 'Nama Perniagaan',
    'auth.business_type': 'Jenis Perniagaan',
    'auth.city': 'Bandar',
    'auth.save_profile': 'Simpan dan Teruskan',
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(Language.EN);
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      setProfile(data as UserProfile);
    } else if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <AppContext.Provider value={{ 
      language, setLanguage, activeTab, setActiveTab, t, 
      user, profile, loading, signOut, refreshProfile 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
