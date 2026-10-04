export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_active: boolean
          name_ar: string
          name_en: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name_ar: string
          name_en: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name_ar?: string
          name_en?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      app_reports: {
        Row: {
          app_id: string | null
          contact_email: string | null
          created_at: string
          handled: boolean
          id: string
          message: string
        }
        Insert: {
          app_id?: string | null
          contact_email?: string | null
          created_at?: string
          handled?: boolean
          id?: string
          message: string
        }
        Update: {
          app_id?: string | null
          contact_email?: string | null
          created_at?: string
          handled?: boolean
          id?: string
          message?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_reports_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "egypt_apps"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          amount: number | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          currency: string | null
          id: string
          item_id: string
          item_name: string | null
          item_type: string
          paid_at: string | null
          requested_at: string
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          trip_id: string | null
          trip_item_id: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          currency?: string | null
          id?: string
          item_id: string
          item_name?: string | null
          item_type: string
          paid_at?: string | null
          requested_at?: string
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          trip_id?: string | null
          trip_item_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          currency?: string | null
          id?: string
          item_id?: string
          item_name?: string | null
          item_type?: string
          paid_at?: string | null
          requested_at?: string
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          trip_id?: string | null
          trip_item_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_trip_item_id_fkey"
            columns: ["trip_item_id"]
            isOneToOne: false
            referencedRelation: "trip_items"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          topic: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          topic?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          topic?: string | null
        }
        Relationships: []
      }
      content_translations: {
        Row: {
          created_at: string
          fields: Json
          lang: string
          row_id: string
          table_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          fields?: Json
          lang: string
          row_id: string
          table_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          fields?: Json
          lang?: string
          row_id?: string
          table_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      countries: {
        Row: {
          created_at: string | null
          currency: string | null
          data_class: string | null
          direct_flights: string[] | null
          governance_status: string
          has_egyptian_mission: boolean | null
          id: string
          iso2: string | null
          language: string | null
          mission_note: string | null
          name: string
          region: string | null
          slug: string
          source_owner: string | null
          source_status: string | null
          suggested_routes: string[] | null
          summary: string | null
          travellers_to_egypt: number | null
          updated_at: string | null
          verified_at: string | null
          visa_route: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          data_class?: string | null
          direct_flights?: string[] | null
          governance_status?: string
          has_egyptian_mission?: boolean | null
          id: string
          iso2?: string | null
          language?: string | null
          mission_note?: string | null
          name: string
          region?: string | null
          slug: string
          source_owner?: string | null
          source_status?: string | null
          suggested_routes?: string[] | null
          summary?: string | null
          travellers_to_egypt?: number | null
          updated_at?: string | null
          verified_at?: string | null
          visa_route?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          data_class?: string | null
          direct_flights?: string[] | null
          governance_status?: string
          has_egyptian_mission?: boolean | null
          id?: string
          iso2?: string | null
          language?: string | null
          mission_note?: string | null
          name?: string
          region?: string | null
          slug?: string
          source_owner?: string | null
          source_status?: string | null
          suggested_routes?: string[] | null
          summary?: string | null
          travellers_to_egypt?: number | null
          updated_at?: string | null
          verified_at?: string | null
          visa_route?: string | null
        }
        Relationships: []
      }
      crm_activity_log: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          item_id: string
          item_type: string
          note: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          item_id: string
          item_type: string
          note: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          item_id?: string
          item_type?: string
          note?: string
        }
        Relationships: []
      }
      crm_pipeline: {
        Row: {
          assigned_to: string | null
          created_at: string
          id: string
          item_id: string
          item_type: string
          priority: string
          stage: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          priority?: string
          stage?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          priority?: string
          stage?: string
          updated_at?: string
        }
        Relationships: []
      }
      destinations: {
        Row: {
          best_season: string | null
          category: string
          created_at: string | null
          data_class: string | null
          description: string | null
          governance_status: string
          governorate_slug: string
          id: string
          images: string[] | null
          lat: number | null
          lng: number | null
          name: string
          slug: string
          source_owner: string | null
          source_status: string | null
          summary: string | null
          tags: string[] | null
          updated_at: string | null
          verified_at: string | null
        }
        Insert: {
          best_season?: string | null
          category: string
          created_at?: string | null
          data_class?: string | null
          description?: string | null
          governance_status?: string
          governorate_slug: string
          id: string
          images?: string[] | null
          lat?: number | null
          lng?: number | null
          name: string
          slug: string
          source_owner?: string | null
          source_status?: string | null
          summary?: string | null
          tags?: string[] | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Update: {
          best_season?: string | null
          category?: string
          created_at?: string | null
          data_class?: string | null
          description?: string | null
          governance_status?: string
          governorate_slug?: string
          id?: string
          images?: string[] | null
          lat?: number | null
          lng?: number | null
          name?: string
          slug?: string
          source_owner?: string | null
          source_status?: string | null
          summary?: string | null
          tags?: string[] | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "destinations_governorate_slug_fkey"
            columns: ["governorate_slug"]
            isOneToOne: false
            referencedRelation: "governorates"
            referencedColumns: ["slug"]
          },
        ]
      }
      egypt_apps: {
        Row: {
          app_store_url: string | null
          app_type: string
          category_id: string
          created_at: string
          description_ar: string | null
          description_en: string | null
          google_play_url: string | null
          governance_status: string | null
          id: string
          internal_notes: string | null
          is_active: boolean
          is_featured: boolean
          last_link_check: string | null
          last_verified_at: string
          name_ar: string
          name_en: string
          publisher: string | null
          sort_order: number
          status: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          app_store_url?: string | null
          app_type: string
          category_id: string
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          google_play_url?: string | null
          governance_status?: string | null
          id?: string
          internal_notes?: string | null
          is_active?: boolean
          is_featured?: boolean
          last_link_check?: string | null
          last_verified_at?: string
          name_ar: string
          name_en: string
          publisher?: string | null
          sort_order?: number
          status?: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          app_store_url?: string | null
          app_type?: string
          category_id?: string
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          google_play_url?: string | null
          governance_status?: string | null
          id?: string
          internal_notes?: string | null
          is_active?: boolean
          is_featured?: boolean
          last_link_check?: string | null
          last_verified_at?: string
          name_ar?: string
          name_en?: string
          publisher?: string | null
          sort_order?: number
          status?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "egypt_apps_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "app_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_categories: {
        Row: {
          color: string | null
          created_at: string
          id: string
          is_active: boolean
          name_ar: string
          name_en: string
          slug: string
          sort_order: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name_ar: string
          name_en: string
          slug: string
          sort_order?: number
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name_ar?: string
          name_en?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      emergency_numbers: {
        Row: {
          availability: string | null
          availability_ar: string | null
          availability_en: string | null
          category_id: string
          created_at: string
          dial_string: string
          governance_status: string | null
          id: string
          is_active: boolean
          is_primary: boolean
          last_verified_at: string
          name_ar: string
          name_en: string
          notes: string | null
          number: string
          public_note_ar: string | null
          public_note_en: string | null
          sort_order: number
          source_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          availability?: string | null
          availability_ar?: string | null
          availability_en?: string | null
          category_id: string
          created_at?: string
          dial_string: string
          governance_status?: string | null
          id?: string
          is_active?: boolean
          is_primary?: boolean
          last_verified_at?: string
          name_ar: string
          name_en: string
          notes?: string | null
          number: string
          public_note_ar?: string | null
          public_note_en?: string | null
          sort_order?: number
          source_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          availability?: string | null
          availability_ar?: string | null
          availability_en?: string | null
          category_id?: string
          created_at?: string
          dial_string?: string
          governance_status?: string | null
          id?: string
          is_active?: boolean
          is_primary?: boolean
          last_verified_at?: string
          name_ar?: string
          name_en?: string
          notes?: string | null
          number?: string
          public_note_ar?: string | null
          public_note_en?: string | null
          sort_order?: number
          source_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_numbers_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "emergency_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_reports: {
        Row: {
          contact_email: string | null
          created_at: string
          handled: boolean
          id: string
          message: string
          number_id: string | null
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          handled?: boolean
          id?: string
          message: string
          number_id?: string | null
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          handled?: boolean
          id?: string
          message?: string
          number_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_reports_number_id_fkey"
            columns: ["number_id"]
            isOneToOne: false
            referencedRelation: "emergency_numbers"
            referencedColumns: ["id"]
          },
        ]
      }
      eras: {
        Row: {
          colour: string | null
          created_at: string | null
          data_class: string | null
          from_period: string | null
          governance_status: string
          key: string
          monuments: string[] | null
          museums: string[] | null
          name: string
          rulers: string[] | null
          source_owner: string | null
          source_status: string | null
          summary: string | null
          to_period: string | null
          updated_at: string | null
          verified_at: string | null
        }
        Insert: {
          colour?: string | null
          created_at?: string | null
          data_class?: string | null
          from_period?: string | null
          governance_status?: string
          key: string
          monuments?: string[] | null
          museums?: string[] | null
          name: string
          rulers?: string[] | null
          source_owner?: string | null
          source_status?: string | null
          summary?: string | null
          to_period?: string | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Update: {
          colour?: string | null
          created_at?: string | null
          data_class?: string | null
          from_period?: string | null
          governance_status?: string
          key?: string
          monuments?: string[] | null
          museums?: string[] | null
          name?: string
          rulers?: string[] | null
          source_owner?: string | null
          source_status?: string | null
          summary?: string | null
          to_period?: string | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          category: string | null
          created_at: string | null
          data_class: string | null
          description: string | null
          end_date: string | null
          governance_status: string
          governorate_slug: string
          id: string
          images: string[] | null
          languages: string[] | null
          name: string
          organiser: string | null
          slug: string
          source_owner: string | null
          source_status: string | null
          start_date: string | null
          summary: string | null
          tags: string[] | null
          ticketed: boolean | null
          updated_at: string | null
          venue: string | null
          verified_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          data_class?: string | null
          description?: string | null
          end_date?: string | null
          governance_status?: string
          governorate_slug: string
          id: string
          images?: string[] | null
          languages?: string[] | null
          name: string
          organiser?: string | null
          slug: string
          source_owner?: string | null
          source_status?: string | null
          start_date?: string | null
          summary?: string | null
          tags?: string[] | null
          ticketed?: boolean | null
          updated_at?: string | null
          venue?: string | null
          verified_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          data_class?: string | null
          description?: string | null
          end_date?: string | null
          governance_status?: string
          governorate_slug?: string
          id?: string
          images?: string[] | null
          languages?: string[] | null
          name?: string
          organiser?: string | null
          slug?: string
          source_owner?: string | null
          source_status?: string | null
          start_date?: string | null
          summary?: string | null
          tags?: string[] | null
          ticketed?: boolean | null
          updated_at?: string | null
          venue?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_governorate_slug_fkey"
            columns: ["governorate_slug"]
            isOneToOne: false
            referencedRelation: "governorates"
            referencedColumns: ["slug"]
          },
        ]
      }
      government_entities: {
        Row: {
          category_ar: string
          category_en: string
          created_at: string
          description_en: string | null
          entity_name_ar: string | null
          entity_name_en: string
          id: string
          official_url: string | null
          sort_order: number
          updated_at: string
          verification_status: string
        }
        Insert: {
          category_ar: string
          category_en: string
          created_at?: string
          description_en?: string | null
          entity_name_ar?: string | null
          entity_name_en: string
          id?: string
          official_url?: string | null
          sort_order?: number
          updated_at?: string
          verification_status?: string
        }
        Update: {
          category_ar?: string
          category_en?: string
          created_at?: string
          description_en?: string | null
          entity_name_ar?: string | null
          entity_name_en?: string
          id?: string
          official_url?: string | null
          sort_order?: number
          updated_at?: string
          verification_status?: string
        }
        Relationships: []
      }
      governorate_areas: {
        Row: {
          created_at: string | null
          data_class: string | null
          description: string | null
          governance_status: string
          governorate_slug: string
          id: string
          images: string[] | null
          name: string
          name_ar: string | null
          slug: string
          source_status: string | null
          summary: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_class?: string | null
          description?: string | null
          governance_status?: string
          governorate_slug: string
          id: string
          images?: string[] | null
          name: string
          name_ar?: string | null
          slug: string
          source_status?: string | null
          summary?: string | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_class?: string | null
          description?: string | null
          governance_status?: string
          governorate_slug?: string
          id?: string
          images?: string[] | null
          name?: string
          name_ar?: string | null
          slug?: string
          source_status?: string | null
          summary?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "governorate_areas_governorate_slug_fkey"
            columns: ["governorate_slug"]
            isOneToOne: false
            referencedRelation: "governorates"
            referencedColumns: ["slug"]
          },
        ]
      }
      governorate_content_import: {
        Row: {
          famous_clothing: string[] | null
          famous_food: string[] | null
          flag_image_url: string | null
          highlights: string[] | null
          history: string | null
          images: string[] | null
          target_id: string
          target_table: string
        }
        Insert: {
          famous_clothing?: string[] | null
          famous_food?: string[] | null
          flag_image_url?: string | null
          highlights?: string[] | null
          history?: string | null
          images?: string[] | null
          target_id: string
          target_table: string
        }
        Update: {
          famous_clothing?: string[] | null
          famous_food?: string[] | null
          flag_image_url?: string | null
          highlights?: string[] | null
          history?: string | null
          images?: string[] | null
          target_id?: string
          target_table?: string
        }
        Relationships: []
      }
      governorates: {
        Row: {
          annual_visitors: number | null
          area_km2: number | null
          capital: string
          cities: string[] | null
          code: string
          crafts: string[] | null
          created_at: string | null
          cuisine: string[] | null
          data_class: string | null
          famous_clothing: string[] | null
          famous_food: string[] | null
          flag_image_url: string | null
          governance_status: string
          guides: number | null
          has_coast: boolean | null
          has_nile: boolean | null
          heritage_eras: string[] | null
          heritage_sites: number | null
          highlights: string[] | null
          history: string | null
          hotels: number | null
          id: string
          investment_sectors: string[] | null
          lat: number | null
          lng: number | null
          name: string
          name_ar: string
          nature: string[] | null
          occupancy_pct: number | null
          population_m: number | null
          region: string
          slug: string
          source_owner: string | null
          source_status: string | null
          summary: string | null
          updated_at: string | null
          verified_at: string | null
        }
        Insert: {
          annual_visitors?: number | null
          area_km2?: number | null
          capital: string
          cities?: string[] | null
          code: string
          crafts?: string[] | null
          created_at?: string | null
          cuisine?: string[] | null
          data_class?: string | null
          famous_clothing?: string[] | null
          famous_food?: string[] | null
          flag_image_url?: string | null
          governance_status?: string
          guides?: number | null
          has_coast?: boolean | null
          has_nile?: boolean | null
          heritage_eras?: string[] | null
          heritage_sites?: number | null
          highlights?: string[] | null
          history?: string | null
          hotels?: number | null
          id: string
          investment_sectors?: string[] | null
          lat?: number | null
          lng?: number | null
          name: string
          name_ar: string
          nature?: string[] | null
          occupancy_pct?: number | null
          population_m?: number | null
          region: string
          slug: string
          source_owner?: string | null
          source_status?: string | null
          summary?: string | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Update: {
          annual_visitors?: number | null
          area_km2?: number | null
          capital?: string
          cities?: string[] | null
          code?: string
          crafts?: string[] | null
          created_at?: string | null
          cuisine?: string[] | null
          data_class?: string | null
          famous_clothing?: string[] | null
          famous_food?: string[] | null
          flag_image_url?: string | null
          governance_status?: string
          guides?: number | null
          has_coast?: boolean | null
          has_nile?: boolean | null
          heritage_eras?: string[] | null
          heritage_sites?: number | null
          highlights?: string[] | null
          history?: string | null
          hotels?: number | null
          id?: string
          investment_sectors?: string[] | null
          lat?: number | null
          lng?: number | null
          name?: string
          name_ar?: string
          nature?: string[] | null
          occupancy_pct?: number | null
          population_m?: number | null
          region?: string
          slug?: string
          source_owner?: string | null
          source_status?: string | null
          summary?: string | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      heritage_sites: {
        Row: {
          academic_references: string[] | null
          access: string | null
          accessibility: string[] | null
          classification: string | null
          created_at: string | null
          data_class: string | null
          description: string | null
          era: string
          governance_status: string
          governorate_slug: string
          hidden: boolean | null
          id: string
          images: string[] | null
          lat: number | null
          lng: number | null
          name: string
          related_figures: string[] | null
          restoration_status: string | null
          slug: string
          source_owner: string | null
          source_status: string | null
          summary: string | null
          tags: string[] | null
          updated_at: string | null
          verified_at: string | null
        }
        Insert: {
          academic_references?: string[] | null
          access?: string | null
          accessibility?: string[] | null
          classification?: string | null
          created_at?: string | null
          data_class?: string | null
          description?: string | null
          era: string
          governance_status?: string
          governorate_slug: string
          hidden?: boolean | null
          id: string
          images?: string[] | null
          lat?: number | null
          lng?: number | null
          name: string
          related_figures?: string[] | null
          restoration_status?: string | null
          slug: string
          source_owner?: string | null
          source_status?: string | null
          summary?: string | null
          tags?: string[] | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Update: {
          academic_references?: string[] | null
          access?: string | null
          accessibility?: string[] | null
          classification?: string | null
          created_at?: string | null
          data_class?: string | null
          description?: string | null
          era?: string
          governance_status?: string
          governorate_slug?: string
          hidden?: boolean | null
          id?: string
          images?: string[] | null
          lat?: number | null
          lng?: number | null
          name?: string
          related_figures?: string[] | null
          restoration_status?: string | null
          slug?: string
          source_owner?: string | null
          source_status?: string | null
          summary?: string | null
          tags?: string[] | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "heritage_sites_governorate_slug_fkey"
            columns: ["governorate_slug"]
            isOneToOne: false
            referencedRelation: "governorates"
            referencedColumns: ["slug"]
          },
        ]
      }
      heritage_worldwide: {
        Row: {
          country: string | null
          created_at: string | null
          data_class: string | null
          description: string | null
          era: string | null
          governance_status: string
          id: string
          images: string[] | null
          institution: string | null
          name: string
          object: string | null
          provenance_note: string | null
          slug: string
          source_owner: string | null
          source_status: string | null
          summary: string | null
          tags: string[] | null
          updated_at: string | null
          verified_at: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          data_class?: string | null
          description?: string | null
          era?: string | null
          governance_status?: string
          id: string
          images?: string[] | null
          institution?: string | null
          name: string
          object?: string | null
          provenance_note?: string | null
          slug: string
          source_owner?: string | null
          source_status?: string | null
          summary?: string | null
          tags?: string[] | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          data_class?: string | null
          description?: string | null
          era?: string | null
          governance_status?: string
          id?: string
          images?: string[] | null
          institution?: string | null
          name?: string
          object?: string | null
          provenance_note?: string | null
          slug?: string
          source_owner?: string | null
          source_status?: string | null
          summary?: string | null
          tags?: string[] | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "heritage_worldwide_era_fkey"
            columns: ["era"]
            isOneToOne: false
            referencedRelation: "eras"
            referencedColumns: ["key"]
          },
        ]
      }
      investment_opportunities: {
        Row: {
          competent_entity: string | null
          created_at: string | null
          data_class: string | null
          demand_signals: string[] | null
          description: string | null
          documents: Json | null
          governance_status: string
          governorate_slug: string | null
          id: string
          investment_max_usd: number | null
          investment_min_usd: number | null
          land_requirement_ha: number | null
          last_submitted_at: string | null
          moderation_state: string
          name: string
          restrictions: string[] | null
          risks: string[] | null
          sector: string | null
          slug: string
          source_owner: string | null
          source_status: string | null
          stage: string | null
          summary: string | null
          updated_at: string | null
          verified_at: string | null
        }
        Insert: {
          competent_entity?: string | null
          created_at?: string | null
          data_class?: string | null
          demand_signals?: string[] | null
          description?: string | null
          documents?: Json | null
          governance_status?: string
          governorate_slug?: string | null
          id: string
          investment_max_usd?: number | null
          investment_min_usd?: number | null
          land_requirement_ha?: number | null
          last_submitted_at?: string | null
          moderation_state?: string
          name: string
          restrictions?: string[] | null
          risks?: string[] | null
          sector?: string | null
          slug: string
          source_owner?: string | null
          source_status?: string | null
          stage?: string | null
          summary?: string | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Update: {
          competent_entity?: string | null
          created_at?: string | null
          data_class?: string | null
          demand_signals?: string[] | null
          description?: string | null
          documents?: Json | null
          governance_status?: string
          governorate_slug?: string | null
          id?: string
          investment_max_usd?: number | null
          investment_min_usd?: number | null
          land_requirement_ha?: number | null
          last_submitted_at?: string | null
          moderation_state?: string
          name?: string
          restrictions?: string[] | null
          risks?: string[] | null
          sector?: string | null
          slug?: string
          source_owner?: string | null
          source_status?: string | null
          stage?: string | null
          summary?: string | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investment_opportunities_governorate_slug_fkey"
            columns: ["governorate_slug"]
            isOneToOne: false
            referencedRelation: "governorates"
            referencedColumns: ["slug"]
          },
        ]
      }
      legal_document_versions: {
        Row: {
          approval_status: string
          change_note: string | null
          content: Json | null
          created_at: string
          effective_date: string
          id: string
          language: string
          owner: string
          slug: string
          title: string
          updated_date: string
          version: string
        }
        Insert: {
          approval_status?: string
          change_note?: string | null
          content?: Json | null
          created_at?: string
          effective_date: string
          id?: string
          language?: string
          owner: string
          slug: string
          title: string
          updated_date: string
          version: string
        }
        Update: {
          approval_status?: string
          change_note?: string | null
          content?: Json | null
          created_at?: string
          effective_date?: string
          id?: string
          language?: string
          owner?: string
          slug?: string
          title?: string
          updated_date?: string
          version?: string
        }
        Relationships: []
      }
      museums: {
        Row: {
          access: string | null
          collections_count: number | null
          created_at: string | null
          data_class: string | null
          description: string | null
          governance_status: string
          governorate_slug: string
          highlights: string[] | null
          id: string
          images: string[] | null
          name: string
          opened: string | null
          slug: string
          source_owner: string | null
          source_status: string | null
          summary: string | null
          tags: string[] | null
          updated_at: string | null
          verified_at: string | null
        }
        Insert: {
          access?: string | null
          collections_count?: number | null
          created_at?: string | null
          data_class?: string | null
          description?: string | null
          governance_status?: string
          governorate_slug: string
          highlights?: string[] | null
          id: string
          images?: string[] | null
          name: string
          opened?: string | null
          slug: string
          source_owner?: string | null
          source_status?: string | null
          summary?: string | null
          tags?: string[] | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Update: {
          access?: string | null
          collections_count?: number | null
          created_at?: string | null
          data_class?: string | null
          description?: string | null
          governance_status?: string
          governorate_slug?: string
          highlights?: string[] | null
          id?: string
          images?: string[] | null
          name?: string
          opened?: string | null
          slug?: string
          source_owner?: string | null
          source_status?: string | null
          summary?: string | null
          tags?: string[] | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "museums_governorate_slug_fkey"
            columns: ["governorate_slug"]
            isOneToOne: false
            referencedRelation: "governorates"
            referencedColumns: ["slug"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      offers: {
        Row: {
          created_at: string | null
          data_class: string | null
          description: string | null
          governance_status: string
          id: string
          images: string[] | null
          kind: string | null
          name: string
          slug: string
          source_owner: string | null
          source_status: string | null
          summary: string | null
          tags: string[] | null
          updated_at: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_class?: string | null
          description?: string | null
          governance_status?: string
          id: string
          images?: string[] | null
          kind?: string | null
          name: string
          slug: string
          source_owner?: string | null
          source_status?: string | null
          summary?: string | null
          tags?: string[] | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_class?: string | null
          description?: string | null
          governance_status?: string
          id?: string
          images?: string[] | null
          kind?: string | null
          name?: string
          slug?: string
          source_owner?: string | null
          source_status?: string | null
          summary?: string | null
          tags?: string[] | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      partner_applications: {
        Row: {
          authorization_doc_path: string | null
          company_name: string
          created_at: string
          description: string | null
          email: string
          flagged_docs: string[]
          full_name: string
          id: string
          partnership_type: string
          registration_doc_path: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string | null
          verification_note: string | null
          verification_status: string
        }
        Insert: {
          authorization_doc_path?: string | null
          company_name: string
          created_at?: string
          description?: string | null
          email: string
          flagged_docs?: string[]
          full_name: string
          id?: string
          partnership_type: string
          registration_doc_path?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string | null
          verification_note?: string | null
          verification_status?: string
        }
        Update: {
          authorization_doc_path?: string | null
          company_name?: string
          created_at?: string
          description?: string | null
          email?: string
          flagged_docs?: string[]
          full_name?: string
          id?: string
          partnership_type?: string
          registration_doc_path?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string | null
          verification_note?: string | null
          verification_status?: string
        }
        Relationships: []
      }
      partner_assignments: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_type: string
          partner_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          partner_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          partner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_assignments_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          active: boolean
          contact_email: string | null
          created_at: string
          id: string
          org_name: string
          partner_type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          active?: boolean
          contact_email?: string | null
          created_at?: string
          id?: string
          org_name: string
          partner_type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean
          contact_email?: string | null
          created_at?: string
          id?: string
          org_name?: string
          partner_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          collection: string | null
          created_at: string | null
          data_class: string | null
          description: string | null
          governance_status: string
          governorate_slug: string
          id: string
          images: string[] | null
          maker: string | null
          name: string
          price_egp: number | null
          slug: string
          source_owner: string | null
          source_status: string | null
          summary: string | null
          tags: string[] | null
          updated_at: string | null
          verified_at: string | null
        }
        Insert: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          data_class?: string | null
          description?: string | null
          governance_status?: string
          governorate_slug: string
          id: string
          images?: string[] | null
          maker?: string | null
          name: string
          price_egp?: number | null
          slug: string
          source_owner?: string | null
          source_status?: string | null
          summary?: string | null
          tags?: string[] | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Update: {
          category?: string | null
          collection?: string | null
          created_at?: string | null
          data_class?: string | null
          description?: string | null
          governance_status?: string
          governorate_slug?: string
          id?: string
          images?: string[] | null
          maker?: string | null
          name?: string
          price_egp?: number | null
          slug?: string
          source_owner?: string | null
          source_status?: string | null
          summary?: string | null
          tags?: string[] | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_governorate_slug_fkey"
            columns: ["governorate_slug"]
            isOneToOne: false
            referencedRelation: "governorates"
            referencedColumns: ["slug"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type: string
          avatar_url: string | null
          country: string | null
          created_at: string
          email: string | null
          emergency_contact: string | null
          full_name: string | null
          id: string
          points: number
          preferred_language: string | null
          tier: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          account_type?: string
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          emergency_contact?: string | null
          full_name?: string | null
          id: string
          points?: number
          preferred_language?: string | null
          tier?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          account_type?: string
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          emergency_contact?: string | null
          full_name?: string | null
          id?: string
          points?: number
          preferred_language?: string | null
          tier?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          area_m2: number | null
          city: string | null
          created_at: string | null
          data_class: string | null
          description: string | null
          governance_status: string
          governorate_slug: string
          id: string
          images: string[] | null
          last_submitted_at: string | null
          moderation_state: string
          name: string
          price_usd: number | null
          property_type: string | null
          slug: string
          source_owner: string | null
          source_status: string | null
          summary: string | null
          tags: string[] | null
          updated_at: string | null
          verified_at: string | null
        }
        Insert: {
          area_m2?: number | null
          city?: string | null
          created_at?: string | null
          data_class?: string | null
          description?: string | null
          governance_status?: string
          governorate_slug: string
          id: string
          images?: string[] | null
          last_submitted_at?: string | null
          moderation_state?: string
          name: string
          price_usd?: number | null
          property_type?: string | null
          slug: string
          source_owner?: string | null
          source_status?: string | null
          summary?: string | null
          tags?: string[] | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Update: {
          area_m2?: number | null
          city?: string | null
          created_at?: string | null
          data_class?: string | null
          description?: string | null
          governance_status?: string
          governorate_slug?: string
          id?: string
          images?: string[] | null
          last_submitted_at?: string | null
          moderation_state?: string
          name?: string
          price_usd?: number | null
          property_type?: string | null
          slug?: string
          source_owner?: string | null
          source_status?: string | null
          summary?: string | null
          tags?: string[] | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_governorate_slug_fkey"
            columns: ["governorate_slug"]
            isOneToOne: false
            referencedRelation: "governorates"
            referencedColumns: ["slug"]
          },
        ]
      }
      providers: {
        Row: {
          accessibility: string[] | null
          amenities: string[] | null
          availability: string[] | null
          created_at: string | null
          currency: string | null
          data_class: string | null
          demo_verification_label: string | null
          governance_status: string
          governorate_slug: string
          id: string
          images: string[] | null
          languages: string[] | null
          licence_ref: string | null
          name: string
          price_from: number | null
          rating: number | null
          review_count: number | null
          slug: string
          source_owner: string | null
          source_status: string | null
          specialties: string[] | null
          summary: string | null
          type: string
          updated_at: string | null
          verified_at: string | null
        }
        Insert: {
          accessibility?: string[] | null
          amenities?: string[] | null
          availability?: string[] | null
          created_at?: string | null
          currency?: string | null
          data_class?: string | null
          demo_verification_label?: string | null
          governance_status?: string
          governorate_slug: string
          id: string
          images?: string[] | null
          languages?: string[] | null
          licence_ref?: string | null
          name: string
          price_from?: number | null
          rating?: number | null
          review_count?: number | null
          slug: string
          source_owner?: string | null
          source_status?: string | null
          specialties?: string[] | null
          summary?: string | null
          type: string
          updated_at?: string | null
          verified_at?: string | null
        }
        Update: {
          accessibility?: string[] | null
          amenities?: string[] | null
          availability?: string[] | null
          created_at?: string | null
          currency?: string | null
          data_class?: string | null
          demo_verification_label?: string | null
          governance_status?: string
          governorate_slug?: string
          id?: string
          images?: string[] | null
          languages?: string[] | null
          licence_ref?: string | null
          name?: string
          price_from?: number | null
          rating?: number | null
          review_count?: number | null
          slug?: string
          source_owner?: string | null
          source_status?: string | null
          specialties?: string[] | null
          summary?: string | null
          type?: string
          updated_at?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "providers_governorate_slug_fkey"
            columns: ["governorate_slug"]
            isOneToOne: false
            referencedRelation: "governorates"
            referencedColumns: ["slug"]
          },
        ]
      }
      research_programs: {
        Row: {
          created_at: string | null
          data_class: string | null
          degree: string | null
          description: string | null
          field: string | null
          governance_status: string
          governorate_slug: string | null
          id: string
          images: string[] | null
          languages: string[] | null
          name: string
          slug: string
          source_owner: string | null
          source_status: string | null
          summary: string | null
          tags: string[] | null
          university: string | null
          updated_at: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_class?: string | null
          degree?: string | null
          description?: string | null
          field?: string | null
          governance_status?: string
          governorate_slug?: string | null
          id: string
          images?: string[] | null
          languages?: string[] | null
          name: string
          slug: string
          source_owner?: string | null
          source_status?: string | null
          summary?: string | null
          tags?: string[] | null
          university?: string | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_class?: string | null
          degree?: string | null
          description?: string | null
          field?: string | null
          governance_status?: string
          governorate_slug?: string | null
          id?: string
          images?: string[] | null
          languages?: string[] | null
          name?: string
          slug?: string
          source_owner?: string | null
          source_status?: string | null
          summary?: string | null
          tags?: string[] | null
          university?: string | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_programs_governorate_slug_fkey"
            columns: ["governorate_slug"]
            isOneToOne: false
            referencedRelation: "governorates"
            referencedColumns: ["slug"]
          },
        ]
      }
      rulers: {
        Row: {
          achievements: string[] | null
          created_at: string | null
          data_class: string | null
          dynasty: string | null
          era: string | null
          governance_status: string
          id: string
          monuments: string[] | null
          name: string
          reign: string | null
          slug: string
          source_owner: string | null
          source_status: string | null
          summary: string | null
          updated_at: string | null
          verified_at: string | null
        }
        Insert: {
          achievements?: string[] | null
          created_at?: string | null
          data_class?: string | null
          dynasty?: string | null
          era?: string | null
          governance_status?: string
          id: string
          monuments?: string[] | null
          name: string
          reign?: string | null
          slug: string
          source_owner?: string | null
          source_status?: string | null
          summary?: string | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Update: {
          achievements?: string[] | null
          created_at?: string | null
          data_class?: string | null
          dynasty?: string | null
          era?: string | null
          governance_status?: string
          id?: string
          monuments?: string[] | null
          name?: string
          reign?: string | null
          slug?: string
          source_owner?: string | null
          source_status?: string | null
          summary?: string | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rulers_era_fkey"
            columns: ["era"]
            isOneToOne: false
            referencedRelation: "eras"
            referencedColumns: ["key"]
          },
        ]
      }
      saved_items: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_image: string | null
          item_name: string | null
          item_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_image?: string | null
          item_name?: string | null
          item_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_image?: string | null
          item_name?: string | null
          item_type?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      traveller_stories: {
        Row: {
          country: string | null
          created_at: string | null
          data_class: string | null
          description: string | null
          destinations: string[] | null
          governance_status: string
          group_type: string | null
          id: string
          images: string[] | null
          media_type: string | null
          moderation_state: string | null
          name: string
          negatives: string[] | null
          positives: string[] | null
          rating: number | null
          slug: string
          source_owner: string | null
          source_status: string | null
          suggestions: string[] | null
          summary: string | null
          tags: string[] | null
          updated_at: string | null
          verified_at: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          data_class?: string | null
          description?: string | null
          destinations?: string[] | null
          governance_status?: string
          group_type?: string | null
          id: string
          images?: string[] | null
          media_type?: string | null
          moderation_state?: string | null
          name: string
          negatives?: string[] | null
          positives?: string[] | null
          rating?: number | null
          slug: string
          source_owner?: string | null
          source_status?: string | null
          suggestions?: string[] | null
          summary?: string | null
          tags?: string[] | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          data_class?: string | null
          description?: string | null
          destinations?: string[] | null
          governance_status?: string
          group_type?: string | null
          id?: string
          images?: string[] | null
          media_type?: string | null
          moderation_state?: string | null
          name?: string
          negatives?: string[] | null
          positives?: string[] | null
          rating?: number | null
          slug?: string
          source_owner?: string | null
          source_status?: string | null
          suggestions?: string[] | null
          summary?: string | null
          tags?: string[] | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      trip_days: {
        Row: {
          created_at: string
          date: string | null
          day_number: number
          id: string
          notes: string | null
          trip_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date?: string | null
          day_number: number
          id?: string
          notes?: string | null
          trip_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string | null
          day_number?: number
          id?: string
          notes?: string | null
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_days_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_items: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_image: string | null
          item_name: string | null
          item_type: string
          notes: string | null
          position: number
          trip_day_id: string | null
          trip_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_image?: string | null
          item_name?: string | null
          item_type: string
          notes?: string | null
          position?: number
          trip_day_id?: string | null
          trip_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_image?: string | null
          item_name?: string | null
          item_type?: string
          notes?: string | null
          position?: number
          trip_day_id?: string | null
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_items_trip_day_id_fkey"
            columns: ["trip_day_id"]
            isOneToOne: false
            referencedRelation: "trip_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_items_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          trip_id: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          trip_id: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          trip_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_reviews_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          cover_image: string | null
          cover_key: string | null
          created_at: string
          destination: string
          end_date: string | null
          id: string
          live_stage: string | null
          points_earned: number
          price_usd: number
          progress: number
          reference: string
          start_date: string | null
          status: string
          title: string
          travellers: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_image?: string | null
          cover_key?: string | null
          created_at?: string
          destination?: string
          end_date?: string | null
          id?: string
          live_stage?: string | null
          points_earned?: number
          price_usd?: number
          progress?: number
          reference?: string
          start_date?: string | null
          status?: string
          title: string
          travellers?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_image?: string | null
          cover_key?: string | null
          created_at?: string
          destination?: string
          end_date?: string | null
          id?: string
          live_stage?: string | null
          points_earned?: number
          price_usd?: number
          progress?: number
          reference?: string
          start_date?: string | null
          status?: string
          title?: string
          travellers?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_consents: {
        Row: {
          consent_type: string
          created_at: string
          granted_at: string | null
          id: string
          locale: string | null
          policy_slug: string | null
          policy_version: string | null
          status: string
          updated_at: string
          user_agent: string | null
          user_id: string
          withdrawn_at: string | null
        }
        Insert: {
          consent_type: string
          created_at?: string
          granted_at?: string | null
          id?: string
          locale?: string | null
          policy_slug?: string | null
          policy_version?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
          withdrawn_at?: string | null
        }
        Update: {
          consent_type?: string
          created_at?: string
          granted_at?: string | null
          id?: string
          locale?: string | null
          policy_slug?: string | null
          policy_version?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
          withdrawn_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: { check_role: string; check_user_id: string }
        Returns: boolean
      }
      owns_partner_application: {
        Args: { app_folder: string }
        Returns: boolean
      }
      review_partner_application: {
        Args: {
          app_id: string
          decision: string
          flagged?: string[]
          note: string
        }
        Returns: undefined
      }
      submit_partner_document: {
        Args: { app_id: string; doc_kind: string; doc_path: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
