/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';
import { Header } from './Header';
import { Navigation } from './Navigation';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div id="app-layout" className="min-h-screen flex flex-col max-w-7xl mx-auto bg-background">
      <Header />
      <main className="flex-1 pb-24 px-4 pt-4 overflow-y-auto">
        {children}
      </main>
      <Navigation />
    </div>
  );
}
