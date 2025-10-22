export type Setlist = {
  id: string
  owner_id: string | null
  title: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export type SetlistItem = {
  id: string
  setlist_id: string
  position: number
  song_title: string
  show_date?: string | null
  venue?: string | null
  city?: string | null
  source_item_id?: string | null
  track_filename?: string | null
  track_title?: string | null
  duration_seconds?: number | null
  segue: boolean
  notes?: string | null
}
