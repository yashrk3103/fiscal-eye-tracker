
import { useState, useEffect } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { ExpenseForm } from '@/components/ExpenseForm';
import { ExpenseList } from '@/components/ExpenseList';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { useExpenseStore } from '@/store/expenseStore';

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { loadExpenses } = useExpenseStore();

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'add-expense':
        return <ExpenseForm onSuccess={() => setActiveView('expenses')} />;
      case 'expenses':
        return <ExpenseList />;
      default:
        return <Dashboard />;
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
