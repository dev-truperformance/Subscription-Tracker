"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Home, FileText, BarChart3, Users, Settings, Bell, Plus, CreditCard } from "lucide-react"

const GridMenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 34 34" fill="none">
    <path d="M6.75684 0.975586C8.57843 0.975586 10.0614 2.45871 10.0615 4.28027C10.0615 6.10202 8.57931 7.58496 6.75684 7.58496C4.93448 7.58482 3.45215 6.10193 3.45215 4.28027C3.45229 2.45878 4.93525 0.975725 6.75684 0.975586Z" fill="#949494" stroke="#171717" strokeWidth="1.34211" />
    <path d="M17.3975 0.975586C19.2199 0.975586 20.703 2.4587 20.7031 4.28027C20.7031 6.10186 19.2194 7.58496 17.3975 7.58496C15.5759 7.58482 14.0928 6.10184 14.0928 4.28027C14.0929 2.4588 15.576 0.975724 17.3975 0.975586Z" fill="#949494" stroke="#171717" strokeWidth="1.34211" />
    <path d="M28.0381 0.975586C29.8606 0.975586 31.3426 2.45862 31.3428 4.28027C31.3428 6.10188 29.8595 7.58496 28.0381 7.58496C26.2167 7.58482 24.7334 6.10184 24.7334 4.28027C24.7335 2.45868 26.2156 0.975725 28.0381 0.975586Z" fill="#949494" stroke="#171717" strokeWidth="1.34211" />
    <path d="M6.65625 11.6123C8.47798 11.6123 9.96094 13.0959 9.96094 14.918C9.96075 16.7397 8.47796 18.2227 6.65625 18.2227C4.83447 18.2226 3.35078 16.7396 3.35059 14.918C3.35059 13.096 4.83446 11.6123 6.65625 11.6123Z" fill="#949494" stroke="#171717" strokeWidth="1.34211" />
    <path d="M17.2959 11.6123C19.1185 11.6123 20.6006 13.0957 20.6006 14.918C20.6004 16.7397 19.1172 18.2227 17.2959 18.2227C15.4744 18.2225 13.9914 16.7397 13.9912 14.918C13.9912 13.0958 15.4737 11.6124 17.2959 11.6123Z" fill="#949494" stroke="#171717" strokeWidth="1.34211" />
    <path d="M27.9375 11.6123C29.7601 11.6123 31.2422 13.0957 31.2422 14.918C31.242 16.7397 29.759 18.2227 27.9375 18.2227C26.116 18.2225 24.6328 16.7397 24.6328 14.918C24.6328 13.0958 26.1159 11.6124 27.9375 11.6123Z" fill="#949494" stroke="#171717" strokeWidth="1.34211" />
    <path d="M6.65625 22.249C8.47798 22.249 9.96094 23.7324 9.96094 25.5547C9.96075 27.3764 8.47796 28.8594 6.65625 28.8594C4.83447 28.8593 3.35078 27.3764 3.35059 25.5547C3.35059 23.7327 4.83446 22.249 6.65625 22.249Z" fill="#949494" stroke="#171717" strokeWidth="1.34211" />
    <path d="M17.2959 22.249C19.1185 22.249 20.6006 23.7324 20.6006 25.5547C20.6004 27.3764 19.1172 28.8594 17.2959 28.8594C15.4744 28.8592 13.9914 27.3764 13.9912 25.5547C13.9912 23.7325 15.4737 22.2491 17.2959 22.249Z" fill="#949494" stroke="#171717" strokeWidth="1.34211" />
    <path d="M27.9375 22.249C29.7601 22.249 31.2422 23.7324 31.2422 25.5547C31.242 27.3764 29.759 28.8594 27.9375 28.8594C26.116 28.8592 24.6328 27.3764 24.6328 25.5547C24.6328 23.7325 26.1159 22.2491 27.9375 22.249Z" fill="#949494" stroke="#171717" strokeWidth="1.34211" />
  </svg>
)

const LogoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 40 40" fill="none">
    <path d="M20 0C8.95431 0 0 8.95431 0 20C0 31.0457 8.95431 40 20 40C31.0457 40 40 31.0457 40 20C40 8.95431 31.0457 0 20 0Z" fill="#FF5A24" />
    <path d="M15 10H25V15H20V25H25V30H15V25H20V15H15V10Z" fill="white" />
  </svg>
)

interface SidebarProps {
  isCollapsed: boolean
}

export function Sidebar({ isCollapsed }: SidebarProps) {
  return (
    <div className={`bg-background border-r transition-all duration-300 ${isCollapsed ? "w-14" : "w-64"}`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4">
          {isCollapsed ? (
            <div className="flex justify-center">
              <LogoIcon />
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <LogoIcon />
              <span className="text-lg font-semibold">TruTracker</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <Button
              variant="ghost"
              className={`w-full justify-start ${isCollapsed ? "px-2" : "px-3"}`}
            >
              <Home className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Dashboard</span>}
            </Button>

            <Button
              variant="ghost"
              className={`w-full justify-start ${isCollapsed ? "px-2" : "px-3"}`}
            >
              <CreditCard className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Subscriptions</span>}
            </Button>

            <Button
              variant="ghost"
              className={`w-full justify-start ${isCollapsed ? "px-2" : "px-3"}`}
            >
              <FileText className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Reports</span>}
            </Button>

            <Button
              variant="ghost"
              className={`w-full justify-start ${isCollapsed ? "px-2" : "px-3"}`}
            >
              <BarChart3 className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Analytics</span>}
            </Button>

            <Button
              variant="ghost"
              className={`w-full justify-start ${isCollapsed ? "px-2" : "px-3"}`}
            >
              <Users className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Team</span>}
            </Button>

            <Button
              variant="ghost"
              className={`w-full justify-start ${isCollapsed ? "px-2" : "px-3"}`}
            >
              <Settings className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Settings</span>}
            </Button>

            <Button
              variant="ghost"
              className={`w-full justify-start ${isCollapsed ? "px-2" : "px-3"}`}
            >
              <Bell className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Notifications</span>}
            </Button>

            <Button
              variant="ghost"
              className={`w-full justify-start ${isCollapsed ? "px-2" : "px-3"}`}
            >
              <Plus className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Add New</span>}
            </Button>

            {isCollapsed && (
              <Button
                variant="ghost"
                className="w-full justify-center px-2"
              >
                <GridMenuIcon />
              </Button>
            )}
          </div>
        </nav>

        <Separator />

        {/* Footer */}
        <div className="p-4">
          <Button
            variant="ghost"
            className={`w-full ${isCollapsed ? "px-2" : "px-3"}`}
          >
            <GridMenuIcon />
            {!isCollapsed && <span className="ml-2">More</span>}
          </Button>
        </div>
      </div>
    </div>
  )
}
