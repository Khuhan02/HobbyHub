/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { Language } from '../types';
import { LOGO_URL, ADMIN_PHOTO_URL } from '../constants';

export function Header() {
  const { language, setLanguage } = useApp();

  return (
    <header id="top-bar" className="bg-background sticky top-0 z-40 border-b border-outline flex justify-between items-center px-6 py-4 w-full h-20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
          <img alt="HobbyHub Logo" className="w-6 h-6 object-contain invert brightness-0" src={LOGO_URL} />
        </div>
        <span className="font-heading text-2xl font-bold tracking-tight text-on-surface italic underline underline-offset-4 decoration-primary">HobbyHub</span>
      </div>
      
      <div className="flex items-center gap-6 text-sm font-medium">
        {/* System Active Badge Simulator */}
        <div className="hidden sm:flex px-4 py-2 bg-surface-container border border-outline rounded-full items-center gap-2 text-on-surface-variant">
          <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
          System Active: 100%
        </div>

        {/* Language Toggle */}
        <div id="language-toggle" className="flex items-center bg-surface-container rounded-full p-1 border border-outline">
          <button
            onClick={() => setLanguage(Language.BM)}
            className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest transition-all ${
              language === Language.BM ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            BM
          </button>
          <button
            onClick={() => setLanguage(Language.EN)}
            className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest transition-all ${
              language === Language.EN ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            EN
          </button>
        </div>

        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center overflow-hidden border border-outline shadow-lg">
          <img 
            className="w-full h-full object-cover" 
            src={ADMIN_PHOTO_URL}
            alt="Profile"
          />
        </div>
      </div>
    </header>
  );
}
