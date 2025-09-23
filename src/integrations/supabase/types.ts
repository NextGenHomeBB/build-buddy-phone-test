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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      absences: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          id: string
          notes: string | null
          reason: string | null
          request_type: string | null
          status: string | null
          user_id: string
          work_date: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          reason?: string | null
          request_type?: string | null
          status?: string | null
          user_id: string
          work_date: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          reason?: string | null
          request_type?: string | null
          status?: string | null
          user_id?: string
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "absences_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      availability_overrides: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          end_time: string | null
          id: string
          is_available: boolean
          override_date: string
          reason: string | null
          start_time: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          end_time?: string | null
          id?: string
          is_available?: boolean
          override_date: string
          reason?: string | null
          start_time?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          end_time?: string | null
          id?: string
          is_available?: boolean
          override_date?: string
          reason?: string | null
          start_time?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_overrides_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      checklist_items: {
        Row: {
          assignee_id: string | null
          created_at: string
          description: string | null
          id: string
          is_done: boolean
          task_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_done?: boolean
          task_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_done?: boolean
          task_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "checklist_items_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_items_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "user_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      checklists: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_template: boolean
          items: Json
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_template?: boolean
          items?: Json
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_template?: boolean
          items?: Json
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklists_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      default_phases: {
        Row: {
          checklist: Json
          created_at: string
          display_order: number
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          checklist?: Json
          created_at?: string
          display_order?: number
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          checklist?: Json
          created_at?: string
          display_order?: number
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          attachment_url: string | null
          category: string
          created_at: string
          external_issue_url: string | null
          id: string
          message: string
          project_id: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attachment_url?: string | null
          category: string
          created_at?: string
          external_issue_url?: string | null
          id?: string
          message: string
          project_id?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attachment_url?: string | null
          category?: string
          created_at?: string
          external_issue_url?: string | null
          id?: string
          message?: string
          project_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      function_errors: {
        Row: {
          created_at: string
          detail: Json | null
          fn: string
          id: string
        }
        Insert: {
          created_at?: string
          detail?: Json | null
          fn: string
          id?: string
        }
        Update: {
          created_at?: string
          detail?: Json | null
          fn?: string
          id?: string
        }
        Relationships: []
      }
      labour_costs: {
        Row: {
          created_at: string
          hours: number
          id: string
          phase_id: string
          rate: number
          subcontractor_id: string | null
          task: string
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          hours?: number
          id?: string
          phase_id: string
          rate?: number
          subcontractor_id?: string | null
          task: string
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          hours?: number
          id?: string
          phase_id?: string
          rate?: number
          subcontractor_id?: string | null
          task?: string
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "labour_costs_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "project_phases"
            referencedColumns: ["id"]
          },
        ]
      }
      labour_entries: {
        Row: {
          break_duration_minutes: number | null
          created_at: string | null
          end_time: string | null
          hourly_rate: number
          id: string
          notes: string | null
          phase_id: string | null
          project_id: string
          start_time: string
          status: string | null
          task_description: string
          total_cost: number | null
          total_hours: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          break_duration_minutes?: number | null
          created_at?: string | null
          end_time?: string | null
          hourly_rate?: number
          id?: string
          notes?: string | null
          phase_id?: string | null
          project_id: string
          start_time: string
          status?: string | null
          task_description: string
          total_cost?: number | null
          total_hours?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          break_duration_minutes?: number | null
          created_at?: string | null
          end_time?: string | null
          hourly_rate?: number
          id?: string
          notes?: string | null
          phase_id?: string | null
          project_id?: string
          start_time?: string
          status?: string | null
          task_description?: string
          total_cost?: number | null
          total_hours?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "labour_entries_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "project_phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "labour_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "labour_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      material_costs: {
        Row: {
          category: string
          created_at: string
          id: string
          phase_id: string
          qty: number
          total: number
          unit: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          phase_id: string
          qty?: number
          total?: number
          unit: string
          unit_price?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          phase_id?: string
          qty?: number
          total?: number
          unit?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_costs_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "project_phases"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          article_nr: string | null
          brand: string | null
          category: string | null
          created_at: string
          description: string | null
          ean: string | null
          id: string
          name: string
          price_ex_vat: number | null
          price_per_unit: number
          source_url: string | null
          specs: string | null
          unit: string
          updated_at: string
          url: string | null
        }
        Insert: {
          article_nr?: string | null
          brand?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          ean?: string | null
          id?: string
          name: string
          price_ex_vat?: number | null
          price_per_unit?: number
          source_url?: string | null
          specs?: string | null
          unit: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          article_nr?: string | null
          brand?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          ean?: string | null
          id?: string
          name?: string
          price_ex_vat?: number | null
          price_per_unit?: number
          source_url?: string | null
          specs?: string | null
          unit?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      payroll_entries: {
        Row: {
          created_at: string
          deductions: number
          gross_pay: number
          id: string
          net_pay: number
          notes: string | null
          overtime_hours: number
          overtime_rate: number
          paid_date: string | null
          payment_method: string | null
          payroll_period_id: string
          regular_hours: number
          regular_rate: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deductions?: number
          gross_pay?: number
          id?: string
          net_pay?: number
          notes?: string | null
          overtime_hours?: number
          overtime_rate?: number
          paid_date?: string | null
          payment_method?: string | null
          payroll_period_id: string
          regular_hours?: number
          regular_rate?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deductions?: number
          gross_pay?: number
          id?: string
          net_pay?: number
          notes?: string | null
          overtime_hours?: number
          overtime_rate?: number
          paid_date?: string | null
          payment_method?: string | null
          payroll_period_id?: string
          regular_hours?: number
          regular_rate?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payroll_periods: {
        Row: {
          created_at: string
          created_by: string | null
          end_date: string
          id: string
          name: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          end_date: string
          id?: string
          name: string
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          end_date?: string
          id?: string
          name?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      personal_task_lists: {
        Row: {
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      personal_tasks: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          is_completed: boolean | null
          list_id: string | null
          priority: number | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          list_id?: string | null
          priority?: number | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          list_id?: string | null
          priority?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_tasks_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "personal_task_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          auth_user_id: string | null
          avatar_url: string | null
          company: string | null
          created_at: string
          id: string
          is_placeholder: boolean | null
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          auth_user_id?: string | null
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          id?: string
          is_placeholder?: boolean | null
          name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          auth_user_id?: string | null
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          id?: string
          is_placeholder?: boolean | null
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_checklists: {
        Row: {
          checklist_id: string
          completed_items: Json
          created_at: string
          id: string
          project_id: string
          updated_at: string
        }
        Insert: {
          checklist_id: string
          completed_items?: Json
          created_at?: string
          id?: string
          project_id: string
          updated_at?: string
        }
        Update: {
          checklist_id?: string
          completed_items?: Json
          created_at?: string
          id?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_checklists_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_checklists_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_documents: {
        Row: {
          created_at: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          name: string
          project_id: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          name: string
          project_id: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          name?: string
          project_id?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      project_invoice_items: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          invoice_id: string | null
          item_type: string | null
          phase_id: string | null
          quantity: number | null
          total: number | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          invoice_id?: string | null
          item_type?: string | null
          phase_id?: string | null
          quantity?: number | null
          total?: number | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          invoice_id?: string | null
          item_type?: string | null
          phase_id?: string | null
          quantity?: number | null
          total?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "project_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      project_invoices: {
        Row: {
          billing_type: string | null
          client_address: string | null
          client_email: string | null
          client_name: string | null
          created_at: string | null
          discount_amount: number | null
          due_date: string | null
          id: string
          invoice_number: string
          issued_date: string | null
          net_amount: number | null
          notes: string | null
          paid_date: string | null
          payment_terms: string | null
          project_id: string
          status: string | null
          tax_amount: number | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          billing_type?: string | null
          client_address?: string | null
          client_email?: string | null
          client_name?: string | null
          created_at?: string | null
          discount_amount?: number | null
          due_date?: string | null
          id?: string
          invoice_number: string
          issued_date?: string | null
          net_amount?: number | null
          notes?: string | null
          paid_date?: string | null
          payment_terms?: string | null
          project_id: string
          status?: string | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          billing_type?: string | null
          client_address?: string | null
          client_email?: string | null
          client_name?: string | null
          created_at?: string | null
          discount_amount?: number | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          issued_date?: string | null
          net_amount?: number | null
          notes?: string | null
          paid_date?: string | null
          payment_terms?: string | null
          project_id?: string
          status?: string | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_materials: {
        Row: {
          cost_per_unit: number
          created_at: string
          id: string
          material_id: string
          project_id: string
          quantity_needed: number
          quantity_used: number
          total_cost: number
          updated_at: string
        }
        Insert: {
          cost_per_unit?: number
          created_at?: string
          id?: string
          material_id: string
          project_id: string
          quantity_needed?: number
          quantity_used?: number
          total_cost?: number
          updated_at?: string
        }
        Update: {
          cost_per_unit?: number
          created_at?: string
          id?: string
          material_id?: string
          project_id?: string
          quantity_needed?: number
          quantity_used?: number
          total_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_materials_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_materials_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_phases: {
        Row: {
          budget: number
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          labour_cost: number | null
          material_cost: number | null
          name: string
          progress: number
          project_id: string
          spent: number
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          updated_at: string
        }
        Insert: {
          budget?: number
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          labour_cost?: number | null
          material_cost?: number | null
          name: string
          progress?: number
          project_id: string
          spent?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
        }
        Update: {
          budget?: number
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          labour_cost?: number | null
          material_cost?: number | null
          name?: string
          progress?: number
          project_id?: string
          spent?: number
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_phases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget: number
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string
          id: string
          location: string
          manager_id: string | null
          name: string
          progress: number
          remaining_budget: number
          source: string | null
          spent: number
          start_date: string
          status: Database["public"]["Enums"]["project_status"]
          type: Database["public"]["Enums"]["project_type"]
          updated_at: string
        }
        Insert: {
          budget?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date: string
          id?: string
          location: string
          manager_id?: string | null
          name: string
          progress?: number
          remaining_budget?: number
          source?: string | null
          spent?: number
          start_date: string
          status?: Database["public"]["Enums"]["project_status"]
          type?: Database["public"]["Enums"]["project_type"]
          updated_at?: string
        }
        Update: {
          budget?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string
          id?: string
          location?: string
          manager_id?: string | null
          name?: string
          progress?: number
          remaining_budget?: number
          source?: string | null
          spent?: number
          start_date?: string
          status?: Database["public"]["Enums"]["project_status"]
          type?: Database["public"]["Enums"]["project_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      schedule_item_workers: {
        Row: {
          created_at: string | null
          id: string
          is_assistant: boolean | null
          schedule_item_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_assistant?: boolean | null
          schedule_item_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_assistant?: boolean | null
          schedule_item_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_schedule_item_workers_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "schedule_item_workers_schedule_item_id_fkey"
            columns: ["schedule_item_id"]
            isOneToOne: false
            referencedRelation: "schedule_items"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_items: {
        Row: {
          address: string
          category: string
          created_at: string | null
          end_time: string
          id: string
          project_id: string | null
          schedule_id: string
          start_time: string
        }
        Insert: {
          address: string
          category: string
          created_at?: string | null
          end_time: string
          id?: string
          project_id?: string | null
          schedule_id: string
          start_time: string
        }
        Update: {
          address?: string
          category?: string
          created_at?: string | null
          end_time?: string
          id?: string
          project_id?: string | null
          schedule_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_items_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          work_date: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          work_date: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          work_date?: string
        }
        Relationships: []
      }
      task_comments: {
        Row: {
          created_at: string
          id: string
          message: string
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "user_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      task_materials: {
        Row: {
          cost_per_unit: number
          created_at: string
          id: string
          material_id: string
          planned_qty: number | null
          project_id: string
          quantity_needed: number
          quantity_used: number
          task_id: string
          total_cost: number
          updated_at: string
          used_flag: boolean | null
        }
        Insert: {
          cost_per_unit?: number
          created_at?: string
          id?: string
          material_id: string
          planned_qty?: number | null
          project_id: string
          quantity_needed?: number
          quantity_used?: number
          task_id: string
          total_cost?: number
          updated_at?: string
          used_flag?: boolean | null
        }
        Update: {
          cost_per_unit?: number
          created_at?: string
          id?: string
          material_id?: string
          planned_qty?: number | null
          project_id?: string
          quantity_needed?: number
          quantity_used?: number
          task_id?: string
          total_cost?: number
          updated_at?: string
          used_flag?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_task_materials_material_id"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_task_materials_project_id"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_task_materials_task_id"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_task_materials_task_id"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "user_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_relationships: {
        Row: {
          child_task_id: string
          created_at: string
          id: string
          parent_task_id: string
          relationship_type: string
          updated_at: string
        }
        Insert: {
          child_task_id: string
          created_at?: string
          id?: string
          parent_task_id: string
          relationship_type?: string
          updated_at?: string
        }
        Update: {
          child_task_id?: string
          created_at?: string
          id?: string
          parent_task_id?: string
          relationship_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_relationships_child_task_fkey"
            columns: ["child_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_relationships_child_task_fkey"
            columns: ["child_task_id"]
            isOneToOne: false
            referencedRelation: "user_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_relationships_parent_task_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_relationships_parent_task_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "user_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_workers: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_task_workers_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "task_workers_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_workers_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "user_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_hours: number | null
          approved_at: string | null
          approved_by: string | null
          assigned_by: string | null
          assigned_to: string | null
          attachments: string[] | null
          created_at: string
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          phase_id: string | null
          priority: Database["public"]["Enums"]["task_priority"]
          project_id: string
          signature_url: string | null
          status: Database["public"]["Enums"]["task_status"]
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          actual_hours?: number | null
          approved_at?: string | null
          approved_by?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          attachments?: string[] | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          phase_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          project_id: string
          signature_url?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          actual_hours?: number | null
          approved_at?: string | null
          approved_by?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          attachments?: string[] | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          phase_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          project_id?: string
          signature_url?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tasks_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "project_phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      time_off_requests: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          days_requested: number
          end_date: string
          id: string
          reason: string | null
          request_type: string
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          days_requested?: number
          end_date: string
          id?: string
          reason?: string | null
          request_type: string
          start_date: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          days_requested?: number
          end_date?: string
          id?: string
          reason?: string | null
          request_type?: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_off_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "time_off_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      time_sheets: {
        Row: {
          created_at: string
          date: string
          description: string | null
          hours: number
          id: string
          project_id: string
          task_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          description?: string | null
          hours: number
          id?: string
          project_id: string
          task_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string | null
          hours?: number
          id?: string
          project_id?: string
          task_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_sheets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_sheets_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_sheets_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "user_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_sheets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      time_tracking_categories: {
        Row: {
          color: string | null
          created_at: string
          default_hourly_rate: number | null
          id: string
          is_billable: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          default_hourly_rate?: number | null
          id?: string
          is_billable?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          default_hourly_rate?: number | null
          id?: string
          is_billable?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      timesheet_breaks: {
        Row: {
          break_reason: string | null
          break_type: string | null
          created_at: string
          end_time: string | null
          id: string
          location: Json | null
          notes: string | null
          start_time: string
          timesheet_id: string
        }
        Insert: {
          break_reason?: string | null
          break_type?: string | null
          created_at?: string
          end_time?: string | null
          id?: string
          location?: Json | null
          notes?: string | null
          start_time: string
          timesheet_id: string
        }
        Update: {
          break_reason?: string | null
          break_type?: string | null
          created_at?: string
          end_time?: string | null
          id?: string
          location?: Json | null
          notes?: string | null
          start_time?: string
          timesheet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timesheet_breaks_timesheet_id_fkey"
            columns: ["timesheet_id"]
            isOneToOne: false
            referencedRelation: "timesheets"
            referencedColumns: ["id"]
          },
        ]
      }
      timesheets: {
        Row: {
          approved: boolean | null
          break_duration_minutes: number | null
          category_id: string | null
          created_at: string | null
          duration_generated: number | null
          end_location: Json | null
          end_photo_url: string | null
          end_time: string | null
          hourly_rate: number | null
          id: string
          is_billable: boolean | null
          location_verified: boolean | null
          notes: string | null
          phase_id: string | null
          project_id: string | null
          schedule_item_id: string | null
          start_location: Json | null
          start_photo_url: string | null
          start_time: string
          tags: string[] | null
          total_earnings: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved?: boolean | null
          break_duration_minutes?: number | null
          category_id?: string | null
          created_at?: string | null
          duration_generated?: number | null
          end_location?: Json | null
          end_photo_url?: string | null
          end_time?: string | null
          hourly_rate?: number | null
          id?: string
          is_billable?: boolean | null
          location_verified?: boolean | null
          notes?: string | null
          phase_id?: string | null
          project_id?: string | null
          schedule_item_id?: string | null
          start_location?: Json | null
          start_photo_url?: string | null
          start_time?: string
          tags?: string[] | null
          total_earnings?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved?: boolean | null
          break_duration_minutes?: number | null
          category_id?: string | null
          created_at?: string | null
          duration_generated?: number | null
          end_location?: Json | null
          end_photo_url?: string | null
          end_time?: string | null
          hourly_rate?: number | null
          id?: string
          is_billable?: boolean | null
          location_verified?: boolean | null
          notes?: string | null
          phase_id?: string | null
          project_id?: string | null
          schedule_item_id?: string | null
          start_location?: Json | null
          start_photo_url?: string | null
          start_time?: string
          tags?: string[] | null
          total_earnings?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timesheets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "time_tracking_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheets_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "project_phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheets_schedule_item_id_fkey"
            columns: ["schedule_item_id"]
            isOneToOne: false
            referencedRelation: "schedule_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_material_favorites: {
        Row: {
          created_at: string
          id: string
          material_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          material_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          material_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_material_favorites_material"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      user_phase_role: {
        Row: {
          created_at: string
          id: string
          phase_id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          phase_id: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          phase_id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_phase_role_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "project_phases"
            referencedColumns: ["id"]
          },
        ]
      }
      user_project_role: {
        Row: {
          created_at: string
          id: string
          project_id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_project_role_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string | null
          id: string
          is_available: boolean
          max_hours: number | null
          start_time: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time?: string | null
          id?: string
          is_available?: boolean
          max_hours?: number | null
          start_time?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string | null
          id?: string
          is_available?: boolean
          max_hours?: number | null
          start_time?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      worker_date_availability: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          date: string
          id: string
          is_available: boolean
          note: string | null
          requested_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          date: string
          id?: string
          is_available?: boolean
          note?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          date?: string
          id?: string
          is_available?: boolean
          note?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      worker_invoice_items: {
        Row: {
          amount: number | null
          created_at: string | null
          description: string | null
          hours: number | null
          id: string
          invoice_id: string | null
          phase_id: string | null
          project_id: string | null
          rate: number | null
          work_date: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          description?: string | null
          hours?: number | null
          id?: string
          invoice_id?: string | null
          phase_id?: string | null
          project_id?: string | null
          rate?: number | null
          work_date?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          description?: string | null
          hours?: number | null
          id?: string
          invoice_id?: string | null
          phase_id?: string | null
          project_id?: string | null
          rate?: number | null
          work_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "worker_invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "worker_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_invoices: {
        Row: {
          created_at: string | null
          due_date: string | null
          hourly_rate: number | null
          id: string
          invoice_number: string
          issued_date: string | null
          notes: string | null
          paid_date: string | null
          period_end: string
          period_start: string
          status: string | null
          subtotal: number | null
          tax_amount: number | null
          total_amount: number | null
          total_hours: number | null
          updated_at: string | null
          worker_id: string
        }
        Insert: {
          created_at?: string | null
          due_date?: string | null
          hourly_rate?: number | null
          id?: string
          invoice_number: string
          issued_date?: string | null
          notes?: string | null
          paid_date?: string | null
          period_end: string
          period_start: string
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          total_hours?: number | null
          updated_at?: string | null
          worker_id: string
        }
        Update: {
          created_at?: string | null
          due_date?: string | null
          hourly_rate?: number | null
          id?: string
          invoice_number?: string
          issued_date?: string | null
          notes?: string | null
          paid_date?: string | null
          period_end?: string
          period_start?: string
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          total_hours?: number | null
          updated_at?: string | null
          worker_id?: string
        }
        Relationships: []
      }
      worker_rates: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          effective_date: string
          hourly_rate: number
          id: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          effective_date?: string
          hourly_rate?: number
          id?: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          effective_date?: string
          hourly_rate?: number
          id?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      worker_skills: {
        Row: {
          certification_date: string | null
          certification_expiry: string | null
          certified: boolean | null
          created_at: string
          id: string
          skill_level: number
          skill_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          certification_date?: string | null
          certification_expiry?: string | null
          certified?: boolean | null
          created_at?: string
          id?: string
          skill_level?: number
          skill_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          certification_date?: string | null
          certification_expiry?: string | null
          certified?: boolean | null
          created_at?: string
          id?: string
          skill_level?: number
          skill_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      user_tasks: {
        Row: {
          actual_hours: number | null
          approved_at: string | null
          approved_by: string | null
          assigned_by: string | null
          assigned_by_user_name: string | null
          assigned_to: string | null
          assigned_user_name: string | null
          attachments: string[] | null
          created_at: string | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string | null
          phase_id: string | null
          phase_name: string | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          project_id: string | null
          project_name: string | null
          signature_url: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tasks_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "project_phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      assign_unassigned_tasks: {
        Args: { work_date: string }
        Returns: undefined
      }
      calculate_break_duration: {
        Args: { timesheet_id_param: string }
        Returns: number
      }
      create_placeholder_user: {
        Args: {
          user_email: string
          user_name: string
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Returns: string
      }
      create_user_profile: {
        Args: {
          user_email: string
          user_name: string
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Returns: string
      }
      delete_user_profile: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      estimate_phase_costs: {
        Args: { p_phase_id: string }
        Returns: Json
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_current_user_role_from_jwt: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_global_role: {
        Args: { user_id_param: string }
        Returns: string
      }
      import_schedule_tx: {
        Args: { payload: Json }
        Returns: Json
      }
      link_placeholder_to_auth_user: {
        Args: { auth_user_id: string; placeholder_name: string }
        Returns: boolean
      }
      stop_current_work: {
        Args: { user_id_param: string }
        Returns: Json
      }
      sync_project_phase_tasks_with_default: {
        Args: { default_phase_id: string }
        Returns: undefined
      }
      sync_task_workers_to_assigned_to: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_phase_progress: {
        Args: { phase_id_param: string }
        Returns: undefined
      }
      update_project_progress: {
        Args: { project_id_param: string }
        Returns: undefined
      }
      update_remaining_budget: {
        Args: { amount_delta: number; project_id_param: string }
        Returns: undefined
      }
      update_user_role: {
        Args: {
          new_role: Database["public"]["Enums"]["user_role"]
          target_user_id: string
        }
        Returns: boolean
      }
      validate_shift_location: {
        Args: {
          current_location: Json
          project_location?: Json
          timesheet_id_param: string
        }
        Returns: boolean
      }
    }
    Enums: {
      project_status:
        | "planning"
        | "active"
        | "on-hold"
        | "completed"
        | "cancelled"
      project_type:
        | "residential"
        | "commercial"
        | "infrastructure"
        | "renovation"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "todo" | "in-progress" | "review" | "completed"
      user_role: "admin" | "manager" | "worker" | "viewer"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      project_status: [
        "planning",
        "active",
        "on-hold",
        "completed",
        "cancelled",
      ],
      project_type: [
        "residential",
        "commercial",
        "infrastructure",
        "renovation",
      ],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["todo", "in-progress", "review", "completed"],
      user_role: ["admin", "manager", "worker", "viewer"],
    },
  },
} as const
