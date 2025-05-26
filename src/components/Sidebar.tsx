
import { BarChart3, Receipt, PlusCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen: boolean;
  activeView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar = ({ isOpen, activeView, onViewChange }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'expenses', label: 'All Expenses', icon: Receipt },
    { id: 'add-expense', label: 'Add Expense', icon: PlusCircle },
  ];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => onViewChange(activeView)} />
      
      <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-50 md:hidden">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Menu</h2>
            <Button variant="ghost" size="sm" onClick={() => onViewChange(activeView)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeView === item.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange(item.id)}
              className="w-full justify-start space-x-2"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Button>
          ))}
        </nav>
      </aside>
    </>
  );
};
