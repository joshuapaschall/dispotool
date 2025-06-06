import { supabase } from "@/lib/supabase"
import type { Buyer, Tag, Group } from "@/lib/supabase"

export class BuyerService {
  // Get all buyers with optional filtering
  static async getBuyers(filters?: {
    search?: string
    tags?: string[]
    vip?: boolean
    vetted?: boolean
    minScore?: number
    maxScore?: number
  }) {
    let query = supabase.from("buyers").select("*").order("created_at", { ascending: false })

    // Apply filters
    if (filters?.search) {
      query = query.or(
        `fname.ilike.%${filters.search}%,lname.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`,
      )
    }

    if (filters?.vip !== undefined) {
      query = query.eq("vip", filters.vip)
    }

    if (filters?.vetted !== undefined) {
      query = query.eq("vetted", filters.vetted)
    }

    if (filters?.minScore) {
      query = query.gte("score", filters.minScore)
    }

    if (filters?.maxScore) {
      query = query.lte("score", filters.maxScore)
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps("tags", filters.tags)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching buyers:", error)
      throw error
    }

    return data as Buyer[]
  }

  // Get all tags
  static async getTags() {
    const { data, error } = await supabase.from("tags").select("*").order("name")

    if (error) {
      console.error("Error fetching tags:", error)
      throw error
    }

    return data as Tag[]
  }

  // Get all groups
  static async getGroups() {
    const { data, error } = await supabase.from("groups").select("*").order("name")

    if (error) {
      console.error("Error fetching groups:", error)
      throw error
    }

    return data as Group[]
  }

  // Add a new buyer
  static async addBuyer(buyer: Partial<Buyer>) {
    const { data, error } = await supabase.from("buyers").insert([buyer]).select().single()

    if (error) {
      console.error("Error adding buyer:", error)
      throw error
    }

    return data as Buyer
  }

  // Update a buyer
  static async updateBuyer(id: string, updates: Partial<Buyer>) {
    const { data, error } = await supabase.from("buyers").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("Error updating buyer:", error)
      throw error
    }

    return data as Buyer
  }

  // Delete a buyer
  static async deleteBuyer(id: string) {
    const { error } = await supabase.from("buyers").delete().eq("id", id)

    if (error) {
      console.error("Error deleting buyer:", error)
      throw error
    }
  }

  // Add buyers to a group
  static async addBuyersToGroup(buyerIds: string[], groupId: string) {
    const records = buyerIds.map((buyerId) => ({
      buyer_id: buyerId,
      group_id: groupId,
    }))

    const { error } = await supabase.from("buyer_groups").insert(records)

    if (error) {
      console.error("Error adding buyers to group:", error)
      throw error
    }
  }

  // Get buyers count by group
  static async getBuyerCountByGroup(groupId: string) {
    const { count, error } = await supabase
      .from("buyer_groups")
      .select("*", { count: "exact", head: true })
      .eq("group_id", groupId)

    if (error) {
      console.error("Error getting buyer count:", error)
      throw error
    }

    return count || 0
  }
}
