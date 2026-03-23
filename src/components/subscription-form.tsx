'use client';

import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useCreateSubscription } from '@/hooks/use-subscriptions';
import { useFormik } from 'formik';
import { Calendar as CalendarIcon } from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import * as Yup from 'yup';

// Yup validation schema
const subscriptionSchema = Yup.object().shape({
  name: Yup.string()
    .required('Product/Subscription name is required')
    .trim('Product/Subscription name cannot be just whitespace'),
  email: Yup.string()
    .required('Subscription email is required')
    .email('Please enter a valid email address')
    .trim('Email cannot be just whitespace'),
  functions: Yup.string()
    .required('Functions is required')
    .trim('Functions cannot be just whitespace'),
  frequency: Yup.string()
    .required('Subscription frequency is required')
    .oneOf(
      ['monthly', 'yearly', 'quarterly', 'weekly'],
      'Please select a valid frequency'
    ),
  payment: Yup.string()
    .required('Price is required')
    .test(
      'is-valid-payment',
      'Please enter a valid price greater than 0',
      (value) => {
        if (!value) return false;
        // Extract number from string like "USD 20" or "€25"
        const numberMatch = value.match(/[\d.,]+/);
        if (!numberMatch) return false;
        const num = parseFloat(numberMatch[0].replace(',', ''));
        return !isNaN(num) && num > 0;
      }
    ),
});

function formatDate(date: Date | undefined) {
  if (!date) {
    return '';
  }

  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function DatePickerInput({
  dueDate,
  setDueDate,
}: {
  dueDate: Date | undefined;
  setDueDate: (date: Date | undefined) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState<Date | undefined>(dueDate);
  const [value, setValue] = React.useState(formatDate(dueDate));

  return (
    <div className="w-full">
      <div className="flex h-[44px] w-full items-center rounded-[8.831px] border bg-background shadow-sm overflow-hidden dark:bg-[#222] dark:border-[#474747] dark:shadow-[0_1.656px_4.415px_-1.104px_rgba(10,9,11,0.07)]">
        {/* Input */}
        <input
          value={value}
          placeholder="June 01, 2025"
          onChange={(e) => {
            const date = new Date(e.target.value);
            setValue(e.target.value);
            if (!isNaN(date.getTime())) {
              setDueDate(date);
              setMonth(date);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setOpen(true);
            }
          }}
          className="flex-1 h-full bg-transparent px-3 text-foreground placeholder:text-muted-foreground outline-none dark:text-white dark:placeholder:text-gray-400"
        />

        {/* Icon */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger className="h-full px-3 flex items-center justify-center text-foreground dark:text-white">
            <CalendarIcon size={18} />
          </PopoverTrigger>
          <PopoverContent
            className="w-full max-w-none p-0 overflow-hidden"
            align="start"
          >
            <Calendar
              className="w-full [&_.rdp-day]:w-10 [&_.rdp-day]:h-10"
              mode="single"
              selected={dueDate}
              month={month}
              onMonthChange={setMonth}
              onSelect={(date) => {
                setDueDate(date);
                setValue(formatDate(date));
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

interface SubscriptionFormProps {
  onSuccess?: () => void;
}

export function SubscriptionForm({ onSuccess }: SubscriptionFormProps) {
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date());
  const createSubscription = useCreateSubscription();

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      functions: '',
      payment: '',
      frequency: '',
    },
    validationSchema: subscriptionSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        setSubmitting(true);

        const currencySelect = document.querySelector(
          '[data-currency-select]'
        ) as HTMLSelectElement;
        const currency = currencySelect?.value || 'USD';

        const subscriptionData = {
          name: values.name,
          email: values.email,
          functions: values.functions,
          payment: `${currency} ${values.payment}`,
          frequency: values.frequency,
          dueDate: dueDate ? dueDate.toISOString() : null,
        };

        console.log('Submitting subscription data:', subscriptionData);
        await createSubscription.mutateAsync(subscriptionData);

        resetForm();
        toast.success('Subscription added successfully!');
        onSuccess?.();

        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error('Error submitting form:', error);
        toast.error(
          error instanceof Error
            ? error.message
            : 'An error occurred while adding subscription'
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Card className="px-[26px] py-[36px]">
      <CardHeader>
        <CardTitle className="text-[22px] font-bold">
          Add New Subscription
        </CardTitle>
      </CardHeader>
      <Separator className="my-[15px]" />
      <CardContent className="space-y-4">
        <form onSubmit={formik.handleSubmit}>
          <div className="grid grid-cols-3 gap-[32px]">
            {/* Row 1 */}
            <div className="space-y-2">
              <Label htmlFor="subscription-name" className="text-[16px]">
                Product/Subscription Name:
                <span className="text-red-500">*</span>
              </Label>
              <Input
                className={`h-[44px] rounded-[8.831px] border bg-background shadow-sm text-foreground placeholder:text-muted-foreground dark:bg-[#222] dark:border-[#474747] dark:shadow-[0_1.656px_4.415px_-1.104px_rgba(10,9,11,0.07)] dark:text-white dark:placeholder:text-gray-400 ${formik.errors.name ? 'border-red-500' : ''}`}
                id="subscription-name"
                name="name"
                placeholder="Enter subscription name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.errors.name && formik.touched.name && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.name}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="functions" className="text-[16px]">
                Functions:<span className="text-red-500">*</span>
              </Label>
              <Select
                value={formik.values.functions}
                onValueChange={(value) =>
                  value && formik.setFieldValue('functions', value)
                }
              >
                <SelectTrigger
                  className={`!h-[44px] !min-h-[44px] px-3 py-0 flex items-center justify-between w-full rounded-[8.831px] border bg-background shadow-sm text-foreground dark:bg-[#222] dark:border-[#474747] dark:shadow-[0_1.656px_4.415px_-1.104px_rgba(10,9,11,0.07)] dark:text-white ${formik.errors.functions ? 'border-red-500' : ''}`}
                >
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
              {formik.errors.functions && formik.touched.functions && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.functions}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency" className="text-[16px]">
                Subscription Frequency:<span className="text-red-500">*</span>
              </Label>
              <Select
                value={formik.values.frequency}
                onValueChange={(value) =>
                  value && formik.setFieldValue('frequency', value)
                }
              >
                <SelectTrigger
                  className={`!h-[44px] !min-h-[44px] px-3 py-0 flex items-center justify-between w-full rounded-[8.831px] border bg-background shadow-sm text-foreground dark:bg-[#222] dark:border-[#474747] dark:shadow-[0_1.656px_4.415px_-1.104px_rgba(10,9,11,0.07)] dark:text-white ${formik.errors.frequency ? 'border-red-500' : ''}`}
                >
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
              {formik.errors.frequency && formik.touched.frequency && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.frequency}
                </p>
              )}
            </div>

            {/* Row 2 */}
            <div className="space-y-2">
              <Label htmlFor="subscription-email" className="text-[16px]">
                Subscription Email:<span className="text-red-500">*</span>
              </Label>
              <Input
                className={`h-[44px] rounded-[8.831px] border bg-background shadow-sm text-foreground placeholder:text-muted-foreground dark:bg-[#222] dark:border-[#474747] dark:shadow-[0_1.656px_4.415px_-1.104px_rgba(10,9,11,0.07)] dark:text-white dark:placeholder:text-gray-400 ${formik.errors.email ? 'border-red-500' : ''}`}
                id="subscription-email"
                name="email"
                type="email"
                placeholder="email@example.com"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.errors.email && formik.touched.email && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.email}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price" className="text-[16px]">
                Price<span className="text-red-500">*</span>
              </Label>
              <div className="flex">
                <Select>
                  <SelectTrigger
                    className="!h-[44px] !min-h-[44px] px-3 py-0 flex items-center justify-between w-[120px] rounded-r-none border-r-0 bg-background border shadow-sm text-foreground dark:bg-[#222] dark:border-[#474747] dark:shadow-[0_1.656px_4.415px_-1.104px_rgba(10,9,11,0.07)] dark:text-white"
                    data-currency-select
                  >
                    <SelectValue placeholder="USD" />
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
                <Input
                  className={`!h-[44px] !min-h-[44px] px-3 py-0 flex items-center flex-1 rounded-l-none bg-background border shadow-sm text-foreground placeholder:text-muted-foreground dark:bg-[#222] dark:border-[#474747] dark:shadow-[0_1.656px_4.415px_-1.104px_rgba(10,9,11,0.07)] dark:text-white dark:placeholder:text-gray-400 ${formik.errors.payment ? 'border-red-500' : ''}`}
                  id="price"
                  name="payment"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  value={formik.values.payment}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
              {formik.errors.payment && formik.touched.payment && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.payment}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="due-dates" className="text-[16px]">
                Due Dates
              </Label>
              <DatePickerInput dueDate={dueDate} setDueDate={setDueDate} />
            </div>

            {/* Row 3 */}
            <div className="space-y-2 col-span-3">
              <button
                type="submit"
                disabled={formik.isSubmitting || createSubscription.isPending}
                className="group relative flex items-center justify-between w-[260px] h-[56px] px-6 rounded-full bg-background overflow-hidden dark:bg-[#222] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* Loading spinner */}
                {(formik.isSubmitting || createSubscription.isPending) && (
                  <svg
                    className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 12v8m0 0l6-6m-6 6H6"
                    />
                  </svg>
                )}

                {/* Orange circle (same height as button) */}
                <span
                  className={`absolute left-0 top-0 h-full w-[56px] bg-[#FF5A24] rounded-full transition-all duration-500 ease-in-out
                ${formik.isSubmitting || createSubscription.isPending ? 'w-[56px]' : 'group-hover:w-full'} group-hover:rounded-full`}
                ></span>

                {/* Text */}
                <span className="relative z-10 text-foreground text-lg font-medium dark:text-white">
                  {formik.isSubmitting || createSubscription.isPending
                    ? 'Adding...'
                    : 'Add Subscription'}
                </span>

                {/* Arrow - hide during loading */}
                {!(formik.isSubmitting || createSubscription.isPending) && (
                  <svg
                    className="relative z-10 text-foreground transition-transform duration-300 group-hover:translate-x-1 dark:text-white"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
