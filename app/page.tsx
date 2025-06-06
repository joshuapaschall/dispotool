"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { TooltipProvider } from "@/components/ui/tooltip"
import { supabase } from "@/lib/supabase"
import type { Buyer, Tag, Group } from "@/lib/supabase"
import ImportBuyersModal from "@/components/buyers/import-buyers-modal"
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Star,
  Mail,
  MessageSquare,
  Phone,
  MoreHorizontal,
  FileUp,
  Crown,
  Zap,
  DollarSign,
  Users,
  TrendingUp,
  CheckCircle,
  Filter,
  X,
  FolderOpen,
  Folder,
  Target,
  Edit,
  Loader2,
  MapPin,
} from "lucide-react"

import TagFilterSelector from "@/components/buyers/tag-filter-selector"
import LocationFilterSelector from "@/components/buyers/location-filter-selector"

// Smart groups structure
const smartGroupsStructure = [
  {
    id: "priority",
    name: "Priority Segments",
    icon: Crown,
    isExpanded: true,
    groups: [
      { id: "vip", name: "VIP Clients", icon: Crown, color: "text-amber-600" },
      { id: "hot", name: "Hot Leads", icon: Zap, color: "text-red-600" },
      { id: "high-value", name: "High Value Buyers", icon: DollarSign, color: "text-green-600" },
    ],
  },
  {
    id: "buyer-types",
    name: "Buyer Types",
    icon: Users,
    isExpanded: true,
    groups: [
      { id: "investor", name: "Investors", icon: TrendingUp, color: "text-purple-600" },
      { id: "cash-buyer", name: "Cash Buyers", icon: DollarSign, color: "text-emerald-600" },
      { id: "wholesaler", name: "Wholesalers", icon: Users, color: "text-blue-600" },
    ],
  },
  {
    id: "engagement",
    name: "Engagement Status",
    icon: MessageSquare,
    isExpanded: false,
    groups: [
      { id: "email-engaged", name: "Email Engaged", icon: Mail, color: "text-blue-500" },
      { id: "follow-up", name: "Need Follow-up", icon: CheckCircle, color: "text-orange-600" },
      { id: "cold", name: "Cold Leads", icon: TrendingUp, color: "text-gray-500" },
    ],
  },
]

const quickFilters = [
  { label: "VIP", key: "vip", active: false },
  { label: "Hot Leads", key: "hot", active: false },
  { label: "New This Week", key: "new", active: false },
  { label: "High Score", key: "highScore", active: false },
  { label: "Needs Follow-up", key: "followup", active: false },
]

export default function BuyersPage() {
  // State for real data
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // UI state
  const [selectedBuyers, setSelectedBuyers] = useState<string[]>([])
  const [allSelected, setAllSelected] = useState(false)
  const [compactView, setCompactView] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>([])
  const [expandedFolders, setExpandedFolders] = useState<string[]>(["priority", "buyer-types"])
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)

  // Active filters state
  const [filters, setFilters] = useState({
    search: "",
    selectedTags: [] as string[],
    excludedTags: [] as string[],
    selectedLocations: [] as string[],
    propertyTypes: "",
    minScore: "",
    maxScore: "",
    createdAfter: "",
    createdBefore: "",
    vip: "any",
    vetted: "any",
    canEmail: "any",
    canSms: "any",
  })

  // Load data from Supabase
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load buyers, tags, and groups in parallel
      const [buyersData, tagsData, groupsData] = await Promise.all([fetchBuyers(), fetchTags(), fetchGroups()])

      setBuyers(buyersData)
      setTags(tagsData)
      setGroups(groupsData)
    } catch (err: any) {
      console.error("Error loading data:", err)
      setError("Failed to load data. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  const fetchBuyers = async () => {
    const { data, error } = await supabase.from("buyers").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  const fetchTags = async () => {
    const { data, error } = await supabase.from("tags").select("*").order("name")

    if (error) throw error
    return data || []
  }

  const fetchGroups = async () => {
    const { data, error } = await supabase.from("groups").select("*").order("name")

    if (error) throw error
    return data || []
  }

  // Enhanced filter function with proper tag and location filtering
  const filteredBuyers = buyers.filter((buyer) => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const matchesSearch =
        buyer.fname?.toLowerCase().includes(searchTerm) ||
        buyer.lname?.toLowerCase().includes(searchTerm) ||
        buyer.email?.toLowerCase().includes(searchTerm) ||
        buyer.phone?.toLowerCase().includes(searchTerm) ||
        buyer.company?.toLowerCase().includes(searchTerm)
      if (!matchesSearch) return false
    }

    // Include tags filter
    if (filters.selectedTags && filters.selectedTags.length > 0) {
      const hasRequiredTags = filters.selectedTags.every((requiredTag) =>
        buyer.tags?.some((buyerTag) => buyerTag.toLowerCase().includes(requiredTag.toLowerCase())),
      )
      if (!hasRequiredTags) return false
    }

    // Exclude tags filter
    if (filters.excludedTags && filters.excludedTags.length > 0) {
      const hasExcludedTag = filters.excludedTags.some((excludedTag) =>
        buyer.tags?.some((buyerTag) => buyerTag.toLowerCase().includes(excludedTag.toLowerCase())),
      )
      if (hasExcludedTag) return false
    }

    // Location filter
    if (filters.selectedLocations && filters.selectedLocations.length > 0) {
      const hasRequiredLocation = filters.selectedLocations.some(
        (requiredLocation) =>
          buyer.mailing_city?.toLowerCase().includes(requiredLocation.toLowerCase()) ||
          buyer.mailing_state?.toLowerCase().includes(requiredLocation.toLowerCase()) ||
          buyer.mailing_address?.toLowerCase().includes(requiredLocation.toLowerCase()) ||
          buyer.locations?.some((loc) => loc.toLowerCase().includes(requiredLocation.toLowerCase())),
      )
      if (!hasRequiredLocation) return false
    }

    // VIP filter
    if (filters.vip === "vip" && !buyer.vip) return false
    if (filters.vip === "not-vip" && buyer.vip) return false

    // Vetted filter
    if (filters.vetted === "vetted" && !buyer.vetted) return false
    if (filters.vetted === "not-vetted" && buyer.vetted) return false

    // Email/SMS preferences
    if (filters.canEmail === "yes" && !buyer.can_receive_email) return false
    if (filters.canEmail === "no" && buyer.can_receive_email) return false
    if (filters.canSms === "yes" && !buyer.can_receive_sms) return false
    if (filters.canSms === "no" && buyer.can_receive_sms) return false

    // Score filters
    if (filters.minScore && buyer.score < Number.parseInt(filters.minScore)) return false
    if (filters.maxScore && buyer.score > Number.parseInt(filters.maxScore)) return false

    // Quick filters
    if (activeQuickFilters.includes("vip") && !buyer.vip) return false
    if (activeQuickFilters.includes("highScore") && buyer.score < 80) return false
    if (activeQuickFilters.includes("hot") && buyer.score < 85) return false
    if (activeQuickFilters.includes("new")) {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const createdDate = new Date(buyer.created_at)
      if (createdDate < weekAgo) return false
    }

    // Smart group filters
    if (selectedGroup) {
      switch (selectedGroup) {
        case "vip":
          if (!buyer.vip) return false
          break
        case "high-value":
          if (buyer.score < 80) return false
          break
        case "hot":
          if (buyer.score < 85) return false
          break
        case "investor":
          if (!buyer.tags?.some((tag) => tag.toLowerCase().includes("investor"))) return false
          break
        case "cash-buyer":
          if (!buyer.tags?.some((tag) => tag.toLowerCase().includes("cash"))) return false
          break
        case "wholesaler":
          if (!buyer.tags?.some((tag) => tag.toLowerCase().includes("wholesaler"))) return false
          break
      }
    }

    return true
  })

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedBuyers([])
    } else {
      setSelectedBuyers(filteredBuyers.map((buyer) => buyer.id))
    }
    setAllSelected(!allSelected)
  }

  const toggleSelectBuyer = (id: string) => {
    if (selectedBuyers.includes(id)) {
      setSelectedBuyers(selectedBuyers.filter((buyerId) => buyerId !== id))
      setAllSelected(false)
    } else {
      setSelectedBuyers([...selectedBuyers, id])
      if (selectedBuyers.length + 1 === filteredBuyers.length) {
        setAllSelected(true)
      }
    }
  }

  const toggleQuickFilter = (filterKey: string) => {
    setActiveQuickFilters((prev) =>
      prev.includes(filterKey) ? prev.filter((f) => f !== filterKey) : [...prev, filterKey],
    )
  }

  const clearFilter = (filterKey: string) => {
    setFilters((prev) => ({ ...prev, [filterKey]: "" }))
  }

  const clearAllFilters = () => {
    setFilters({
      search: "",
      selectedTags: [],
      excludedTags: [],
      selectedLocations: [],
      propertyTypes: "",
      minScore: "",
      maxScore: "",
      createdAfter: "",
      createdBefore: "",
      vip: "any",
      vetted: "any",
      canEmail: "any",
      canSms: "any",
    })
    setActiveQuickFilters([])
    setSelectedGroup(null)
  }

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => (prev.includes(folderId) ? prev.filter((id) => id !== folderId) : [...prev, folderId]))
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50"
    if (score >= 70) return "text-blue-600 bg-blue-50"
    if (score >= 50) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "lead":
        return "bg-blue-100 text-blue-800"
      case "qualified":
        return "bg-green-100 text-green-800"
      case "active":
        return "bg-orange-100 text-orange-800"
      case "under_contract":
        return "bg-purple-100 text-purple-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatName = (buyer: Buyer) => {
    if (buyer.full_name) return buyer.full_name
    if (buyer.fname && buyer.lname) return `${buyer.fname} ${buyer.lname}`
    if (buyer.fname) return buyer.fname
    if (buyer.lname) return buyer.lname
    return "No Name"
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your buyers...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadData}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex h-full min-h-screen bg-background">
        {/* Enhanced Sidebar */}
        <div className="hidden md:block w-80 border-r bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 overflow-hidden flex-shrink-0">
          {/* Sidebar Header */}
          <div className="p-6 border-b bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Smart Groups</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Organize your buyers</p>
              </div>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-700">
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add</span>
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search groups..."
                className="pl-10 h-9 bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-800"
              />
            </div>
          </div>

          {/* Folders and Groups */}
          <div className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-12rem)]">
            {smartGroupsStructure.map((folder) => (
              <div key={folder.id} className="space-y-1">
                {/* Folder Header */}
                <Button
                  variant="ghost"
                  onClick={() => toggleFolder(folder.id)}
                  className="w-full justify-start h-9 px-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 group"
                >
                  <div className="flex items-center space-x-2 flex-1">
                    {expandedFolders.includes(folder.id) ? (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    )}
                    {expandedFolders.includes(folder.id) ? (
                      <FolderOpen className="h-4 w-4 text-slate-500" />
                    ) : (
                      <Folder className="h-4 w-4 text-slate-500" />
                    )}
                    <span className="font-medium text-sm">{folder.name}</span>
                  </div>
                </Button>

                {/* Groups in Folder */}
                {expandedFolders.includes(folder.id) && (
                  <div className="ml-6 space-y-1">
                    {folder.groups.map((group) => {
                      // Calculate count based on group type
                      let count = 0
                      if (group.id === "vip") count = buyers.filter((b) => b.vip).length
                      else if (group.id === "high-value") count = buyers.filter((b) => b.score >= 80).length
                      else if (group.id === "hot") count = buyers.filter((b) => b.score >= 85).length
                      else if (group.id === "investor")
                        count = buyers.filter((b) =>
                          b.tags?.some((tag) => tag.toLowerCase().includes("investor")),
                        ).length
                      else if (group.id === "cash-buyer")
                        count = buyers.filter((b) => b.tags?.some((tag) => tag.toLowerCase().includes("cash"))).length
                      else if (group.id === "wholesaler")
                        count = buyers.filter((b) =>
                          b.tags?.some((tag) => tag.toLowerCase().includes("wholesaler")),
                        ).length

                      return (
                        <Button
                          key={group.id}
                          variant="ghost"
                          onClick={() => setSelectedGroup(selectedGroup === group.id ? null : group.id)}
                          className={`w-full justify-between h-9 px-3 group transition-all duration-200 ${
                            selectedGroup === group.id
                              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-l-2 border-blue-500"
                              : "hover:bg-slate-50 dark:hover:bg-slate-700/30 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <group.icon className={`h-4 w-4 ${group.color}`} />
                            <span className="text-sm font-medium truncate">{group.name}</span>
                          </div>
                          <Badge
                            variant="secondary"
                            className={`text-xs px-2 py-0.5 ${
                              selectedGroup === group.id
                                ? "bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300"
                                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            {count}
                          </Badge>
                        </Button>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Total Buyers:</span>
                <span className="font-medium">{buyers.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Filtered:</span>
                <span className="font-medium">{filteredBuyers.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Groups:</span>
                <span className="font-medium">{groups.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 md:p-6 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">👥 Buyers</h1>
                <Badge variant="secondary" className="text-sm">
                  {filteredBuyers.length} results
                </Badge>
                {(Object.values(filters).some((v) => v !== "") || activeQuickFilters.length > 0 || selectedGroup) && (
                  <Badge variant="outline" className="text-sm">
                    {Object.values(filters).filter((v) => v !== "").length +
                      activeQuickFilters.length +
                      (selectedGroup ? 1 : 0)}{" "}
                    filters applied
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <ImportBuyersModal onSuccess={loadData} />
                <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                  <FileUp className="mr-1 h-4 w-4" /> Export List
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="mr-1 h-4 w-4" /> Add Buyer
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Target className="mr-1 h-4 w-4" /> Create Campaign
                </Button>
              </div>
            </div>

            {/* Bulk Actions Toolbar */}
            {selectedBuyers.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{selectedBuyers.length} selected</Badge>
                    <span className="text-sm text-muted-foreground">
                      {selectedBuyers.length === 1 ? "1 buyer" : `${selectedBuyers.length} buyers`} selected
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Users className="mr-1 h-4 w-4" /> Add to Group
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="mr-1 h-4 w-4" /> Send Email
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="mr-1 h-4 w-4" /> Send SMS
                    </Button>
                    <Button className="bg-purple-600 hover:bg-purple-700" size="sm">
                      <Target className="mr-1 h-4 w-4" /> Create Campaign
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedBuyers([])}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Filter Chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              {quickFilters.map((filter) => (
                <Button
                  key={filter.key}
                  variant={activeQuickFilters.includes(filter.key) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleQuickFilter(filter.key)}
                  className="h-7"
                >
                  {filter.label}
                  {activeQuickFilters.includes(filter.key) && <X className="ml-1 h-3 w-3" />}
                </Button>
              ))}
              {selectedGroup && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setSelectedGroup(null)}
                  className="h-7 bg-blue-600 hover:bg-blue-700"
                >
                  {smartGroupsStructure.flatMap((f) => f.groups).find((g) => g.id === selectedGroup)?.name}
                  <X className="ml-1 h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Switch id="advanced-filters" checked={showAdvancedFilters} onCheckedChange={setShowAdvancedFilters} />
                <label htmlFor="advanced-filters" className="text-sm font-medium">
                  Advanced Filters
                </label>
                <Filter className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Compact View</span>
                <Switch checked={compactView} onCheckedChange={setCompactView} />
              </div>
            </div>

            {/* Advanced Filters - Rearranged to match original layout */}
            {showAdvancedFilters && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                {/* Search and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Search</label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, phone, email, or company"
                        className="pl-9"
                        value={filters.search}
                        onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                      />
                      {filters.search && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1 h-7 w-7 p-0"
                          onClick={() => clearFilter("search")}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Location</label>
                    <LocationFilterSelector
                      selectedLocations={filters.selectedLocations || []}
                      onChange={(selectedLocations) => setFilters((prev) => ({ ...prev, selectedLocations }))}
                      placeholder="Select locations to filter by..."
                    />
                  </div>
                </div>

                {/* Tags and Exclude Tags */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Include Tags</label>
                    <TagFilterSelector
                      availableTags={tags}
                      selectedTags={filters.selectedTags || []}
                      onChange={(selectedTags) => setFilters((prev) => ({ ...prev, selectedTags }))}
                      placeholder="Select tags to include..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Exclude Tags</label>
                    <TagFilterSelector
                      availableTags={tags}
                      selectedTags={filters.excludedTags || []}
                      onChange={(selectedTags) => setFilters((prev) => ({ ...prev, excludedTags: selectedTags }))}
                      placeholder="Select tags to exclude..."
                      variant="exclude"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Property Type</label>
                    <Select
                      value={filters.propertyTypes || "any"}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, propertyTypes: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any property type</SelectItem>
                        <SelectItem value="single_family">Single Family</SelectItem>
                        <SelectItem value="multi_family">Multi-Family</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="land">Land</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Min/Max Score and Created After/Before */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Min Score</label>
                    <Input
                      type="number"
                      placeholder="0"
                      min="0"
                      max="100"
                      value={filters.minScore}
                      onChange={(e) => setFilters((prev) => ({ ...prev, minScore: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Max Score</label>
                    <Input
                      type="number"
                      placeholder="100"
                      min="0"
                      max="100"
                      value={filters.maxScore}
                      onChange={(e) => setFilters((prev) => ({ ...prev, maxScore: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Created After</label>
                    <Input
                      type="date"
                      value={filters.createdAfter}
                      onChange={(e) => setFilters((prev) => ({ ...prev, createdAfter: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Created Before</label>
                    <Input
                      type="date"
                      value={filters.createdBefore}
                      onChange={(e) => setFilters((prev) => ({ ...prev, createdBefore: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Status Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">VIP Status</label>
                    <Select
                      value={filters.vip || "any"}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, vip: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="vip">VIP Only</SelectItem>
                        <SelectItem value="not-vip">Not VIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Vetted Status</label>
                    <Select
                      value={filters.vetted || "any"}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, vetted: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="vetted">Vetted Only</SelectItem>
                        <SelectItem value="not-vetted">Not Vetted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Can Receive Email</label>
                    <Select
                      value={filters.canEmail || "any"}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, canEmail: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Can Receive SMS</label>
                    <Select
                      value={filters.canSms || "any"}
                      onValueChange={(value) => setFilters((prev) => ({ ...prev, canSms: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex justify-between pt-4 border-t">
                  <Button variant="destructive" size="sm" onClick={clearAllFilters}>
                    Reset All Filters
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Users className="mr-1 h-4 w-4" /> Save as Group
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileUp className="mr-1 h-4 w-4" /> Export CSV
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full border-collapse">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="p-3 text-left w-10 sticky left-0 bg-muted/50 z-10">
                    <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} />
                  </th>
                  <th className="p-3 text-left font-medium sticky left-10 bg-muted/50 z-10">Name</th>
                  <th className="p-3 text-left font-medium">Email</th>
                  <th className="p-3 text-left font-medium">Phone</th>
                  <th className="p-3 text-left font-medium">Score</th>
                  <th className="p-3 text-left font-medium">Tags</th>
                  <th className="p-3 text-left font-medium">Locations</th>
                  <th className="p-3 text-left font-medium">Created</th>
                  <th className="p-3 text-left font-medium">Status</th>
                  <th className="p-3 text-left font-medium w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBuyers.map((buyer) => (
                  <tr key={buyer.id} className={`border-b hover:bg-muted/30 group ${compactView ? "h-12" : "h-16"}`}>
                    <td className="p-3 sticky left-0 bg-background group-hover:bg-muted/30">
                      <Checkbox
                        checked={selectedBuyers.includes(buyer.id)}
                        onCheckedChange={() => toggleSelectBuyer(buyer.id)}
                      />
                    </td>
                    <td className="p-3 font-medium sticky left-10 bg-background group-hover:bg-muted/30">
                      <div className="flex items-center justify-between min-w-0">
                        <div className="truncate mr-2 text-sm font-semibold text-gray-900">{formatName(buyer)}</div>
                        <div className="flex items-center space-x-1">
                          {buyer.vip && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                          {buyer.vetted && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                        </div>
                      </div>
                      {buyer.company && <div className="text-xs text-muted-foreground">{buyer.company}</div>}
                    </td>
                    <td className="p-3">{buyer.email || "No email"}</td>
                    <td className="p-3 font-mono text-sm whitespace-nowrap">{buyer.phone || "No phone"}</td>
                    <td className="p-3">
                      <Badge className={`${getScoreColor(buyer.score)} border-0`}>{buyer.score}</Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1 max-w-48">
                        {buyer.tags?.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs px-2 py-0.5 whitespace-nowrap">
                            {tag}
                          </Badge>
                        ))}
                        {buyer.tags && buyer.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs px-2 py-0.5">
                            +{buyer.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1 max-w-48">
                        {buyer.locations?.slice(0, 2).map((location, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs px-2 py-0.5 whitespace-nowrap bg-blue-100 text-blue-800"
                          >
                            <MapPin className="h-3 w-3 mr-1" />
                            {location}
                          </Badge>
                        ))}
                        {buyer.locations && buyer.locations.length > 2 && (
                          <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800">
                            +{buyer.locations.length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground font-mono whitespace-nowrap">
                      {formatDate(buyer.created_at)}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col space-y-2">
                        <Badge className={`${getStatusColor(buyer.status)} text-xs w-fit`}>
                          {buyer.status.charAt(0).toUpperCase() + buyer.status.slice(1)}
                        </Badge>
                        <div className="flex items-center space-x-2">
                          {buyer.can_receive_email && <Mail className="h-4 w-4 text-blue-500" />}
                          {buyer.can_receive_sms && <MessageSquare className="h-4 w-4 text-purple-500" />}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700"
                          title="Send Email"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700"
                          title="Send SMS"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-purple-100 hover:text-purple-700"
                          title="Call"
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                          title="Edit Contact"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="More Options">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredBuyers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No buyers found</h3>
                <p className="text-sm text-muted-foreground">
                  {buyers.length === 0 ? "Add your first buyer to get started" : "Try adjusting your filters"}
                </p>
                {(Object.values(filters).some((v) => v !== "") || activeQuickFilters.length > 0 || selectedGroup) && (
                  <Button variant="outline" className="mt-4" onClick={clearAllFilters}>
                    Clear All Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
