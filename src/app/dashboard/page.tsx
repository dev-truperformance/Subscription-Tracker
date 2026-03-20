'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { SubscriptionForm } from '@/components/subscription-form';
import { TeamSubscriptionChart } from '@/components/subscription-charts';
import { SubscriptionTracker } from '@/components/team-performance';
import { useSubscriptions } from '@/hooks/use-subscriptions';
import { useQueryClient } from '@tanstack/react-query';

export default function Dashboard() {
  const { data: subscriptions = [] } = useSubscriptions();
  const [period, setPeriod] = useState('12 months');
  const queryClient = useQueryClient();

  const handleSubscriptionSuccess = () => {
    // Force refresh of subscriptions data
    queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
  };

  return (
    <DashboardLayout>
      {/* Add New Subscription Card */}
      <SubscriptionForm onSuccess={handleSubscriptionSuccess} />

      {/* Charts Section */}
      <div className="flex-1 mt-[99px]">
        <TeamSubscriptionChart
          subscriptions={subscriptions}
          period={period}
          onPeriodChange={setPeriod}
        />
        <div className="mt-8">
          <SubscriptionTracker period={period} onPeriodChange={setPeriod} />
        </div>
      </div>
    </DashboardLayout>
  );
}
