"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, X, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"

interface LocationFilterSelectorProps {
  selectedLocations: string[]
  onChange: (locations: string[]) => void
  placeholder?: string
}

export default function LocationFilterSelector({
  selectedLocations,
  onChange,
  placeholder = "Select locations...",
}: LocationFilterSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [availableLocations, setAvailableLocations] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Load unique locations from the database
  useEffect(() => {
    loadLocations()
  }, [])

  const loadLocations = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("buyers")
        .select("mailing_city, mailing_state, locations")
        .not("mailing_city", "is", null)

      if (error) throw error

      const locationSet = new Set<string>()

      data?.forEach((buyer) => {
        // Add city, state combinations
        if (buyer.mailing_city && buyer.mailing_state) {
          locationSet.add(`${buyer.mailing_city}, ${buyer.mailing_state}`)
        }
        if (buyer.mailing_city) {
          locationSet.add(buyer.mailing_city)
        }
        if (buyer.mailing_state) {
          locationSet.add(buyer.mailing_state)
        }

        // Add locations array items
        if (buyer.locations) {
          buyer.locations.forEach((loc: string) => locationSet.add(loc))
        }
      })

      setAvailableLocations(Array.from(locationSet).sort())
    } catch (err) {
      console.error("Error loading locations:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredLocations = availableLocations.filter((location) =>
    location.toLowerCase().includes(searchValue.toLowerCase()),
  )

  const toggleLocation = (location: string) => {
    if (selectedLocations.includes(location)) {
      onChange(selectedLocations.filter((l) => l !== location))
    } else {
      onChange([...selectedLocations, location])
    }
  }

  const removeLocation = (location: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(selectedLocations.filter((l) => l !== location))
  }

  const clearAll = () => {
    onChange([])
  }

  const addCustomLocation = () => {
    if (searchValue.trim() && !availableLocations.includes(searchValue.trim())) {
      const newLocation = searchValue.trim()
      setAvailableLocations((prev) => [...prev, newLocation].sort())
      onChange([...selectedLocations, newLocation])
      setSearchValue("")
    }
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            {selectedLocations.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <span>
                {selectedLocations.length} location{selectedLocations.length !== 1 ? "s" : ""} selected
              </span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search locations..." value={searchValue} onValueChange={setSearchValue} />
            <CommandList>
              <CommandEmpty>
                {searchValue.trim() ? (
                  <div
                    className="flex items-center justify-center p-2 cursor-pointer hover:bg-muted"
                    onClick={addCustomLocation}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Add "{searchValue}"
                  </div>
                ) : (
                  <div className="p-2 text-center">{loading ? "Loading locations..." : "No locations found"}</div>
                )}
              </CommandEmpty>
              <CommandGroup>
                {filteredLocations.map((location) => (
                  <CommandItem
                    key={location}
                    value={location}
                    onSelect={() => toggleLocation(location)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                      <span>{location}</span>
                    </div>
                    <Check
                      className={cn("mr-2 h-4 w-4", selectedLocations.includes(location) ? "opacity-100" : "opacity-0")}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected locations display */}
      {selectedLocations.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedLocations.map((location) => (
            <Badge
              key={location}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800"
            >
              <MapPin className="h-3 w-3" />
              {location}
              <X className="h-3 w-3 cursor-pointer" onClick={(e) => removeLocation(location, e)} />
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={clearAll} className="h-6 px-2 text-xs">
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
