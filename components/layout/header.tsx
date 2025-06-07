"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Bell, Search, Menu, MessageSquare, Phone, Mail } from "lucide-react"

interface HeaderProps {
  toggleSidebar: () => void
}

export function Header({ toggleSidebar }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Button variant="ghost" size="icon" className="mr-4 md:hidden" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>

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
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">3</Badge>
          </Button>
        </div>
      </div>
    </header>
  )
}
