
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  description?: string;
  receiptUrl?: string;
}

interface ExpenseStore {
  expenses: Expense[];
  addExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  loadExpenses: () => void;
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set, get) => ({
      expenses: [],
      
      addExpense: (expense) => {
        set((state) => ({
          expenses: [expense, ...state.expenses],
        }));
      },
      
      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id),
        }));
      },
      
      updateExpense: (id, updatedExpense) => {
        set((state) => ({
          expenses: state.expenses.map((expense) =>
            expense.id === id ? { ...expense, ...updatedExpense } : expense
          ),
        }));
      },
      
      loadExpenses: () => {
        // Add some sample data if no expenses exist
        const currentExpenses = get().expenses;
        if (currentExpenses.length === 0) {
          const sampleExpenses: Expense[] = [
            {
              id: '1',
              title: 'Grocery Shopping',
              amount: 85.50,
              category: 'Food & Dining',
              date: '2024-01-15',
              description: 'Weekly groceries at supermarket',
            },
            {
              id: '2',
              title: 'Gas Station',
              amount: 45.00,
              category: 'Transportation',
              date: '2024-01-14',
              description: 'Fuel for car',
            },
            {
              id: '3',
              title: 'Netflix Subscription',
              amount: 15.99,
              category: 'Entertainment',
              date: '2024-01-13',
              description: 'Monthly streaming subscription',
            },
            {
              id: '4',
              title: 'Coffee Shop',
              amount: 12.50,
              category: 'Food & Dining',
              date: '2024-01-12',
              description: 'Coffee and pastry',
            },
            {
              id: '5',
              title: 'Online Course',
              amount: 99.00,
              category: 'Education',
              date: '2024-01-10',
              description: 'Web development course',
            },
          ];
          
          set({ expenses: sampleExpenses });
        }
      },
    }),
    {
      name: 'expense-storage',
    }
  )
);
