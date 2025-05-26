
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Tesseract from 'tesseract.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Camera, Upload, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ScannedData {
  amount: string;
  merchant: string;
  date: string;
  items: string[];
}

interface ReceiptScannerProps {
  onExpenseAdded: () => void;
}

export const ReceiptScanner: React.FC<ReceiptScannerProps> = ({ onExpenseAdded }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<ScannedData | null>(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  React.useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (data) {
      setCategories(data);
    }
  };

  const extractDataFromText = (text: string): ScannedData => {
    const lines = text.split('\n').filter(line => line.trim());
    
    // Extract amount (look for currency symbols and numbers)
    const amountRegex = /[\$€£¥]?\s*(\d+\.?\d*)/g;
    const amounts = [];
    let match;
    while ((match = amountRegex.exec(text)) !== null) {
      amounts.push(parseFloat(match[1]));
    }
    const totalAmount = amounts.length > 0 ? Math.max(...amounts).toString() : '';

    // Extract date
    const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/;
    const dateMatch = text.match(dateRegex);
    const extractedDate = dateMatch ? dateMatch[1] : '';

    // Extract merchant (usually the first line or line with most capitals)
    const merchant = lines.find(line => 
      line.length > 3 && 
      line.toUpperCase() === line && 
      !/^\d+$/.test(line)
    ) || lines[0] || '';

    // Extract items (lines that might be products)
    const items = lines.filter(line => 
      line.length > 2 && 
      !line.match(/^\d+$/) && 
      !line.match(/^[\$€£¥]/) &&
      line !== merchant
    );

    return {
      amount: totalAmount,
      merchant: merchant.trim(),
      date: extractedDate,
      items: items.slice(0, 5) // Limit to 5 items
    };
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setReceiptFile(file);
    setIsScanning(true);

    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng', {
        logger: m => console.log(m)
      });

      const extractedData = extractDataFromText(text);
      setScannedData(extractedData);
      
      // Auto-fill form with extracted data
      setTitle(extractedData.merchant || 'Receipt');
      setAmount(extractedData.amount);
      setDescription(extractedData.items.join(', '));
      
      if (extractedData.date) {
        try {
          const parsedDate = new Date(extractedData.date);
          if (!isNaN(parsedDate.getTime())) {
            setDate(parsedDate.toISOString().split('T')[0]);
          }
        } catch (e) {
          console.log('Could not parse date:', extractedData.date);
        }
      }

      toast({
        title: 'Receipt scanned successfully!',
        description: 'Data extracted and filled in the form. Please review and submit.',
      });
    } catch (error) {
      console.error('OCR Error:', error);
      toast({
        title: 'Scanning failed',
        description: 'Could not extract data from the receipt. Please enter manually.',
        variant: 'destructive',
      });
    } finally {
      setIsScanning(false);
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp']
    },
    multiple: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to add expenses.',
        variant: 'destructive',
      });
      return;
    }

    try {
      let receiptUrl = null;
      
      // Upload receipt image if available
      if (receiptFile) {
        const fileExt = receiptFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `receipts/${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(filePath, receiptFile);

        if (!uploadError) {
          const { data } = supabase.storage
            .from('receipts')
            .getPublicUrl(filePath);
          receiptUrl = data.publicUrl;
        }
      }

      // Insert expense into database
      const { error } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          title,
          amount: parseFloat(amount),
          category,
          date,
          description,
          receipt_url: receiptUrl,
          receipt_data: scannedData
        });

      if (error) {
        throw error;
      }

      toast({
        title: 'Success',
        description: 'Expense added successfully!',
      });

      // Reset form
      setTitle('');
      setAmount('');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setReceiptFile(null);
      setScannedData(null);
      
      onExpenseAdded();
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to add expense. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Add Expense with Receipt Scanner
        </CardTitle>
        <CardDescription>
          Upload a receipt image to automatically extract expense details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          {isScanning ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-sm text-gray-600">Scanning receipt...</p>
            </div>
          ) : scannedData ? (
            <div className="flex flex-col items-center space-y-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <p className="text-sm text-green-600">Receipt scanned successfully!</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-600">
                {isDragActive 
                  ? 'Drop the receipt image here...' 
                  : 'Drag & drop a receipt image, or click to select'
                }
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Expense title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description or items..."
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
  );
};
