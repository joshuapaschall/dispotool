import { supabase } from "@/lib/supabase"

export interface Group {
  id: string
  name: string
  description?: string
  type?: string
  criteria?: any
  color?: string
  icon?: string
  created_at: string
}

export async function getGroups() {
  try {
    const { data, error } = await supabase.from("groups").select("*").order("name")

    if (error) throw error
    return data || []
  } catch (err) {
    console.error("Error fetching groups:", err)
    return []
  }
}

export async function createGroup(name: string, description?: string) {
  try {
    const { data, error } = await supabase
      .from("groups")
      .insert([{ name: name.trim(), description, type: "manual" }])
      .select()

    if (error) throw error
    return data?.[0] as Group
  } catch (err) {
    console.error("Error creating group:", err)
    throw err
  }
}

export async function getBuyerGroups(buyerId: string) {
  try {
    const { data, error } = await supabase.from("buyer_groups").select("group_id").eq("buyer_id", buyerId)

    if (error) throw error
    return (data || []).map((item) => item.group_id)
  } catch (err) {
    console.error("Error fetching buyer groups:", err)
    return []
  }
}

export async function addBuyersToGroups(buyerIds: string[], groupIds: string[]) {
  try {
    const entries = []

    for (const buyerId of buyerIds) {
      for (const groupId of groupIds) {
        entries.push({
          buyer_id: buyerId,
          group_id: groupId,
        })
      }
    }

    if (entries.length === 0) return

    const { error } = await supabase.from("buyer_groups").insert(entries)

    if (error) throw error
  } catch (err) {
    console.error("Error adding buyers to groups:", err)
    throw err
  }
}

export async function removeBuyerFromGroup(buyerId: string, groupId: string) {
  try {
    const { error } = await supabase.from("buyer_groups").delete().eq("buyer_id", buyerId).eq("group_id", groupId)

    if (error) throw error
  } catch (err) {
    console.error("Error removing buyer from group:", err)
    throw err
  }
}
