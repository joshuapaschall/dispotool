"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import type { Buyer, Tag } from "@/lib/supabase"
import ImportBuyersModal from "@/components/buyers/import-buyers-modal"
import AddBuyerModal from "@/components/buyers/add-buyer-modal"
import SmartGroupsSidebar from "@/components/buyers/smart-groups-sidebar"
import {
  Plus,
  Search,
  Star,
  Mail,
  MessageSquare,
  Phone,
  MoreHorizontal,
  FileUp,
  CheckCircle,
  X,
  Edit,
  Loader2,
  MapPin,
  Users,
  Tags,
  UserPlus,
  UserMinus,
  Trash2,
  Target,
  Download,
} from "lucide-react"

import TagFilterSelector from "@/components/buyers/tag-filter-selector"
import LocationFilterSelector from "@/components/buyers/location-filter-selector"
import { exportBuyersToCSV, exportBuyersToJSON } from "@/lib/export-utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const quickFilters = [
  { label: "VIP", key: "vip" },
  { label: "Hot Leads", key: "hot" },
  { label: "New This Week", key: "new" },
  { label: "High Score", key: "highScore" },
]

export default function BuyersPage() {
  // State for real data
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // UI state
  const [selectedBuyers, setSelectedBuyers] = useState<string[]>([])
  const [allSelected, setAllSelected] = useState(false)
  const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>([])
  const [showAddBuyerModal, setShowAddBuyerModal] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<string>("")

  // Active filters state
  const [filters, setFilters] = useState({
    search: "",
    selectedTags: [] as string[],
    excludeTags: [] as string[],
    selectedLocations: [] as string[],
    minScore: "",
    maxScore: "",
    vip: "any",
    vetted: "any",
    canReceiveEmail: "any",
    canReceiveSMS: "any",
    createdAfter: "",
    createdBefore: "",
    propertyType: "any",
  })

  // Load data from Supabase
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load buyers and tags
      const [buyersData, tagsData] = await Promise.all([fetchBuyers(), fetchTags()])

      setBuyers(buyersData)
      setTags(tagsData)
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

  // Export functions - only for selected buyers
  const handleExportCSV = () => {
    if (selectedBuyers.length === 0) {
      alert("Please select buyers to export")
      return
    }
    const selectedBuyerData = buyers.filter((buyer) => selectedBuyers.includes(buyer.id))
    const timestamp = new Date().toISOString().split("T")[0]
    const filename = `buyers-export-${timestamp}.csv`
    exportBuyersToCSV(selectedBuyerData, filename)
  }

  const handleExportJSON = () => {
    if (selectedBuyers.length === 0) {
      alert("Please select buyers to export")
      return
    }
    const selectedBuyerData = buyers.filter((buyer) => selectedBuyers.includes(buyer.id))
    const timestamp = new Date().toISOString().split("T")[0]
    const filename = `buyers-export-${timestamp}.json`
    exportBuyersToJSON(selectedBuyerData, filename)
  }

  // Bulk actions
  const handleBulkAddTags = async (tagsToAdd: string[]) => {
    try {
      for (const buyerId of selectedBuyers) {
        const buyer = buyers.find((b) => b.id === buyerId)
        if (buyer) {
          const currentTags = buyer.tags || []
          const newTags = [...new Set([...currentTags, ...tagsToAdd])]

          await supabase.from("buyers").update({ tags: newTags }).eq("id", buyerId)
        }
      }

      loadData()
      setSelectedBuyers([])
    } catch (err) {
      console.error("Error adding tags:", err)
    }
  }

  const handleBulkRemoveTags = async (tagsToRemove: string[]) => {
    try {
      for (const buyerId of selectedBuyers) {
        const buyer = buyers.find((b) => b.id === buyerId)
        if (buyer) {
          const currentTags = buyer.tags || []
          const newTags = currentTags.filter((tag) => !tagsToRemove.includes(tag))

          await supabase.from("buyers").update({ tags: newTags }).eq("id", buyerId)
        }
      }

      loadData()
      setSelectedBuyers([])
    } catch (err) {
      console.error("Error removing tags:", err)
    }
  }

  const handleBulkAddToGroup = async (groupId: string) => {
    try {
      const records = selectedBuyers.map((buyerId) => ({
        buyer_id: buyerId,
        group_id: groupId,
      }))

      await supabase.from("buyer_groups").insert(records)

      setSelectedBuyers([])
    } catch (err) {
      console.error("Error adding to group:", err)
    }
  }

  const handleBulkRemoveFromGroup = async (groupId: string) => {
    try {
      await supabase.from("buyer_groups").delete().in("buyer_id", selectedBuyers).eq("group_id", groupId)

      setSelectedBuyers([])
    } catch (err) {
      console.error("Error removing from group:", err)
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedBuyers.length} buyers? This cannot be undone.`)) {
      return
    }

    try {
      await supabase.from("buyers").delete().in("id", selectedBuyers)

      loadData()
      setSelectedBuyers([])
    } catch (err) {
      console.error("Error deleting buyers:", err)
    }
  }

  // Filter function
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

    // Include Tags filter
    if (filters.selectedTags && filters.selectedTags.length > 0) {
      const hasRequiredTags = filters.selectedTags.every((requiredTag) =>
        buyer.tags?.some((buyerTag) => buyerTag.toLowerCase().includes(requiredTag.toLowerCase())),
      )
      if (!hasRequiredTags) return false
    }

    // Exclude Tags filter
    if (filters.excludeTags && filters.excludeTags.length > 0) {
      const hasExcludedTag = filters.excludeTags.some((excludedTag) =>
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

    // Email filter
    if (filters.canReceiveEmail === "yes" && !buyer.can_receive_email) return false
    if (filters.canReceiveEmail === "no" && buyer.can_receive_email) return false

    // SMS filter
    if (filters.canReceiveSMS === "yes" && !buyer.can_receive_sms) return false
    if (filters.canReceiveSMS === "no" && buyer.can_receive_sms) return false

    // Score filters
    if (filters.minScore && buyer.score < Number.parseInt(filters.minScore)) return false
    if (filters.maxScore && buyer.score > Number.parseInt(filters.maxScore)) return false

    // Date filters
    if (filters.createdAfter) {
      const createdAfterDate = new Date(filters.createdAfter)
      const buyerCreatedDate = new Date(buyer.created_at)
      if (buyerCreatedDate < createdAfterDate) return false
    }

    if (filters.createdBefore) {
      const createdBeforeDate = new Date(filters.createdBefore)
      const buyerCreatedDate = new Date(buyer.created_at)
      if (buyerCreatedDate > createdBeforeDate) return false
    }

    // Property type filter
    if (filters.propertyType !== "any") {
      if (!buyer.property_type?.includes(filters.propertyType)) return false
    }

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

  const clearAllFilters = () => {
    setFilters({
      search: "",
      selectedTags: [],
      excludeTags: [],
      selectedLocations: [],
      minScore: "",
      maxScore: "",
      vip: "any",
      vetted: "any",
      canReceiveEmail: "any",
      canReceiveSMS: "any",
      createdAfter: "",
      createdBefore: "",
      propertyType: "any",
    })
    setActiveQuickFilters([])
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
    <div className="flex h-screen bg-background">
      {/* Smart Groups Sidebar */}
      <div className="w-80 border-r">
        <SmartGroupsSidebar
          onGroupSelect={setSelectedGroupId}
          selectedGroupId={selectedGroupId}
          buyerCounts={{}} // You can implement this to show actual counts
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b bg-white">
          <div className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">👥 Buyers</h1>
                <Badge variant="secondary" className="text-sm">
                  {filteredBuyers.length} results
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => setShowAddBuyerModal(true)}
                  title="Add a new buyer manually"
                >
                  <Plus className="mr-1 h-4 w-4" /> Add Buyer
                </Button>
                <ImportBuyersModal onSuccess={loadData} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                      disabled={selectedBuyers.length === 0}
                      title={
                        selectedBuyers.length === 0
                          ? "Select buyers to export"
                          : `Export ${selectedBuyers.length} selected buyers`
                      }
                    >
                      <Download className="mr-1 h-4 w-4" /> Export Buyers
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleExportCSV}>
                      Export as CSV ({selectedBuyers.length} buyers)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportJSON}>
                      Export as JSON ({selectedBuyers.length} buyers)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button className="bg-purple-600 hover:bg-purple-700" title="Create a new marketing campaign">
                  <Target className="mr-1 h-4 w-4" /> Create Campaign
                </Button>
              </div>
            </div>

            {/* Enhanced Bulk Actions */}
            {selectedBuyers.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{selectedBuyers.length} selected</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" title="Manage tags for selected buyers">
                          <Tags className="mr-1 h-4 w-4" /> Manage Tags
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => {
                            /* Open add tags modal */
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Tags
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            /* Open remove tags modal */
                          }}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Remove Tags
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" title="Manage groups for selected buyers">
                          <Users className="mr-1 h-4 w-4" /> Manage Groups
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => {
                            /* Open add to group modal */
                          }}
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add to Group
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            /* Open remove from group modal */
                          }}
                        >
                          <UserMinus className="mr-2 h-4 w-4" />
                          Remove from Group
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="outline" size="sm" title="Send email to selected buyers">
                      <Mail className="mr-1 h-4 w-4" /> Send Email
                    </Button>
                    <Button variant="outline" size="sm" title="Send SMS to selected buyers">
                      <MessageSquare className="mr-1 h-4 w-4" /> Send SMS
                    </Button>
                    <Button variant="outline" size="sm" title="Create campaign with selected buyers">
                      <Target className="mr-1 h-4 w-4" /> Create Campaign
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleBulkDelete} title="Delete selected buyers">
                      <Trash2 className="mr-1 h-4 w-4" /> Delete
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedBuyers([])} title="Clear selection">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              {quickFilters.map((filter) => (
                <Button
                  key={filter.key}
                  variant={activeQuickFilters.includes(filter.key) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleQuickFilter(filter.key)}
                  className="h-7"
                  title={`Filter by ${filter.label}`}
                >
                  {filter.label}
                  {activeQuickFilters.includes(filter.key) && <X className="ml-1 h-3 w-3" />}
                </Button>
              ))}
            </div>

            {/* Search and Location - First Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

            {/* Include Tags, Exclude Tags, Property Type - Second Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                  selectedTags={filters.excludeTags || []}
                  onChange={(excludeTags) => setFilters((prev) => ({ ...prev, excludeTags }))}
                  placeholder="Select tags to exclude..."
                  variant="exclude"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Property Type</label>
                <Select
                  value={filters.propertyType}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, propertyType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any property type</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Score Range and Date Range - Third Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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

            {/* Status Filters - Fourth Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">VIP Status</label>
                <Select value={filters.vip} onValueChange={(value) => setFilters((prev) => ({ ...prev, vip: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="vip">VIP Only</SelectItem>
                    <SelectItem value="not-vip">Non-VIP Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Vetted Status</label>
                <Select
                  value={filters.vetted}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, vetted: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="vetted">Vetted Only</SelectItem>
                    <SelectItem value="not-vetted">Non-Vetted Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Can Receive Email</label>
                <Select
                  value={filters.canReceiveEmail}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, canReceiveEmail: value }))}
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
                  value={filters.canReceiveSMS}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, canReceiveSMS: value }))}
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

            {/* Action Buttons - Bottom Row */}
            <div className="flex justify-between items-center">
              <Button variant="destructive" onClick={clearAllFilters} title="Clear all active filters">
                Reset All Filters
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" title="Save current filters as a smart group">
                  <Users className="mr-1 h-4 w-4" /> Save as Group
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportCSV}
                  disabled={selectedBuyers.length === 0}
                  title={
                    selectedBuyers.length === 0
                      ? "Select buyers to export"
                      : `Export ${selectedBuyers.length} selected buyers as CSV`
                  }
                >
                  <FileUp className="mr-1 h-4 w-4" /> Export CSV
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                <th className="p-3 text-left w-10">
                  <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} title="Select all buyers" />
                </th>
                <th className="p-3 text-left font-medium">Name</th>
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
                <tr key={buyer.id} className="border-b hover:bg-muted/30 group h-16">
                  <td className="p-3">
                    <Checkbox
                      checked={selectedBuyers.includes(buyer.id)}
                      onCheckedChange={() => toggleSelectBuyer(buyer.id)}
                      title={`Select ${formatName(buyer)}`}
                    />
                  </td>
                  <td className="p-3 font-medium">
                    <div className="flex items-center justify-between min-w-0">
                      <div className="truncate mr-2 text-sm font-semibold text-gray-900">{formatName(buyer)}</div>
                      <div className="flex items-center space-x-1">
                        {buyer.vip && <Star className="h-4 w-4 text-amber-500 fill-amber-500" title="VIP Client" />}
                        {buyer.vetted && <CheckCircle className="h-4 w-4 text-emerald-500" title="Vetted Buyer" />}
                      </div>
                    </div>
                    {buyer.company && <div className="text-xs text-muted-foreground">{buyer.company}</div>}
                  </td>
                  <td className="p-3">{buyer.email || "No email"}</td>
                  <td className="p-3 font-mono text-sm whitespace-nowrap">{buyer.phone || "No phone"}</td>
                  <td className="p-3">
                    <Badge
                      className={`${getScoreColor(buyer.score)} border-0`}
                      title={`Buyer score: ${buyer.score}/100`}
                    >
                      {buyer.score}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1 max-w-48">
                      {buyer.tags?.slice(0, 3).map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs px-2 py-0.5 whitespace-nowrap"
                          title={tag}
                        >
                          {tag}
                        </Badge>
                      ))}
                      {buyer.tags && buyer.tags.length > 3 && (
                        <Badge
                          variant="outline"
                          className="text-xs px-2 py-0.5"
                          title={`${buyer.tags.length - 3} more tags`}
                        >
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
                          title={location}
                        >
                          <MapPin className="h-3 w-3 mr-1" />
                          {location}
                        </Badge>
                      ))}
                      {buyer.locations && buyer.locations.length > 2 && (
                        <Badge
                          variant="secondary"
                          className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800"
                          title={`${buyer.locations.length - 2} more locations`}
                        >
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
                        {buyer.can_receive_email && (
                          <Mail className="h-4 w-4 text-blue-500" title="Can receive email" />
                        )}
                        {buyer.can_receive_sms && (
                          <MessageSquare className="h-4 w-4 text-purple-500" title="Can receive SMS" />
                        )}
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
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100" title="Edit Contact">
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
              {(Object.values(filters).some((v) => v !== "" && v !== "any") || activeQuickFilters.length > 0) && (
                <Button variant="outline" className="mt-4" onClick={clearAllFilters}>
                  Clear All Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <AddBuyerModal open={showAddBuyerModal} onOpenChange={setShowAddBuyerModal} onSuccessAction={loadData} />
    </div>
  )
}
