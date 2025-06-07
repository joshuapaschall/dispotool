"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, User, MapPin, Tag, Settings, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import TagSelector from "./tag-selector"
import LocationSelector from "./location-selector"

interface AddBuyerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccessAction?: () => void
}

interface BuyerFormData {
  fname: string
  lname: string
  email: string
  phone: string
  phone2: string
  phone3: string
  company: string
  score: number
  notes: string
  mailing_address: string
  mailing_city: string
  mailing_state: string
  mailing_zip: string
  locations: string[]
  tags: any[]
  vetted: boolean
  vip: boolean
  can_receive_sms: boolean
  can_receive_email: boolean
  property_type: string[]
  budget_min: string
  budget_max: string
  timeline: string
  source: string
  status: string
}

const initialFormData: BuyerFormData = {
  fname: "",
  lname: "",
  email: "",
  phone: "",
  phone2: "",
  phone3: "",
  company: "",
  score: 50,
  notes: "",
  mailing_address: "",
  mailing_city: "",
  mailing_state: "",
  mailing_zip: "",
  locations: [],
  tags: [],
  vetted: false,
  vip: false,
  can_receive_sms: true,
  can_receive_email: true,
  property_type: [],
  budget_min: "",
  budget_max: "",
  timeline: "",
  source: "",
  status: "lead",
}

const PROPERTY_TYPES = ["Single Family", "Multi-Family", "Condo", "Townhouse", "Land", "Commercial", "Investment"]

const TIMELINES = ["ASAP", "1-3 months", "3-6 months", "6-12 months", "12+ months", "Just looking"]

const SOURCES = ["Website", "Referral", "Social Media", "Cold Call", "Email Campaign", "Event", "Walk-in", "Other"]

const STATUSES = [
  { value: "lead", label: "Lead" },
  { value: "qualified", label: "Qualified" },
  { value: "active", label: "Active" },
  { value: "under_contract", label: "Under Contract" },
  { value: "closed", label: "Closed" },
  { value: "inactive", label: "Inactive" },
]

export default function AddBuyerModal({ open, onOpenChange, onSuccessAction }: AddBuyerModalProps) {
  const [formData, setFormData] = useState<BuyerFormData>(initialFormData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("basic")

  const handleInputChange = (field: keyof BuyerFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePropertyTypeToggle = (type: string) => {
    const current = formData.property_type
    if (current.includes(type)) {
      handleInputChange(
        "property_type",
        current.filter((t) => t !== type),
      )
    } else {
      handleInputChange("property_type", [...current, type])
    }
  }

  const validateForm = () => {
    if (!formData.fname && !formData.lname) {
      return "Please provide at least a first or last name"
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      return "Please provide a valid email address"
    }
    return null
  }

  const handleSubmit = async () => {
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError("")

    try {
      // Prepare data for insertion
      const insertData = {
        fname: formData.fname || null,
        lname: formData.lname || null,
        email: formData.email || null,
        phone: formData.phone || null,
        phone2: formData.phone2 || null,
        phone3: formData.phone3 || null,
        company: formData.company || null,
        score: formData.score,
        notes: formData.notes || null,
        mailing_address: formData.mailing_address || null,
        mailing_city: formData.mailing_city || null,
        mailing_state: formData.mailing_state || null,
        mailing_zip: formData.mailing_zip || null,
        locations: formData.locations.length > 0 ? formData.locations : null,
        tags: formData.tags.map((tag) => tag.name),
        vetted: formData.vetted,
        vip: formData.vip,
        can_receive_sms: formData.can_receive_sms,
        can_receive_email: formData.can_receive_email,
        property_type: formData.property_type.length > 0 ? formData.property_type : null,
        budget_min: formData.budget_min ? Number.parseFloat(formData.budget_min) : null,
        budget_max: formData.budget_max ? Number.parseFloat(formData.budget_max) : null,
        timeline: formData.timeline || null,
        source: formData.source || null,
        status: formData.status,
      }

      const { data, error } = await supabase.from("buyers").insert([insertData]).select()

      if (error) throw error

      // Reset form and close modal
      setFormData(initialFormData)
      onOpenChange(false)
      setActiveTab("basic")

      if (onSuccessAction) onSuccessAction?.()
    } catch (err: any) {
      console.error("Error adding buyer:", err)
      setError(err.message || "Failed to add buyer")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setFormData(initialFormData)
      setError("")
      setActiveTab("basic")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Buyer</DialogTitle>
          <DialogDescription>Enter the buyer's information. You can always edit these details later.</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Contact & Location
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Basic details about the buyer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fname">First Name</Label>
                    <Input
                      id="fname"
                      value={formData.fname}
                      onChange={(e) => handleInputChange("fname", e.target.value)}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lname">Last Name</Label>
                    <Input
                      id="lname"
                      value={formData.lname}
                      onChange={(e) => handleInputChange("lname", e.target.value)}
                      placeholder="Smith"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange("company", e.target.value)}
                      placeholder="ABC Investments"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="score">Score (0-100)</Label>
                  <Input
                    id="score"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.score}
                    onChange={(e) => handleInputChange("score", Number.parseInt(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Additional notes about this buyer..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Phone numbers and mailing address</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="phone">Primary Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone2">Secondary Phone</Label>
                    <Input
                      id="phone2"
                      value={formData.phone2}
                      onChange={(e) => handleInputChange("phone2", e.target.value)}
                      placeholder="(555) 987-6543"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone3">Third Phone</Label>
                    <Input
                      id="phone3"
                      value={formData.phone3}
                      onChange={(e) => handleInputChange("phone3", e.target.value)}
                      placeholder="(555) 555-5555"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="mailing_address">Mailing Address</Label>
                  <Input
                    id="mailing_address"
                    value={formData.mailing_address}
                    onChange={(e) => handleInputChange("mailing_address", e.target.value)}
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="mailing_city">City</Label>
                    <Input
                      id="mailing_city"
                      value={formData.mailing_city}
                      onChange={(e) => handleInputChange("mailing_city", e.target.value)}
                      placeholder="Atlanta"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mailing_state">State</Label>
                    <Input
                      id="mailing_state"
                      value={formData.mailing_state}
                      onChange={(e) => handleInputChange("mailing_state", e.target.value)}
                      placeholder="GA"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mailing_zip">ZIP Code</Label>
                    <Input
                      id="mailing_zip"
                      value={formData.mailing_zip}
                      onChange={(e) => handleInputChange("mailing_zip", e.target.value)}
                      placeholder="30309"
                    />
                  </div>
                </div>

                <div>
                  <Label>Target Locations</Label>
                  <LocationSelector
                    value={formData.locations}
                    onChange={(locations) => handleInputChange("locations", locations)}
                    placeholder="Add target locations..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Buyer Preferences</CardTitle>
                <CardDescription>Property preferences and buying criteria</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Property Types</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {PROPERTY_TYPES.map((type) => (
                      <Badge
                        key={type}
                        variant={formData.property_type.includes(type) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handlePropertyTypeToggle(type)}
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget_min">Budget Min ($)</Label>
                    <Input
                      id="budget_min"
                      type="number"
                      value={formData.budget_min}
                      onChange={(e) => handleInputChange("budget_min", e.target.value)}
                      placeholder="100000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="budget_max">Budget Max ($)</Label>
                    <Input
                      id="budget_max"
                      type="number"
                      value={formData.budget_max}
                      onChange={(e) => handleInputChange("budget_max", e.target.value)}
                      placeholder="500000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timeline">Timeline</Label>
                    <Select value={formData.timeline} onValueChange={(value) => handleInputChange("timeline", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timeline" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMELINES.map((timeline) => (
                          <SelectItem key={timeline} value={timeline}>
                            {timeline}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="source">Source</Label>
                    <Select value={formData.source} onValueChange={(value) => handleInputChange("source", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        {SOURCES.map((source) => (
                          <SelectItem key={source} value={source}>
                            {source}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Tags</Label>
                  <TagSelector
                    value={formData.tags}
                    onChange={(tags) => handleInputChange("tags", tags)}
                    placeholder="Add tags..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Buyer Settings</CardTitle>
                <CardDescription>Status and communication preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="vip">VIP Status</Label>
                      <p className="text-sm text-muted-foreground">Mark as VIP for priority treatment</p>
                    </div>
                    <Switch
                      id="vip"
                      checked={formData.vip}
                      onCheckedChange={(checked) => handleInputChange("vip", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="vetted">Vetted</Label>
                      <p className="text-sm text-muted-foreground">Buyer has been verified/vetted</p>
                    </div>
                    <Switch
                      id="vetted"
                      checked={formData.vetted}
                      onCheckedChange={(checked) => handleInputChange("vetted", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="can_receive_email">Can Receive Email</Label>
                      <p className="text-sm text-muted-foreground">Allow email communications</p>
                    </div>
                    <Switch
                      id="can_receive_email"
                      checked={formData.can_receive_email}
                      onCheckedChange={(checked) => handleInputChange("can_receive_email", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="can_receive_sms">Can Receive SMS</Label>
                      <p className="text-sm text-muted-foreground">Allow text message communications</p>
                    </div>
                    <Switch
                      id="can_receive_sms"
                      checked={formData.can_receive_sms}
                      onCheckedChange={(checked) => handleInputChange("can_receive_sms", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Buyer...
              </>
            ) : (
              "Add Buyer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
