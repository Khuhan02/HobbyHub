/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';

const icons = [
  { id: 'home', icon: 'home', label: 'nav.home' },
  { id: 'classes', icon: 'event_note', label: 'nav.classes' },
  { id: 'students', icon: 'person_search', label: 'nav.students' },
  { id: 'pay', icon: 'account_balance_wallet', label: 'nav.pay' },
  { id: 'chat', icon: 'forum', label: 'nav.chat' },
];

export function Navigation() {
  const { activeTab, setActiveTab, t } = useApp();

  return (
    <nav id="bottom-nav" className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm flex justify-around items-center px-2 py-2 bg-neutral-900/90 backdrop-blur-md border border-outline-variant rounded-3xl z-50 shadow-2xl h-16">
      {icons.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            id={`nav-item-${item.id}`}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center transition-all px-4 py-2 rounded-2xl ${
              isActive 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-neutral-500 hover:text-neutral-200'
            }`}
          >
            <span 
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              {item.icon}
            </span>
            {isActive && <span className="text-[8px] font-black uppercase tracking-[0.1em] mt-0.5">{t(item.label)}</span>}
          </button>
        );
      })}
    </nav>
  );
}
