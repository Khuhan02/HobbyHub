/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { LOGO_URL } from '../constants';

export function Login() {
  const { t } = useApp();

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) console.error('Error logging in:', error.message);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-on-surface">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm flex flex-col items-center text-center space-y-8"
      >
        <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/30">
          <img src={LOGO_URL} alt="HobbyHub" className="w-12 h-12 object-contain invert brightness-0" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-black font-heading italic tracking-tighter text-white underline underline-offset-8 decoration-primary">
            HobbyHub
          </h1>
          <p className="text-sm font-black text-neutral-500 uppercase tracking-[0.2em] pt-2">
            Kids Class Management
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-8 w-full shadow-2xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white italic">{t('auth.welcome')}</h2>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Manage schedules, attendance, and payments with ease.
            </p>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full bg-white text-black h-14 rounded-2xl flex items-center justify-center gap-4 font-black text-xs uppercase tracking-widest hover:bg-neutral-200 active:scale-95 transition-all shadow-xl shadow-white/5"
          >
             <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t('auth.login')}
          </button>
        </div>

        <footer className="text-[10px] text-neutral-600 font-mono tracking-widest uppercase">
          Build Ref: 24.08.A // Cloud-Native
        </footer>
      </motion.div>
    </div>
  );
}
