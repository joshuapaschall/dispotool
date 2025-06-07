"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  Folder,
  Users,
  Star,
  Zap,
  DollarSign,
  TrendingUp,
  Mail,
  MessageSquare,
  UserX,
  MoreHorizontal,
  Edit,
  Trash2,
  FolderPlus,
} from "lucide-react"
import type { Group } from "@/lib/supabase"

interface SmartGroupsSidebarProps {
  onGroupSelect?: (groupId: string) => void
  selectedGroupId?: string
  buyerCounts?: Record<string, number>
}

interface GroupFolder {
  id: string
  name: string
  groups: Group[]
  expanded: boolean
}

// Placeholder groups data
const placeholderGroups: Group[] = [
  {
    id: "vip-clients",
    name: "VIP Clients",
    description: "High-value clients requiring premium service",
    type: "manual",
    color: "#FFD700",
    criteria: { folder: "priority-segments" },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "hot-leads",
    name: "Hot Leads",
    description: "Leads with high engagement and purchase intent",
    type: "manual",
    color: "#FF4444",
    criteria: { folder: "priority-segments" },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "high-value-buyers",
    name: "High Value Buyers",
    description: "Buyers with high budget and purchase power",
    type: "manual",
    color: "#22C55E",
    criteria: { folder: "priority-segments" },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "investors",
    name: "Investors",
    description: "Real estate investors looking for investment properties",
    type: "manual",
    color: "#8B5CF6",
    criteria: { folder: "buyer-types" },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cash-buyers",
    name: "Cash Buyers",
    description: "Buyers who can purchase with cash",
    type: "manual",
    color: "#3B82F6",
    criteria: { folder: "buyer-types" },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "wholesalers",
    name: "Wholesalers",
    description: "Wholesale buyers looking for deals",
    type: "manual",
    color: "#6B7280",
    criteria: { folder: "buyer-types" },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Placeholder buyer counts
const placeholderCounts = {
  "vip-clients": 1,
  "hot-leads": 0,
  "high-value-buyers": 0,
  investors: 1,
  "cash-buyers": 1,
  wholesalers: 0,
}

export default function SmartGroupsSidebar({
  onGroupSelect,
  selectedGroupId,
  buyerCounts = placeholderCounts,
}: SmartGroupsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [groups, setGroups] = useState<Group[]>(placeholderGroups)
  const [folders, setFolders] = useState<GroupFolder[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [showEditFolder, setShowEditFolder] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [editingFolder, setEditingFolder] = useState<GroupFolder | null>(null)

  // Form states
  const [groupForm, setGroupForm] = useState({
    name: "",
    description: "",
    type: "manual",
    color: "#3B82F6",
    folder: "",
  })
  const [folderForm, setFolderForm] = useState({
    name: "",
  })

  useEffect(() => {
    organizeFolders(groups)
  }, [groups])

  const organizeFolders = (groupsData: Group[]) => {
    // Initialize default folders
    const defaultFolders: GroupFolder[] = [
      {
        id: "priority-segments",
        name: "Priority Segments",
        groups: [],
        expanded: true,
      },
      {
        id: "buyer-types",
        name: "Buyer Types",
        groups: [],
        expanded: true,
      },
      {
        id: "engagement-status",
        name: "Engagement Status",
        groups: [],
        expanded: false,
      },
      {
        id: "custom-groups",
        name: "Custom Groups",
        groups: [],
        expanded: true,
      },
    ]

    // Categorize groups into folders
    groupsData.forEach((group) => {
      const folderMetadata = group.criteria?.folder || ""

      if (folderMetadata === "priority-segments") {
        defaultFolders[0].groups.push(group)
      } else if (folderMetadata === "buyer-types") {
        defaultFolders[1].groups.push(group)
      } else if (folderMetadata === "engagement-status") {
        defaultFolders[2].groups.push(group)
      } else {
        defaultFolders[3].groups.push(group)
      }
    })

    setFolders(defaultFolders)
  }

  const handleCreateGroup = async () => {
    try {
      const criteria = {
        folder: groupForm.folder || "custom-groups",
      }

      const newGroup: Group = {
        id: `group-${Date.now()}`,
        name: groupForm.name,
        description: groupForm.description,
        type: groupForm.type as "manual" | "smart",
        color: groupForm.color,
        criteria: criteria,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      setGroups([...groups, newGroup])
      setShowCreateGroup(false)
      setGroupForm({ name: "", description: "", type: "manual", color: "#3B82F6", folder: "" })
    } catch (err) {
      console.error("Error creating group:", err)
    }
  }

  const handleEditGroup = async () => {
    if (!editingGroup) return

    try {
      const criteria = {
        ...(editingGroup.criteria || {}),
        folder: groupForm.folder || editingGroup.criteria?.folder || "custom-groups",
      }

      const updatedGroups = groups.map((group) =>
        group.id === editingGroup.id
          ? {
              ...group,
              name: groupForm.name,
              description: groupForm.description,
              color: groupForm.color,
              criteria: criteria,
              updated_at: new Date().toISOString(),
            }
          : group,
      )

      setGroups(updatedGroups)
      setEditingGroup(null)
      setGroupForm({ name: "", description: "", type: "manual", color: "#3B82F6", folder: "" })
    } catch (err) {
      console.error("Error updating group:", err)
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm("Are you sure you want to delete this group?")) return

    try {
      setGroups(groups.filter((group) => group.id !== groupId))
    } catch (err) {
      console.error("Error deleting group:", err)
    }
  }

  const handleCreateFolder = () => {
    const newFolder: GroupFolder = {
      id: `custom-${Date.now()}`,
      name: folderForm.name,
      groups: [],
      expanded: true,
    }

    setFolders([...folders, newFolder])
    setShowCreateFolder(false)
    setFolderForm({ name: "" })
  }

  const handleEditFolder = () => {
    if (!editingFolder) return

    setFolders(
      folders.map((folder) => (folder.id === editingFolder.id ? { ...folder, name: folderForm.name } : folder)),
    )
    setShowEditFolder(false)
    setEditingFolder(null)
    setFolderForm({ name: "" })
  }

  const handleDeleteFolder = (folderId: string) => {
    if (!confirm("Are you sure you want to delete this folder? Groups will be moved to Custom Groups.")) return

    const folderToDelete = folders.find((f) => f.id === folderId)
    if (folderToDelete) {
      const customGroupsFolder = folders.find((f) => f.id === "custom-groups")
      if (customGroupsFolder) {
        customGroupsFolder.groups = [...customGroupsFolder.groups, ...folderToDelete.groups]
      }
      setFolders(folders.filter((f) => f.id !== folderId))
    }
  }

  const toggleFolder = (folderId: string) => {
    setFolders((prev) =>
      prev.map((folder) => (folder.id === folderId ? { ...folder, expanded: !folder.expanded } : folder)),
    )
  }

  const getGroupIcon = (groupName: string) => {
    const name = groupName.toLowerCase()
    if (name.includes("vip")) return <Star className="h-4 w-4 text-yellow-500" />
    if (name.includes("hot")) return <Zap className="h-4 w-4 text-red-500" />
    if (name.includes("high value")) return <DollarSign className="h-4 w-4 text-green-500" />
    if (name.includes("investor")) return <TrendingUp className="h-4 w-4 text-purple-500" />
    if (name.includes("cash")) return <DollarSign className="h-4 w-4 text-blue-500" />
    if (name.includes("wholesale")) return <Users className="h-4 w-4 text-gray-500" />
    if (name.includes("email")) return <Mail className="h-4 w-4 text-blue-500" />
    if (name.includes("sms") || name.includes("text")) return <MessageSquare className="h-4 w-4 text-green-500" />
    if (name.includes("cold")) return <UserX className="h-4 w-4 text-gray-500" />
    return <Users className="h-4 w-4 text-gray-500" />
  }

  const filteredFolders = folders
    .map((folder) => ({
      ...folder,
      groups: folder.groups.filter((group) => group.name.toLowerCase().includes(searchQuery.toLowerCase())),
    }))
    .filter((folder) => folder.groups.length > 0 || searchQuery === "")

  const totalBuyers = Object.values(buyerCounts).reduce((a, b) => a + b, 0)
  const activeGroups = groups.length

  return (
    <Card className="w-80 h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Smart Groups</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" title="Add new group or folder">
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setShowCreateGroup(true)}>
                <Users className="mr-2 h-4 w-4" />
                Create Group
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowCreateFolder(true)}>
                <FolderPlus className="mr-2 h-4 w-4" />
                Create Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-sm text-muted-foreground">Organize your buyers</p>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {filteredFolders.map((folder) => (
            <div key={folder.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  className="flex-1 justify-start p-2 h-auto"
                  onClick={() => toggleFolder(folder.id)}
                  title={`${folder.expanded ? "Collapse" : "Expand"} ${folder.name}`}
                >
                  {folder.expanded ? (
                    <ChevronDown className="h-4 w-4 mr-2" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mr-2" />
                  )}
                  <Folder className="h-4 w-4 mr-2" />
                  <span className="font-medium">{folder.name}</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Folder options">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingFolder(folder)
                        setFolderForm({ name: folder.name })
                        setShowEditFolder(true)
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Folder
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowCreateGroup(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Group to Folder
                    </DropdownMenuItem>
                    {folder.id !== "priority-segments" &&
                      folder.id !== "buyer-types" &&
                      folder.id !== "engagement-status" &&
                      folder.id !== "custom-groups" && (
                        <DropdownMenuItem onClick={() => handleDeleteFolder(folder.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Folder
                        </DropdownMenuItem>
                      )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {folder.expanded && (
                <div className="ml-6 space-y-1">
                  {folder.groups.map((group) => (
                    <div
                      key={group.id}
                      className={`flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer ${
                        selectedGroupId === group.id ? "bg-muted" : ""
                      }`}
                      onClick={() => onGroupSelect?.(group.id)}
                      title={`Select ${group.name} group`}
                    >
                      <div className="flex items-center space-x-2 flex-1">
                        {getGroupIcon(group.name)}
                        <span className="text-sm">{group.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Badge variant="secondary" className="text-xs">
                          {buyerCounts[group.id] || 0}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6" title="Group options">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingGroup(group)
                                setGroupForm({
                                  name: group.name,
                                  description: group.description || "",
                                  type: group.type,
                                  color: group.color || "#3B82F6",
                                  folder: group.criteria?.folder || folder.id,
                                })
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteGroup(group.id)
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>

      {/* Summary Stats */}
      <div className="p-4 border-t space-y-2 flex-shrink-0">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Buyers:</span>
          <span className="font-medium">{totalBuyers}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Filtered:</span>
          <span className="font-medium">{totalBuyers}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Active Groups:</span>
          <span className="font-medium">{activeGroups}</span>
        </div>
      </div>

      {/* Create Group Dialog */}
      <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                value={groupForm.name}
                onChange={(e) => setGroupForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter group name"
              />
            </div>
            <div>
              <Label htmlFor="group-description">Description</Label>
              <Textarea
                id="group-description"
                value={groupForm.description}
                onChange={(e) => setGroupForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Enter group description"
              />
            </div>
            <div>
              <Label htmlFor="group-folder">Parent Folder</Label>
              <Select
                value={groupForm.folder}
                onValueChange={(value) => setGroupForm((prev) => ({ ...prev, folder: value }))}
              >
                <SelectTrigger id="group-folder">
                  <SelectValue placeholder="Select a folder" />
                </SelectTrigger>
                <SelectContent>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="group-color">Color</Label>
              <Input
                id="group-color"
                type="color"
                value={groupForm.color}
                onChange={(e) => setGroupForm((prev) => ({ ...prev, color: e.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateGroup(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateGroup}>Create Group</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog open={!!editingGroup} onOpenChange={() => setEditingGroup(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-group-name">Group Name</Label>
              <Input
                id="edit-group-name"
                value={groupForm.name}
                onChange={(e) => setGroupForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter group name"
              />
            </div>
            <div>
              <Label htmlFor="edit-group-description">Description</Label>
              <Textarea
                id="edit-group-description"
                value={groupForm.description}
                onChange={(e) => setGroupForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Enter group description"
              />
            </div>
            <div>
              <Label htmlFor="edit-group-folder">Parent Folder</Label>
              <Select
                value={groupForm.folder}
                onValueChange={(value) => setGroupForm((prev) => ({ ...prev, folder: value }))}
              >
                <SelectTrigger id="edit-group-folder">
                  <SelectValue placeholder="Select a folder" />
                </SelectTrigger>
                <SelectContent>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-group-color">Color</Label>
              <Input
                id="edit-group-color"
                type="color"
                value={groupForm.color}
                onChange={(e) => setGroupForm((prev) => ({ ...prev, color: e.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingGroup(null)}>
                Cancel
              </Button>
              <Button onClick={handleEditGroup}>Save Changes</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Folder Dialog */}
      <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                value={folderForm.name}
                onChange={(e) => setFolderForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter folder name"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateFolder(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFolder}>Create Folder</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Folder Dialog */}
      <Dialog open={showEditFolder} onOpenChange={setShowEditFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-folder-name">Folder Name</Label>
              <Input
                id="edit-folder-name"
                value={folderForm.name}
                onChange={(e) => setFolderForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter folder name"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditFolder(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditFolder}>Save Changes</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
