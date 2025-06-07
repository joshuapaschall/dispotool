"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Home,
  Users,
  Building,
  DollarSign,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Target,
  User,
  LogOut,
  Eye,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navigation = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/dashboard",
    badge: null,
  },
  {
    title: "Campaigns",
    icon: Target,
    href: "/campaigns",
    badge: "3",
  },
  {
    title: "Buyers",
    icon: Users,
    href: "/",
    badge: "247",
  },
  {
    title: "Properties",
    icon: Building,
    href: "/properties",
    badge: "156",
  },
  {
    title: "Offers",
    icon: DollarSign,
    href: "/offers",
    badge: "23",
  },
  {
    title: "Calendar",
    icon: Calendar,
    href: "/calendar",
    badge: "5",
  },
  {
    title: "Reports",
    icon: BarChart3,
    href: "/reports",
    badge: null,
  },
]

const quickActions = [
  { label: "Add Buyer", icon: Users, href: "#add-buyer" },
  { label: "Add Property", icon: Building, href: "/properties/add" },
  { label: "Showings", icon: Eye, href: "/calendar/schedule" },
  { label: "Create Offer", icon: DollarSign, href: "/offers/create" },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  // Store collapsed state in localStorage
  useEffect(() => {
    const storedCollapsed = localStorage.getItem("sidebarCollapsed")
    if (storedCollapsed !== null) {
      setCollapsed(storedCollapsed === "true")
    }
  }, [])

  const toggleCollapsed = () => {
    const newCollapsed = !collapsed
    setCollapsed(newCollapsed)
    localStorage.setItem("sidebarCollapsed", String(newCollapsed))
  }

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-background transition-all duration-300 overflow-y-auto",
        collapsed ? "w-16" : "w-64",
        className,
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center border-b px-4 flex-shrink-0">
        {!collapsed ? (
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-indigo-600 flex items-center justify-center">
              <Home className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">DispoTool</h2>
              <p className="text-xs text-muted-foreground">Premier Realty</p>
            </div>
          </div>
        ) : (
          <div className="h-8 w-8 mx-auto rounded-md bg-indigo-600 flex items-center justify-center">
            <Home className="h-5 w-5 text-white" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("ml-auto", collapsed ? "mx-auto" : "")}
          onClick={toggleCollapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="p-4 flex-shrink-0">
        {!collapsed && <h3 className="text-sm font-semibold text-muted-foreground mb-3">Quick Actions</h3>}
        <div className={cn("grid gap-2", collapsed ? "grid-cols-1" : "grid-cols-2")}>
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "w-full h-16 flex flex-col items-center justify-center gap-1 text-center",
                  collapsed ? "h-12 p-2" : "p-3",
                )}
                title={action.label}
              >
                <action.icon className="h-4 w-4" />
                {!collapsed && <span className="text-xs leading-tight">{action.label}</span>}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-2 px-4 flex-1 overflow-y-auto">
        {!collapsed && <h3 className="text-sm font-semibold text-muted-foreground mb-3">Navigation</h3>}
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    collapsed ? "px-2" : "px-3",
                    isActive && "bg-muted font-medium",
                  )}
                  title={item.title}
                >
                  <item.icon className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-3")} />
                  {!collapsed && (
                    <>
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Recent Activity */}
      {!collapsed && (
        <div className="mt-auto p-4 border-t flex-shrink-0">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Recent Activity</h3>
          <div className="space-y-2">
            <div className="p-2 rounded-lg bg-muted/50 text-sm">
              <div className="font-medium">New buyer inquiry</div>
              <div className="text-muted-foreground text-xs">John Smith - 2 min ago</div>
            </div>
            <div className="p-2 rounded-lg bg-muted/50 text-sm">
              <div className="font-medium">Property showing scheduled</div>
              <div className="text-muted-foreground text-xs">123 Main St - 1 hour ago</div>
            </div>
          </div>
        </div>
      )}

      {/* User */}
      <div className="p-4 border-t flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start" title="User menu">
              <Avatar className={cn("h-8 w-8", collapsed ? "mx-auto" : "mr-3")}>
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 text-left">
                  <div className="font-medium">John Doe</div>
                  <div className="text-sm text-muted-foreground">Agent</div>
                </div>
              )}
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
      </div>
    </div>
  )
}
