
import { Menu, PlusCircle, BarChart3, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onMenuClick: () => void;
  activeView: string;
  onViewChange: (view: string) => void;
}

export const Header = ({ onMenuClick, activeView, onViewChange }: HeaderProps) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Receipt className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                ExpenseTracker
              </h1>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            <Button
              variant={activeView === 'dashboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('dashboard')}
              className="flex items-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>
            
            <Button
              variant={activeView === 'expenses' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('expenses')}
              className="flex items-center space-x-2"
            >
              <Receipt className="h-4 w-4" />
              <span>Expenses</span>
            </Button>
            
            <Button
              variant={activeView === 'add-expense' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('add-expense')}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add Expense</span>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};
