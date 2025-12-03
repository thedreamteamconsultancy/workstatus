import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Transaction, TransactionType, TransactionCategory } from '@/types';

interface EditTransactionModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: { type: TransactionType; category: string; amount: number; description: string }) => void;
  categories: TransactionCategory[];
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({ 
  transaction,
  isOpen, 
  onClose, 
  onSubmit,
  categories 
}) => {
  const [type, setType] = useState<TransactionType>('income');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  // Populate form when transaction changes
  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(transaction.amount.toString());
      setDescription(transaction.description || '');
      
      // Check if category exists in categories list
      const existingCategory = categories.find(c => c.name === transaction.category);
      if (existingCategory) {
        setCategory(transaction.category);
        setShowCustomCategory(false);
        setCustomCategory('');
      } else {
        setShowCustomCategory(true);
        setCustomCategory(transaction.category);
        setCategory('');
      }
    }
  }, [transaction, categories]);

  const handleCategoryChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomCategory(true);
      setCategory('');
    } else {
      setShowCustomCategory(false);
      setCategory(value);
      setCustomCategory('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction) return;
    
    setLoading(true);
    
    try {
      const finalCategory = showCustomCategory ? customCategory : category;
      
      if (!finalCategory || !amount || Number(amount) <= 0) {
        throw new Error('Please fill all required fields');
      }
      
      await onSubmit(transaction.id, {
        type,
        category: finalCategory,
        amount: Number(amount),
        description,
      });
      
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!transaction) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 bg-background/80 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md my-4 sm:my-8"
          >
            <Card variant="elevated" className="border-primary/20 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <CardHeader className="relative p-4 sm:p-6">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 sm:right-4 top-2 sm:top-4"
                  onClick={onClose}
                >
                  <X className="w-5 h-5" />
                </Button>
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-soft ${
                  type === 'income' ? 'bg-success/20' : 'bg-destructive/20'
                }`}>
                  <Pencil className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                </div>
                <CardTitle className="text-xl sm:text-2xl">Edit Transaction</CardTitle>
                <p className="text-sm sm:text-base text-muted-foreground">Update transaction details</p>
              </CardHeader>
              
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Transaction Type */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={type === 'income' ? 'default' : 'outline'}
                      className={`flex-1 text-sm sm:text-base ${type === 'income' ? 'bg-success hover:bg-success/90' : ''}`}
                      onClick={() => setType('income')}
                    >
                      <TrendingUp className="w-4 h-4 mr-1 sm:mr-2" />
                      Income
                    </Button>
                    <Button
                      type="button"
                      variant={type === 'expense' ? 'default' : 'outline'}
                      className={`flex-1 text-sm sm:text-base ${type === 'expense' ? 'bg-destructive hover:bg-destructive/90' : ''}`}
                      onClick={() => setType('expense')}
                    >
                      <TrendingDown className="w-4 h-4 mr-1 sm:mr-2" />
                      Expense
                    </Button>
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label className="text-sm">Category</Label>
                    <Select onValueChange={handleCategoryChange} value={showCustomCategory ? 'custom' : category}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">
                          <span className="flex items-center gap-1">
                            <Plus className="w-3 h-3" />
                            Custom Category
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Custom Category Input */}
                  {showCustomCategory && (
                    <div className="space-y-2">
                      <Label htmlFor="edit-customCategory" className="text-sm">Custom Category Name</Label>
                      <Input
                        id="edit-customCategory"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Enter category name"
                        required
                      />
                    </div>
                  )}

                  {/* Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-amount" className="text-sm">Amount (₹)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                      <Input
                        id="edit-amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pl-8"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-description" className="text-sm">Description (Optional)</Label>
                    <Textarea
                      id="edit-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add notes about this transaction..."
                      rows={3}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1 order-2 sm:order-1">
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      variant="gradient"
                      className="flex-1 order-1 sm:order-2"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
