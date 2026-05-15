/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Classes } from './pages/Classes';
import { Students } from './pages/Students';
import { Payments } from './pages/Payments';
import { Messages } from './pages/Messages';

function AppContent() {
  const { activeTab } = useApp();

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard />;
      case 'classes':
        return <Classes />;
      case 'students':
        return <Students />;
      case 'pay':
        return <Payments />;
      case 'chat':
        return <Messages />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

