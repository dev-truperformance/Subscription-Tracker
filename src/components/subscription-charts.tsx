"use client"

import React, { useState, useMemo } from "react"

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface Subscription {
  id: number;
  name: string;
  email: string;
  functions: string;
  payment: string;
  dueDate: string;
  frequency: string;
}

interface TeamSubscriptionChartProps {
  subscriptions: Subscription[];
  period: string;
  onPeriodChange: (period: string) => void;
}

export function TeamSubscriptionChart({ subscriptions, period, onPeriodChange }: TeamSubscriptionChartProps) {
  const timePeriods = ["12 months", "30 days", "7 days", "24 hours"]

  // Process subscription data to group by functions and sum payments
  const chartData = useMemo(() => {
    const groupedData: Record<string, number> = {};

    // Filter subscriptions based on period first
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to start of day to include today
    let cutoffDate = new Date();

    switch (period) {
      case "30 days":
        cutoffDate.setDate(now.getDate() + 30);
        break;
      case "7 days":
        cutoffDate.setDate(now.getDate() + 7);
        break;
      case "24 hours":
        cutoffDate.setHours(now.getHours() + 24);
        break;
      case "12 months":
      default:
        cutoffDate.setFullYear(now.getFullYear() + 1);
        break;
    }

    const filteredSubscriptions = subscriptions.filter(sub => {
      const subDate = new Date(sub.dueDate);
      subDate.setHours(0, 0, 0, 0); // Set to start of day for comparison
      return subDate <= cutoffDate && subDate >= now;
    });

    filteredSubscriptions.forEach(sub => {
      const category = sub.functions || 'Other';
      // Extract numeric value from payment string like "USD 20"
      const numberMatch = sub.payment.match(/[\d.,]+/);
      if (numberMatch) {
        const num = parseFloat(numberMatch[0].replace(',', ''));
        if (!isNaN(num)) {
          groupedData[category] = (groupedData[category] || 0) + num;
        }
      }
    });

    // Convert to array format for recharts
    return Object.entries(groupedData).map(([name, value]) => ({
      name,
      value: Math.round(value)
    }));
  }, [subscriptions, period]);

  // Calculate total expenses
  const totalExpenses = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  return (
    <>
      <style jsx>{`
        .recharts-bar-rectangle:hover {
          filter: brightness(1.2) !important;
        }
        .recharts-tooltip-wrapper {
          background: rgba(0, 0, 0, 0.8) !important;
          border: none !important;
          border-radius: 4px !important;
        }
        .recharts-tooltip-label,
        .recharts-tooltip-item {
          color: white !important;
        }
      `}</style>
      <Card className="bg-card border rounded-[12px] shadow-sm py-[36px] px-[26px]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-card-foreground text-xl mb-[15px]">
            Team Subscription Count
          </CardTitle>
        </CardHeader>

        <CardContent className="bg-card p-6 rounded-xl">
          {/* Filters */}
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-card-foreground text-lg">Team-wise Subscription Count</h3>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              {timePeriods.map((timePeriod) => (
                <span
                  key={timePeriod}
                  onClick={() => onPeriodChange(timePeriod)}
                  className={`cursor-pointer transition-colors duration-200 ${period === timePeriod
                    ? "text-card-foreground font-medium"
                    : "text-muted-foreground hover:text-card-foreground"
                    }`}
                >
                  {timePeriod}
                </span>
              ))}
            </div>

            {/* Amount */}
            <div className="w-fit border border-border px-3 py-1 rounded-md text-card-foreground text-sm">
              $ {totalExpenses.toLocaleString()}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid stroke="var(--border)" vertical={false} />

              <XAxis
                dataKey="name"
                stroke="var(--muted)"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />

              <YAxis
                stroke="var(--muted)"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  border: "none",
                  borderRadius: "4px",
                  color: "#fff",
                  boxShadow: "none",
                }}
                labelStyle={{ color: "#fff" }}
                itemStyle={{ color: "#fff" }}
                formatter={(value) => [`$${value}`, "Subscription Cost"]}
              />

              {/* Single Bar */}
              <Bar
                dataKey="value"
                fill="var(--primary)"
                radius={[4, 4, 0, 0]}
                style={{
                  filter: 'brightness(1.1)',
                  transition: 'filter 0.2s ease'
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  )
}
