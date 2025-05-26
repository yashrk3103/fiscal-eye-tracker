
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useExpenseStore } from '@/store/expenseStore';
import { Upload, Camera } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ExpenseFormProps {
  onSuccess?: () => void;
}

export const ExpenseForm = ({ onSuccess }: ExpenseFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [receipt, setReceipt] = useState<File | null>(null);
  const { addExpense } = useExpenseStore();

  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Other'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.amount || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const expense = {
      id: Date.now().toString(),
      title: formData.title,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
      description: formData.description,
      receiptUrl: receipt ? URL.createObjectURL(receipt) : undefined,
    };

    addExpense(expense);
    
    toast({
      title: "Success",
      description: "Expense added successfully!",
    });

    setFormData({
      title: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
    setReceipt(null);
    
    onSuccess?.();
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceipt(file);
      // Simulate OCR processing
      setTimeout(() => {
        toast({
          title: "Receipt Processed",
          description: "Receipt scanned successfully! You can edit the details if needed.",
        });
        // In a real app, this would parse the receipt and populate form fields
        setFormData(prev => ({
          ...prev,
          title: "Restaurant Bill", // Mock OCR result
          amount: "25.99", // Mock OCR result
          category: "Food & Dining"
        }));
      }, 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Expense</h1>
        <p className="text-gray-600">Track your spending with receipt scanning</p>
      </div>

      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Receipt Upload Section */}
            <div className="space-y-4">
              <Label>Receipt (Optional)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleReceiptUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="receipt-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-20 border-dashed border-2 hover:border-blue-400"
                    asChild
                  >
                    <label htmlFor="receipt-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                      <Upload className="h-6 w-6 text-gray-400" />
                      <span className="text-sm text-gray-600">Upload Receipt</span>
                    </label>
                  </Button>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  className="h-20 border-dashed border-2 hover:border-green-400"
                  onClick={() => toast({ title: "Camera", description: "Camera feature coming soon!" })}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Camera className="h-6 w-6 text-gray-400" />
                    <span className="text-sm text-gray-600">Take Photo</span>
                  </div>
                </Button>
              </div>
              
              {receipt && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    📷 Receipt uploaded: {receipt.name}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Processing with OCR... This may take a few seconds.
                  </p>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Lunch at cafe"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Additional notes about this expense..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              Add Expense
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
