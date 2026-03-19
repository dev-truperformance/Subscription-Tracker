"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { useClerk } from "@clerk/nextjs"
import { LogOut } from "lucide-react"
import { useUserData } from "@/hooks/use-user-data"

interface DashboardLayoutProps {
  children: React.ReactNode;
  isSidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
}

export function DashboardLayout({ children, isSidebarCollapsed = true, onSidebarToggle }: DashboardLayoutProps) {
  const { user, isLoaded } = useUserData();
  const { signOut } = useClerk();

  useEffect(() => {
    console.log("Dashboard page loaded");
    console.log("User data loaded:", isLoaded);
    console.log("User:", user);
  }, [user, isLoaded]);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar isCollapsed={isSidebarCollapsed} />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto p-[33px]">
          <div className="w-full space-y-6">
            {/* Logo Section */}
            <div className="flex justify-between items-center mb-8">
              <img
                src="/logo.png"
                alt="Tru Subscription Tracker Logo"
                className="w-[261.386px] h-[60.359px]"
              />
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button
                  onClick={() => signOut({ redirectUrl: '/' })}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
