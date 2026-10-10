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
      ai_usage_log: {
        Row: {
          cost_estimate: number | null
          created_at: string
          feature: string
          id: string
          model: string | null
          tokens_in: number | null
          tokens_out: number | null
          user_id: string | null
        }
        Insert: {
          cost_estimate?: number | null
          created_at?: string
          feature: string
          id?: string
          model?: string | null
          tokens_in?: number | null
          tokens_out?: number | null
          user_id?: string | null
        }
        Update: {
          cost_estimate?: number | null
          created_at?: string
          feature?: string
          id?: string
          model?: string | null
          tokens_in?: number | null
          tokens_out?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
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
      audit_log: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json
        }
        Relationships: []
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
      culture_item_products: {
        Row: {
          created_at: string
          culture_item_id: string
          product_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          culture_item_id: string
          product_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          culture_item_id?: string
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "culture_item_products_culture_item_id_fkey"
            columns: ["culture_item_id"]
            isOneToOne: false
            referencedRelation: "culture_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "culture_item_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      culture_item_providers: {
        Row: {
          created_at: string
          culture_item_id: string
          provider_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          culture_item_id: string
          provider_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          culture_item_id?: string
          provider_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "culture_item_providers_culture_item_id_fkey"
            columns: ["culture_item_id"]
            isOneToOne: false
            referencedRelation: "culture_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "culture_item_providers_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      culture_items: {
        Row: {
          access_level: string
          category: string | null
          created_at: string
          governorate_id: string | null
          id: string
          ingredients_ar: string | null
          ingredients_en: string | null
          internal_notes: string | null
          is_active: boolean
          is_featured: boolean
          last_verified_at: string | null
          marketplace_collection: string | null
          materials_ar: string | null
          materials_en: string | null
          name_ar: string | null
          name_en: string | null
          occasion_ar: string | null
          occasion_en: string | null
          origin_note_ar: string | null
          origin_note_en: string | null
          region_ar: string | null
          region_en: string | null
          review_status: string
          section: string
          slug: string
          sort_order: number
          source_url: string | null
          story_ar: string | null
          story_en: string | null
          summary_ar: string | null
          summary_en: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          access_level?: string
          category?: string | null
          created_at?: string
          governorate_id?: string | null
          id?: string
          ingredients_ar?: string | null
          ingredients_en?: string | null
          internal_notes?: string | null
          is_active?: boolean
          is_featured?: boolean
          last_verified_at?: string | null
          marketplace_collection?: string | null
          materials_ar?: string | null
          materials_en?: string | null
          name_ar?: string | null
          name_en?: string | null
          occasion_ar?: string | null
          occasion_en?: string | null
          origin_note_ar?: string | null
          origin_note_en?: string | null
          region_ar?: string | null
          region_en?: string | null
          review_status?: string
          section: string
          slug: string
          sort_order?: number
          source_url?: string | null
          story_ar?: string | null
          story_en?: string | null
          summary_ar?: string | null
          summary_en?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          access_level?: string
          category?: string | null
          created_at?: string
          governorate_id?: string | null
          id?: string
          ingredients_ar?: string | null
          ingredients_en?: string | null
          internal_notes?: string | null
          is_active?: boolean
          is_featured?: boolean
          last_verified_at?: string | null
          marketplace_collection?: string | null
          materials_ar?: string | null
          materials_en?: string | null
          name_ar?: string | null
          name_en?: string | null
          occasion_ar?: string | null
          occasion_en?: string | null
          origin_note_ar?: string | null
          origin_note_en?: string | null
          region_ar?: string | null
          region_en?: string | null
          review_status?: string
          section?: string
          slug?: string
          sort_order?: number
          source_url?: string | null
          story_ar?: string | null
          story_en?: string | null
          summary_ar?: string | null
          summary_en?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "culture_items_governorate_id_fkey"
            columns: ["governorate_id"]
            isOneToOne: false
            referencedRelation: "governorates"
            referencedColumns: ["id"]
          },
        ]
      }
      culture_media: {
        Row: {
          attribution_text: string | null
          caption_ar: string | null
          caption_en: string | null
          created_at: string
          id: string
          institution: string | null
          is_active: boolean
          item_id: string
          kind: string
          license_type: string | null
          license_url: string | null
          origin_type: string
          rights_holder: string | null
          rights_statement: string
          rights_verified_at: string | null
          updated_at: string
          url: string
        }
        Insert: {
          attribution_text?: string | null
          caption_ar?: string | null
          caption_en?: string | null
          created_at?: string
          id?: string
          institution?: string | null
          is_active?: boolean
          item_id: string
          kind?: string
          license_type?: string | null
          license_url?: string | null
          origin_type?: string
          rights_holder?: string | null
          rights_statement: string
          rights_verified_at?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          attribution_text?: string | null
          caption_ar?: string | null
          caption_en?: string | null
          created_at?: string
          id?: string
          institution?: string | null
          is_active?: boolean
          item_id?: string
          kind?: string
          license_type?: string | null
          license_url?: string | null
          origin_type?: string
          rights_holder?: string | null
          rights_statement?: string
          rights_verified_at?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "culture_media_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "culture_items"
            referencedColumns: ["id"]
          },
        ]
      }
      culture_reports: {
        Row: {
          created_at: string
          handled: boolean
          id: string
          item_id: string | null
          message: string
        }
        Insert: {
          created_at?: string
          handled?: boolean
          id?: string
          item_id?: string | null
          message: string
        }
        Update: {
          created_at?: string
          handled?: boolean
          id?: string
          item_id?: string | null
          message?: string
        }
        Relationships: [
          {
            foreignKeyName: "culture_reports_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "culture_items"
            referencedColumns: ["id"]
          },
        ]
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
      economic_zones: {
        Row: {
          created_at: string
          governorate_slug: string | null
          id: string
          internal_notes: string | null
          is_active: boolean
          last_verified_at: string | null
          listed_under: string | null
          managing_body_ar: string | null
          managing_body_en: string | null
          name_ar: string
          name_en: string | null
          review_status: string
          slug: string
          source_note: string | null
          source_url: string | null
          summary_ar: string | null
          summary_en: string | null
          updated_at: string
          zone_type: string
        }
        Insert: {
          created_at?: string
          governorate_slug?: string | null
          id?: string
          internal_notes?: string | null
          is_active?: boolean
          last_verified_at?: string | null
          listed_under?: string | null
          managing_body_ar?: string | null
          managing_body_en?: string | null
          name_ar: string
          name_en?: string | null
          review_status?: string
          slug: string
          source_note?: string | null
          source_url?: string | null
          summary_ar?: string | null
          summary_en?: string | null
          updated_at?: string
          zone_type: string
        }
        Update: {
          created_at?: string
          governorate_slug?: string | null
          id?: string
          internal_notes?: string | null
          is_active?: boolean
          last_verified_at?: string | null
          listed_under?: string | null
          managing_body_ar?: string | null
          managing_body_en?: string | null
          name_ar?: string
          name_en?: string | null
          review_status?: string
          slug?: string
          source_note?: string | null
          source_url?: string | null
          summary_ar?: string | null
          summary_en?: string | null
          updated_at?: string
          zone_type?: string
        }
        Relationships: []
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
      military_eras: {
        Row: {
          created_at: string
          egypt_era_id: string | null
          end_label_ar: string | null
          end_label_en: string | null
          id: string
          intro_ar: string | null
          intro_en: string | null
          is_active: boolean
          key_leadership_ar: string | null
          key_leadership_en: string | null
          name_ar: string
          name_en: string
          number: number
          rulers_ar: string | null
          rulers_en: string | null
          slug: string
          sort_order: number
          start_label_ar: string | null
          start_label_en: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          egypt_era_id?: string | null
          end_label_ar?: string | null
          end_label_en?: string | null
          id?: string
          intro_ar?: string | null
          intro_en?: string | null
          is_active?: boolean
          key_leadership_ar?: string | null
          key_leadership_en?: string | null
          name_ar: string
          name_en: string
          number: number
          rulers_ar?: string | null
          rulers_en?: string | null
          slug: string
          sort_order?: number
          start_label_ar?: string | null
          start_label_en?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          egypt_era_id?: string | null
          end_label_ar?: string | null
          end_label_en?: string | null
          id?: string
          intro_ar?: string | null
          intro_en?: string | null
          is_active?: boolean
          key_leadership_ar?: string | null
          key_leadership_en?: string | null
          name_ar?: string
          name_en?: string
          number?: number
          rulers_ar?: string | null
          rulers_en?: string | null
          slug?: string
          sort_order?: number
          start_label_ar?: string | null
          start_label_en?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "military_eras_egypt_era_id_fkey"
            columns: ["egypt_era_id"]
            isOneToOne: false
            referencedRelation: "eras"
            referencedColumns: ["key"]
          },
        ]
      }
      military_figures: {
        Row: {
          bio_ar: string | null
          bio_en: string | null
          created_at: string
          era_id: string | null
          id: string
          internal_notes: string | null
          is_active: boolean
          name_ar: string | null
          name_en: string
          portrait_media_id: string | null
          review_status: string
          role_ar: string | null
          role_en: string | null
          slug: string
          updated_at: string
          years_label_ar: string | null
          years_label_en: string | null
        }
        Insert: {
          bio_ar?: string | null
          bio_en?: string | null
          created_at?: string
          era_id?: string | null
          id?: string
          internal_notes?: string | null
          is_active?: boolean
          name_ar?: string | null
          name_en: string
          portrait_media_id?: string | null
          review_status?: string
          role_ar?: string | null
          role_en?: string | null
          slug: string
          updated_at?: string
          years_label_ar?: string | null
          years_label_en?: string | null
        }
        Update: {
          bio_ar?: string | null
          bio_en?: string | null
          created_at?: string
          era_id?: string | null
          id?: string
          internal_notes?: string | null
          is_active?: boolean
          name_ar?: string | null
          name_en?: string
          portrait_media_id?: string | null
          review_status?: string
          role_ar?: string | null
          role_en?: string | null
          slug?: string
          updated_at?: string
          years_label_ar?: string | null
          years_label_en?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "military_figures_era_id_fkey"
            columns: ["era_id"]
            isOneToOne: false
            referencedRelation: "military_eras"
            referencedColumns: ["id"]
          },
        ]
      }
      military_media: {
        Row: {
          accession_id: string | null
          attribution_text: string | null
          caption_ar: string | null
          caption_en: string | null
          created_at: string
          era_id: string | null
          figure_id: string | null
          id: string
          institution: string | null
          is_active: boolean
          kind: string
          license_type: string | null
          license_url: string | null
          origin_type: string
          record_id: string | null
          rights_holder: string | null
          rights_statement: string
          rights_verified_at: string | null
          title_ar: string | null
          title_en: string | null
          updated_at: string
          url: string
        }
        Insert: {
          accession_id?: string | null
          attribution_text?: string | null
          caption_ar?: string | null
          caption_en?: string | null
          created_at?: string
          era_id?: string | null
          figure_id?: string | null
          id?: string
          institution?: string | null
          is_active?: boolean
          kind: string
          license_type?: string | null
          license_url?: string | null
          origin_type: string
          record_id?: string | null
          rights_holder?: string | null
          rights_statement: string
          rights_verified_at?: string | null
          title_ar?: string | null
          title_en?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          accession_id?: string | null
          attribution_text?: string | null
          caption_ar?: string | null
          caption_en?: string | null
          created_at?: string
          era_id?: string | null
          figure_id?: string | null
          id?: string
          institution?: string | null
          is_active?: boolean
          kind?: string
          license_type?: string | null
          license_url?: string | null
          origin_type?: string
          record_id?: string | null
          rights_holder?: string | null
          rights_statement?: string
          rights_verified_at?: string | null
          title_ar?: string | null
          title_en?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "military_media_era_id_fkey"
            columns: ["era_id"]
            isOneToOne: false
            referencedRelation: "military_eras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "military_media_figure_id_fkey"
            columns: ["figure_id"]
            isOneToOne: false
            referencedRelation: "military_figures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "military_media_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "military_records"
            referencedColumns: ["id"]
          },
        ]
      }
      military_record_figures: {
        Row: {
          figure_id: string
          id: string
          record_id: string
          role_label: string | null
        }
        Insert: {
          figure_id: string
          id?: string
          record_id: string
          role_label?: string | null
        }
        Update: {
          figure_id?: string
          id?: string
          record_id?: string
          role_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "military_record_figures_figure_id_fkey"
            columns: ["figure_id"]
            isOneToOne: false
            referencedRelation: "military_figures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "military_record_figures_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "military_records"
            referencedColumns: ["id"]
          },
        ]
      }
      military_record_sources: {
        Row: {
          citation_detail: string | null
          id: string
          record_id: string
          source_id: string
        }
        Insert: {
          citation_detail?: string | null
          id?: string
          record_id: string
          source_id: string
        }
        Update: {
          citation_detail?: string | null
          id?: string
          record_id?: string
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "military_record_sources_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "military_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "military_record_sources_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "military_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      military_records: {
        Row: {
          alt_names: string | null
          created_at: string
          date_label_ar: string | null
          date_label_en: string | null
          egyptian_leadership_ar: string | null
          egyptian_leadership_en: string | null
          era_id: string
          id: string
          internal_notes: string | null
          is_active: boolean
          is_featured: boolean
          last_verified_at: string | null
          lat: number | null
          lng: number | null
          note_ar: string | null
          note_en: string | null
          opposing_side_ar: string | null
          opposing_side_en: string | null
          outcome: string
          place_ar: string | null
          place_en: string | null
          record_type: string
          register_no: number | null
          review_status: string
          significance_ar: string | null
          significance_en: string | null
          slug: string
          source_url: string | null
          title_ar: string | null
          title_en: string | null
          updated_at: string
          year_from: number | null
          year_to: number | null
        }
        Insert: {
          alt_names?: string | null
          created_at?: string
          date_label_ar?: string | null
          date_label_en?: string | null
          egyptian_leadership_ar?: string | null
          egyptian_leadership_en?: string | null
          era_id: string
          id?: string
          internal_notes?: string | null
          is_active?: boolean
          is_featured?: boolean
          last_verified_at?: string | null
          lat?: number | null
          lng?: number | null
          note_ar?: string | null
          note_en?: string | null
          opposing_side_ar?: string | null
          opposing_side_en?: string | null
          outcome?: string
          place_ar?: string | null
          place_en?: string | null
          record_type: string
          register_no?: number | null
          review_status?: string
          significance_ar?: string | null
          significance_en?: string | null
          slug: string
          source_url?: string | null
          title_ar?: string | null
          title_en?: string | null
          updated_at?: string
          year_from?: number | null
          year_to?: number | null
        }
        Update: {
          alt_names?: string | null
          created_at?: string
          date_label_ar?: string | null
          date_label_en?: string | null
          egyptian_leadership_ar?: string | null
          egyptian_leadership_en?: string | null
          era_id?: string
          id?: string
          internal_notes?: string | null
          is_active?: boolean
          is_featured?: boolean
          last_verified_at?: string | null
          lat?: number | null
          lng?: number | null
          note_ar?: string | null
          note_en?: string | null
          opposing_side_ar?: string | null
          opposing_side_en?: string | null
          outcome?: string
          place_ar?: string | null
          place_en?: string | null
          record_type?: string
          register_no?: number | null
          review_status?: string
          significance_ar?: string | null
          significance_en?: string | null
          slug?: string
          source_url?: string | null
          title_ar?: string | null
          title_en?: string | null
          updated_at?: string
          year_from?: number | null
          year_to?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "military_records_era_id_fkey"
            columns: ["era_id"]
            isOneToOne: false
            referencedRelation: "military_eras"
            referencedColumns: ["id"]
          },
        ]
      }
      military_reports: {
        Row: {
          contact_email: string | null
          created_at: string
          handled: boolean
          id: string
          message: string
          record_id: string | null
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          handled?: boolean
          id?: string
          message: string
          record_id?: string | null
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          handled?: boolean
          id?: string
          message?: string
          record_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "military_reports_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "military_records"
            referencedColumns: ["id"]
          },
        ]
      }
      military_sources: {
        Row: {
          author: string | null
          created_at: string
          id: string
          is_active: boolean
          kind: string
          notes: string | null
          publisher: string | null
          review_status: string
          title: string
          updated_at: string
          url: string | null
          year: string | null
        }
        Insert: {
          author?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          kind: string
          notes?: string | null
          publisher?: string | null
          review_status?: string
          title: string
          updated_at?: string
          url?: string | null
          year?: string | null
        }
        Update: {
          author?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          kind?: string
          notes?: string | null
          publisher?: string | null
          review_status?: string
          title?: string
          updated_at?: string
          url?: string | null
          year?: string | null
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
      points_ledger: {
        Row: {
          created_at: string
          delta: number
          id: string
          reason: string
          ref_id: string | null
          ref_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          delta: number
          id?: string
          reason: string
          ref_id?: string | null
          ref_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          delta?: number
          id?: string
          reason?: string
          ref_id?: string | null
          ref_type?: string | null
          user_id?: string
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
          attribution_text: string | null
          consent_status: string
          country: string | null
          created_at: string | null
          creator_name: string | null
          creator_url: string | null
          data_class: string | null
          description: string | null
          destinations: string[] | null
          duration_seconds: number | null
          governance_status: string
          group_type: string | null
          id: string
          images: string[] | null
          internal_notes: string | null
          language_code: string | null
          license_type: string | null
          license_url: string | null
          media_type: string | null
          moderation_state: string | null
          name: string
          negatives: string[] | null
          positives: string[] | null
          rating: number | null
          rights_holder: string | null
          rights_statement: string | null
          rights_verified_at: string | null
          slug: string
          source_owner: string | null
          source_status: string | null
          suggestions: string[] | null
          summary: string | null
          tags: string[] | null
          updated_at: string | null
          verified_at: string | null
          video_url: string | null
        }
        Insert: {
          attribution_text?: string | null
          consent_status?: string
          country?: string | null
          created_at?: string | null
          creator_name?: string | null
          creator_url?: string | null
          data_class?: string | null
          description?: string | null
          destinations?: string[] | null
          duration_seconds?: number | null
          governance_status?: string
          group_type?: string | null
          id: string
          images?: string[] | null
          internal_notes?: string | null
          language_code?: string | null
          license_type?: string | null
          license_url?: string | null
          media_type?: string | null
          moderation_state?: string | null
          name: string
          negatives?: string[] | null
          positives?: string[] | null
          rating?: number | null
          rights_holder?: string | null
          rights_statement?: string | null
          rights_verified_at?: string | null
          slug: string
          source_owner?: string | null
          source_status?: string | null
          suggestions?: string[] | null
          summary?: string | null
          tags?: string[] | null
          updated_at?: string | null
          verified_at?: string | null
          video_url?: string | null
        }
        Update: {
          attribution_text?: string | null
          consent_status?: string
          country?: string | null
          created_at?: string | null
          creator_name?: string | null
          creator_url?: string | null
          data_class?: string | null
          description?: string | null
          destinations?: string[] | null
          duration_seconds?: number | null
          governance_status?: string
          group_type?: string | null
          id?: string
          images?: string[] | null
          internal_notes?: string | null
          language_code?: string | null
          license_type?: string | null
          license_url?: string | null
          media_type?: string | null
          moderation_state?: string | null
          name?: string
          negatives?: string[] | null
          positives?: string[] | null
          rating?: number | null
          rights_holder?: string | null
          rights_statement?: string | null
          rights_verified_at?: string | null
          slug?: string
          source_owner?: string | null
          source_status?: string | null
          suggestions?: string[] | null
          summary?: string | null
          tags?: string[] | null
          updated_at?: string | null
          verified_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      traveller_story_reports: {
        Row: {
          created_at: string
          handled: boolean
          id: string
          message: string
          story_id: string | null
        }
        Insert: {
          created_at?: string
          handled?: boolean
          id?: string
          message: string
          story_id?: string | null
        }
        Update: {
          created_at?: string
          handled?: boolean
          id?: string
          message?: string
          story_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "traveller_story_reports_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "traveller_stories"
            referencedColumns: ["id"]
          },
        ]
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
      trip_preview_videos: {
        Row: {
          attribution_text: string | null
          created_at: string
          destination_slug: string | null
          governorate_slug: string | null
          id: string
          internal_notes: string | null
          is_active: boolean
          license_type: string | null
          license_url: string | null
          review_status: string
          rights_holder: string | null
          rights_verified_at: string | null
          source_url: string | null
          thumbnail_url: string | null
          title_ar: string | null
          title_en: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          attribution_text?: string | null
          created_at?: string
          destination_slug?: string | null
          governorate_slug?: string | null
          id?: string
          internal_notes?: string | null
          is_active?: boolean
          license_type?: string | null
          license_url?: string | null
          review_status?: string
          rights_holder?: string | null
          rights_verified_at?: string | null
          source_url?: string | null
          thumbnail_url?: string | null
          title_ar?: string | null
          title_en?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          attribution_text?: string | null
          created_at?: string
          destination_slug?: string | null
          governorate_slug?: string | null
          id?: string
          internal_notes?: string | null
          is_active?: boolean
          license_type?: string | null
          license_url?: string | null
          review_status?: string
          rights_holder?: string | null
          rights_verified_at?: string | null
          source_url?: string | null
          thumbnail_url?: string | null
          title_ar?: string | null
          title_en?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
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
      zone_facts: {
        Row: {
          created_at: string
          id: string
          internal_notes: string | null
          is_active: boolean
          review_status: string
          source_date: string | null
          source_name: string | null
          source_url: string | null
          text_ar: string | null
          text_en: string | null
          topic: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          internal_notes?: string | null
          is_active?: boolean
          review_status?: string
          source_date?: string | null
          source_name?: string | null
          source_url?: string | null
          text_ar?: string | null
          text_en?: string | null
          topic: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          internal_notes?: string | null
          is_active?: boolean
          review_status?: string
          source_date?: string | null
          source_name?: string | null
          source_url?: string | null
          text_ar?: string | null
          text_en?: string | null
          topic?: string
          updated_at?: string
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
