
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Auth } from '@/components/Auth';
import { DashboardStats } from '@/components/DashboardStats';
import { ReceiptScanner } from '@/components/ReceiptScanner';
import { ExpensesList } from '@/components/ExpensesList';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';

const Index = () => {
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleExpenseAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveView('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardStats />;
      case 'add-expense':
        return <ReceiptScanner onExpenseAdded={handleExpenseAdded} />;
      case 'expenses':
        return <ExpensesList refreshTrigger={refreshTrigger} />;
      default:
        return <DashboardStats />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header 
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      
      <div className="flex">
        <Sidebar 
          isOpen={isSidebarOpen}
          activeView={activeView}
          onViewChange={(view) => {
            setActiveView(view);
            setIsSidebarOpen(false);
          }}
        />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
