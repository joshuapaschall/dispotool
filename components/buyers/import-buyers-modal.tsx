"use client"

import type React from "react"

import { useState, useRef } from "react"
import Papa from "papaparse"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FileUp, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

// Field mapping definitions
const FIELD_MAPPINGS = [
  { db: "fname", label: "First Name" },
  { db: "lname", label: "Last Name" },
  { db: "email", label: "Email" },
  { db: "phone", label: "Phone 1" },
  { db: "phone2", label: "Phone 2" },
  { db: "phone3", label: "Phone 3" },
  { db: "company", label: "Company" },
  { db: "score", label: "Score", type: "number" },
  { db: "notes", label: "Notes" },
  { db: "mailing_address", label: "Mailing Address" },
  { db: "mailing_city", label: "Mailing City" },
  { db: "mailing_state", label: "Mailing State" },
  { db: "mailing_zip", label: "Mailing Zip" },
  { db: "locations", label: "Geotag/Locations", type: "array" },
  { db: "tags", label: "Tags", type: "array" },
  { db: "vetted", label: "Is Vetted?", type: "bool" },
  { db: "vip", label: "Is VIP?", type: "bool" },
  { db: "can_receive_sms", label: "Can Receive Text?", type: "bool" },
  { db: "can_receive_email", label: "Can Receive Email?", type: "bool" },
  { db: "property_type", label: "Property Types", type: "array" },
  { db: "budget_min", label: "Budget Min", type: "number" },
  { db: "budget_max", label: "Budget Max", type: "number" },
  { db: "timeline", label: "Timeline" },
  { db: "source", label: "Source" },
  { db: "status", label: "Status" },
]

// Helper functions for parsing data
function parseBoolean(val: any): boolean {
  if (typeof val === "boolean") return val
  if (typeof val !== "string") return false
  const v = val.trim().toLowerCase()
  return ["yes", "true", "1", "y", "t", "on"].includes(v)
}

function parseArray(val: any): string[] {
  if (!val) return []
  if (Array.isArray(val)) return val.filter(Boolean)

  return String(val)
    .split(/[,;|]/)
    .map((v: string) => v.trim())
    .filter(Boolean)
}

function parseNumber(val: any): number | null {
  if (val === null || val === undefined || val === "") return null
  const num = Number(val)
  return isNaN(num) ? null : num
}

interface ImportBuyersModalProps {
  onSuccess?: () => void
}

export default function ImportBuyersModal({ onSuccess }: ImportBuyersModalProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [csvRows, setCsvRows] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("")
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        console.log("Parsed CSV data:", res.data.slice(0, 3))
        setCsvRows(res.data)
        setHeaders(res.meta.fields || [])
        setStep(1)
      },
      error: (err) => {
        setError(`Failed to parse CSV file: ${err.message}`)
      },
    })
  }

  const handleMappingChange = (dbField: string, csvField: string) => {
    setMapping((prev) => ({ ...prev, [dbField]: csvField === "none" ? "" : csvField }))
  }

  const handleImport = async () => {
    setImporting(true)
    setImportProgress(0)
    setError("")

    try {
      console.log("Starting import with mapping:", mapping)

      const buyersToInsert = csvRows.map((row: any, index: number) => {
        const obj: Record<string, any> = {}

        console.log(`Processing row ${index}:`, row)

        FIELD_MAPPINGS.forEach(({ db, type }) => {
          const csvField = mapping[db]
          if (!csvField || csvField === "none") return

          let value = row[csvField]

          console.log(`Mapping ${db} from ${csvField}: "${value}" (type: ${type})`)

          if (type === "bool") {
            value = parseBoolean(value)
          } else if (type === "array") {
            value = parseArray(value)
            console.log(`Parsed array for ${db}:`, value)
          } else if (type === "number") {
            value = parseNumber(value)
          } else if (value !== undefined && value !== null) {
            value = String(value).trim()
          }

          obj[db] = value
        })

        // Ensure phone fields are strings
        ;["phone", "phone2", "phone3"].forEach((p) => {
          if (obj[p] && typeof obj[p] !== "string") {
            obj[p] = String(obj[p])
          }
        })

        // Set default values
        if (obj.score === null || obj.score === undefined) obj.score = 0
        if (!obj.status) obj.status = "lead"
        if (obj.vip === null || obj.vip === undefined) obj.vip = false
        if (obj.vetted === null || obj.vetted === undefined) obj.vetted = false
        if (obj.can_receive_email === null || obj.can_receive_email === undefined) obj.can_receive_email = true
        if (obj.can_receive_sms === null || obj.can_receive_sms === undefined) obj.can_receive_sms = true

        console.log(`Final object for row ${index}:`, obj)
        return obj
      })

      console.log("Buyers to insert:", buyersToInsert.slice(0, 2))

      // Insert buyers in batches
      const BATCH_SIZE = 50
      let insertedCount = 0

      for (let i = 0; i < buyersToInsert.length; i += BATCH_SIZE) {
        const batch = buyersToInsert.slice(i, i + BATCH_SIZE)

        console.log(`Inserting batch ${Math.floor(i / BATCH_SIZE) + 1}:`, batch.length, "buyers")

        const { data, error } = await supabase.from("buyers").insert(batch).select("id")

        if (error) {
          console.error("Insert error:", error)
          throw error
        }

        insertedCount += batch.length
        setImportProgress(Math.round((insertedCount / buyersToInsert.length) * 100))
      }

      // Reset state and close modal
      setStep(0)
      setCsvRows([])
      setMapping({})
      setOpen(false)

      if (onSuccess) onSuccess()
    } catch (err: any) {
      console.error("Import error:", err)
      setError(err.message || "Import failed")
    } finally {
      setImporting(false)
    }
  }

  const downloadTemplate = () => {
    const headers = FIELD_MAPPINGS.map((f) => f.label)
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "buyers_import_template.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <FileUp className="mr-2 h-4 w-4" /> Import Buyers
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {step === 0 ? (
          <>
            <DialogHeader>
              <DialogTitle>Import Buyers</DialogTitle>
              <DialogDescription>
                Upload a CSV file with your buyer data. You'll be able to map fields in the next step.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              <Card className="border-dashed border-2 border-green-300 bg-green-50/50 hover:bg-green-50 transition-colors cursor-pointer">
                <CardContent className="pt-6 text-center">
                  <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
                  <FileUp className="mx-auto h-12 w-12 text-green-600 mb-4" />
                  <h3 className="text-lg font-medium text-green-800 mb-2">Import Buyers from CSV</h3>
                  <p className="text-sm text-green-600 mb-6">
                    Drag CSV file here or click to browse • Supports: Name, Email, Phone, Tags, Locations
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Button
                      variant="outline"
                      className="border-green-300 text-green-700 hover:bg-green-100"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Select File
                    </Button>
                    <Button variant="ghost" className="text-green-600 hover:bg-green-100" onClick={downloadTemplate}>
                      Download Template
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Import {csvRows.length} Buyers</DialogTitle>
              <DialogDescription>Map your CSV columns to the correct fields.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Map CSV Columns</h3>

              <div className="border rounded-md">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-2 font-medium">App Field</th>
                      <th className="text-left p-2 font-medium">Your CSV Column</th>
                      <th className="text-left p-2 font-medium">Sample Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FIELD_MAPPINGS.map(({ db, label, type }) => (
                      <tr key={db} className="border-b last:border-0">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{label}</span>
                            {type && (
                              <Badge variant="outline" className="text-xs">
                                {type === "array" ? "list" : type}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-2">
                          <Select
                            value={mapping[db] || "none"}
                            onValueChange={(value) => handleMappingChange(db, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="-- Not mapped --" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">-- Not mapped --</SelectItem>
                              {headers.map((header) => (
                                <SelectItem key={header} value={header}>
                                  {header}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2 text-sm text-muted-foreground">
                          {mapping[db] && csvRows.length > 0 ? (
                            <span className="font-mono bg-muted px-2 py-1 rounded">
                              {String(csvRows[0][mapping[db]] || "").slice(0, 30)}
                              {String(csvRows[0][mapping[db]] || "").length > 30 ? "..." : ""}
                            </span>
                          ) : (
                            "No preview"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>
                  <strong>Note:</strong> For best results, map as many fields as possible. Tags and Locations should be
                  comma-separated values.
                </p>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {importing && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Importing buyers...</span>
                  <span>{importProgress}%</span>
                </div>
                <Progress value={importProgress} className="h-2" />
              </div>
            )}

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={importing}>
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={
                  importing || Object.keys(mapping).filter((k) => mapping[k] && mapping[k] !== "none").length === 0
                }
                className="bg-green-600 hover:bg-green-700"
              >
                {importing ? "Importing..." : `Import ${csvRows.length} Buyers`}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
