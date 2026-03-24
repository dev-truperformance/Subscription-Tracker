'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Subscription } from '@/hooks/use-subscriptions';
import { useState } from 'react';
import { toast } from 'sonner';

interface UpdateSubscriptionModalProps {
  subscription: Subscription | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: any) => void;
  isLoading?: boolean;
}

export function UpdateSubscriptionModal({
  subscription,
  isOpen,
  onClose,
  onUpdate,
  isLoading = false,
}: UpdateSubscriptionModalProps) {
  // Derive form data from subscription instead of using useEffect
  const getInitialFormData = () => {
    if (!subscription) {
      return {
        name: '',
        email: '',
        functions: '',
        payment: '',
        currency: 'USD',
        frequency: '',
        dueDate: '',
      };
    }

    let currency = 'USD';
    let paymentAmount = '';

    if (subscription.payment) {
      const paymentParts = subscription.payment.split(' ');
      if (paymentParts.length >= 2) {
        currency = paymentParts[0];
        paymentAmount = paymentParts.slice(1).join(' ');
      } else {
        paymentAmount = subscription.payment;
      }
    }

    // Format due date safely
    let formattedDueDate = '';
    if (subscription.dueDate) {
      try {
        formattedDueDate = new Date(subscription.dueDate)
          .toISOString()
          .split('T')[0];
      } catch {
        formattedDueDate = '';
      }
    }

    return {
      name: subscription.name || '',
      email: subscription.email || '',
      functions: subscription.functions || '',
      payment: paymentAmount,
      currency: currency,
      frequency: subscription.frequency || '',
      dueDate: formattedDueDate,
    };
  };

  const [formData, setFormData] = useState(getInitialFormData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate and convert due date
    let dueDateForAPI = null;
    if (formData.dueDate) {
      try {
        const dateObj = new Date(formData.dueDate);
        // Check if the date is valid
        if (isNaN(dateObj.getTime())) {
          console.error('Invalid date:', formData.dueDate);
          toast.error('Invalid due date selected');
          return;
        }
        dueDateForAPI = dateObj; // Send as Date object for Drizzle ORM
        console.log('Valid date converted:', dueDateForAPI);
      } catch (error) {
        console.error('Date conversion error:', error);
        toast.error('Error processing due date');
        return;
      }
    }

    // Combine currency and payment for the API
    const updatedData = {
      name: formData.name,
      email: formData.email,
      functions: formData.functions,
      payment: `${formData.currency} ${formData.payment}`,
      frequency: formData.frequency,
      dueDate: dueDateForAPI,
    };

    // Debug logging
    console.log('Form data being sent:', updatedData);
    console.log('Due date value:', formData.dueDate);
    console.log('Due date type:', typeof formData.dueDate);
    console.log('Converted due date:', dueDateForAPI);
    console.log('Converted due date type:', typeof dueDateForAPI);

    onUpdate(updatedData);
  };

  const handleChange = (field: string, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value || '' }));
  };

  return (
    <Dialog key={subscription?.id} open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Subscription</DialogTitle>
          <DialogDescription>
            Make changes to your subscription here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="functions" className="text-right">
                Functions
              </Label>
              <Select
                value={formData.functions || ''}
                onValueChange={(value) => handleChange('functions', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select function" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SEO">SEO</SelectItem>
                  <SelectItem value="Development">Development</SelectItem>
                  <SelectItem value="PPC">PPC</SelectItem>
                  <SelectItem value="Life Cycle">Life Cycle</SelectItem>
                  <SelectItem value="Business Dev">Business Dev</SelectItem>
                  <SelectItem value="QA/QC">QA/QC</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Lead Gen">Lead Gen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currency" className="text-right">
                Currency
              </Label>
              <Select
                value={formData.currency || 'USD'}
                onValueChange={(value) => handleChange('currency', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="JPY">JPY</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                  <SelectItem value="AUD">AUD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payment" className="text-right">
                Payment
              </Label>
              <Input
                id="payment"
                type="number"
                step="0.01"
                value={formData.payment}
                onChange={(e) => handleChange('payment', e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="frequency" className="text-right">
                Frequency
              </Label>
              <Select
                value={formData.frequency || ''}
                onValueChange={(value) => handleChange('frequency', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
