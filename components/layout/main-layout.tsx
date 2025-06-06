"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenuLabel, // Declared here
} from "@/components/ui/sidebar"
import {
  Home,
  Users,
  Building,
  DollarSign,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  Bell,
  Search,
  Plus,
  MessageSquare,
  Phone,
  Mail,
  Target,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react"

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
  currentPage?: string
}

export default function MainLayout({ children, currentPage = "Dashboard" }: MainLayoutProps) {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar */}
        <Sidebar className="border-r">
          <SidebarHeader className="border-b p-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg">RealEstate CRM</h2>
                <p className="text-sm text-muted-foreground">Premier Realty</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-4">
            {/* Quick Actions */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-2">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.action}
                    variant="outline"
                    size="sm"
                    className="h-auto p-3 flex flex-col items-center space-y-1"
                  >
                    <action.icon className="h-4 w-4" />
                    <span className="text-xs">{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <SidebarMenu>
              <SidebarMenuLabel>Navigation</SidebarMenuLabel>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild>
                    <a href={item.href} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </div>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            {/* Recent Activity */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-2">Recent Activity</h3>
              <div className="space-y-2">
                <div className="p-2 rounded-lg bg-muted/50 text-sm">
                  <div className="font-medium">New buyer inquiry</div>
                  <div className="text-muted-foreground text-xs">John Smith - 2 min ago</div>
                </div>
                <div className="p-2 rounded-lg bg-muted/50 text-sm">
                  <div className="font-medium">Property showing scheduled</div>
                  <div className="text-muted-foreground text-xs">123 Main St - 1 hour ago</div>
                </div>
                <div className="p-2 rounded-lg bg-muted/50 text-sm">
                  <div className="font-medium">Deal closed</div>
                  <div className="text-muted-foreground text-xs">$450K - 3 hours ago</div>
                </div>
              </div>
            </div>
          </SidebarContent>

          <SidebarFooter className="border-t p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <div className="font-medium">John Doe</div>
                    <div className="text-sm text-muted-foreground">Agent</div>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center px-6">
              <SidebarTrigger className="mr-4" />

              <div className="flex-1 flex items-center space-x-4">
                {/* Search */}
                <div className="relative max-w-md flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search buyers, properties, deals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Quick Stats */}
                <div className="hidden lg:flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">$2.4M</div>
                    <div className="text-xs text-muted-foreground">This Month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">23</div>
                    <div className="text-xs text-muted-foreground">Active Deals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">89%</div>
                    <div className="text-xs text-muted-foreground">Close Rate</div>
                  </div>
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Mail className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    3
                  </Badge>
                </Button>
                <Button className="ml-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New
                </Button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
