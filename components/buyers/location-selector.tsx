"use client"

import type React from "react"

import { useState, useRef } from "react"
import { X, Loader2, MapPin } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"

interface LocationSelectorProps {
  value: string[]
  onChange: (locations: string[]) => void
  placeholder?: string
  disabled?: boolean
}

// Helper function to format location suggestions
function formatPlace(prediction: any) {
  const desc = prediction.description
  const types = prediction.types || []
  const parts = desc.split(",").map((s: string) => s.trim())

  // State: "Georgia, USA" or "GA, USA"
  if (types.includes("administrative_area_level_1")) {
    const stateAbbr = parts[1] || parts[0]
    return `${stateAbbr}, USA`
  }

  // County: "Fulton County, GA, USA"
  if (types.includes("administrative_area_level_2") || desc.toLowerCase().includes("county")) {
    const county = parts[0]
    const stateAbbr = parts[1] || ""
    return `${county} (${stateAbbr})`
  }

  // City: "Atlanta, GA, USA"
  if (types.includes("locality") || types.includes("postal_town") || types.includes("sublocality")) {
    const city = parts[0]
    const stateAbbr = parts[1] || ""
    return `${city} (${stateAbbr})`
  }

  // Fallback: just show first two parts
  if (parts.length >= 2) {
    return `${parts[0]} (${parts[1]})`
  }

  // Last fallback: original
  return desc
}

export default function LocationSelector({
  value = [],
  onChange,
  placeholder = "Search or add locations...",
  disabled = false,
}: LocationSelectorProps) {
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Fetch location suggestions
  const fetchSuggestions = async (input: string) => {
    if (!input) {
      setSuggestions([])
      return
    }

    setIsLoading(true)

    try {
      // For demo purposes, we'll use a simplified approach without the actual Google Places API
      // In a real implementation, you would call the Google Places API here

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Generate some fake suggestions based on input
      const fakeSuggestions = [
        `${input} County, GA`,
        `${input}, GA`,
        `${input} City, FL`,
        `${input}ville, NC`,
        `${input} Township, PA`,
      ]

      setSuggestions(fakeSuggestions)
    } catch (err) {
      console.error("Error fetching location suggestions:", err)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  // Debounced fetch
  const debouncedFetch = (input: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(input)
    }, 500)
  }

  // Handle input change
  const handleInputChange = (input: string) => {
    setInputValue(input)

    if (input.length > 2) {
      debouncedFetch(input)
    } else {
      setSuggestions([])
    }
  }

  // Add a location
  const addLocation = (location: string) => {
    if (!value.includes(location)) {
      onChange([...value, location])
    }
    setInputValue("")
  }

  // Remove a location
  const removeLocation = (location: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(value.filter((l) => l !== location))
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1 p-1 border rounded-md min-h-10 items-center">
        {value.map((location) => (
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

        <Command className="w-full">
          <CommandInput
            placeholder={value.length ? "" : placeholder}
            value={inputValue}
            onValueChange={handleInputChange}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
            onFocus={() => setOpen(true)}
            className="border-0 focus:ring-0 p-0 h-8"
          />

          {open && inputValue && (
            <CommandList className="absolute z-10 w-full bg-white border rounded-md shadow-md mt-1 max-h-52 overflow-auto">
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2">Searching locations...</span>
                </div>
              ) : (
                <>
                  <CommandEmpty>
                    <div
                      className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted"
                      onClick={() => addLocation(inputValue)}
                    >
                      <span>Add "{inputValue}"</span>
                      <Badge variant="outline">Enter</Badge>
                    </div>
                  </CommandEmpty>

                  <CommandGroup>
                    {suggestions.map((suggestion, index) => (
                      <CommandItem
                        key={index}
                        onSelect={() => addLocation(suggestion)}
                        className="flex items-center cursor-pointer"
                      >
                        <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                        <span>{suggestion}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          )}
        </Command>
      </div>
    </div>
  )
}
