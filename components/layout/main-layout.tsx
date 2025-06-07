"use client"

import type React from "react"
import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Home, Users, Building, DollarSign, Calendar, FileText, BarChart3, Target } from "lucide-react"

const navigation = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/dashboard",
    badge: null,
  },
  {
    title: "Buyers",
    icon: Users,
    href: "/buyers",
    badge: "247",
  },
  {
    title: "Sellers",
    icon: Building,
    href: "/sellers",
    badge: "89",
  },
  {
    title: "Properties",
    icon: Home,
    href: "/properties",
    badge: "156",
  },
  {
    title: "Deals",
    icon: DollarSign,
    href: "/deals",
    badge: "23",
  },
  {
    title: "Calendar",
    icon: Calendar,
    href: "/calendar",
    badge: "5",
  },
  {
    title: "Campaigns",
    icon: Target,
    href: "/campaigns",
    badge: null,
  },
  {
    title: "Documents",
    icon: FileText,
    href: "/documents",
    badge: null,
  },
  {
    title: "Reports",
    icon: BarChart3,
    href: "/reports",
    badge: null,
  },
]

const quickActions = [
  { label: "Add Buyer", icon: Users, action: "add-buyer" },
  { label: "Add Property", icon: Building, action: "add-property" },
  { label: "Create Deal", icon: DollarSign, action: "create-deal" },
  { label: "Schedule Showing", icon: Calendar, action: "schedule-showing" },
]

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - can be collapsed */}
      <div className={`${sidebarOpen ? "block" : "hidden"} md:block`}>
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
