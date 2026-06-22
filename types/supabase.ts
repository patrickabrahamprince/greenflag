export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          persona: string;
          name: string;
          age: number | null;
          city: string | null;
          city_auto: string | null;
          lat: number | null;
          lng: number | null;
          bio: string | null;
          photos: string[];
          interests: string[];
          looking_for_interests: string[];
          instagram_handle: string | null;
          is_active: boolean | null;
          created_at: string;
          is_admin: boolean | null;
          is_banned: boolean | null;
          banned_reason: string | null;
          standards: Json | null;
          coins: number | null;
          onboarding_completed: boolean | null;
          last_active: string | null;
          job: string | null;
          height: string | null;
          push_token: string | null;
          gender: string | null;
          blur_key: string;
          why_me_prompts: string[];
          interests_have: string[];
          interests_looking_for: string[];
          connected_count: number;
          ban_reason: string | null;
        };
        Insert: {
          id: string;
          persona?: string;
          name?: string;
          age?: number | null;
          city?: string | null;
          city_auto?: string | null;
          lat?: number | null;
          lng?: number | null;
          bio?: string | null;
          photos?: string[];
          interests?: string[];
          looking_for_interests?: string[];
          instagram_handle?: string | null;
          is_active?: boolean | null;
          created_at?: string;
          is_admin?: boolean | null;
          is_banned?: boolean | null;
          banned_reason?: string | null;
          standards?: Json | null;
          coins?: number | null;
          onboarding_completed?: boolean | null;
          last_active?: string | null;
          job?: string | null;
          height?: string | null;
          push_token?: string | null;
          gender?: string | null;
          blur_key?: string;
          why_me_prompts?: string[];
          interests_have?: string[];
          interests_looking_for?: string[];
          connected_count?: number;
          ban_reason?: string | null;
        };
        Update: {
          id?: string;
          persona?: string;
          name?: string;
          age?: number | null;
          city?: string | null;
          city_auto?: string | null;
          lat?: number | null;
          lng?: number | null;
          bio?: string | null;
          photos?: string[];
          interests?: string[];
          looking_for_interests?: string[];
          instagram_handle?: string | null;
          is_active?: boolean | null;
          created_at?: string;
          is_admin?: boolean | null;
          is_banned?: boolean | null;
          banned_reason?: string | null;
          standards?: Json | null;
          coins?: number | null;
          onboarding_completed?: boolean | null;
          last_active?: string | null;
          job?: string | null;
          height?: string | null;
          push_token?: string | null;
          gender?: string | null;
          blur_key?: string;
          why_me_prompts?: string[];
          interests_have?: string[];
          interests_looking_for?: string[];
          connected_count?: number;
          ban_reason?: string | null;
        };
        Relationships: [];
      };
      wallets: {
        Row: {
          user_id: string;
          balance: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          balance?: number;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          balance?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          amount: number;
          balance_after: number;
          description: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          amount: number;
          balance_after: number;
          description: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          amount?: number;
          balance_after?: number;
          description?: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      connections: {
        Row: {
          id: string;
          test_id: string | null;
          initiator_id: string | null;
          recipient_id: string | null;
          guest_id: string;
          host_id: string;
          standard_id: string | null;
          status: string;
          state: string | null;
          tasks_completed: number;
          frozen_count: number | null;
          day_count: number | null;
          approved_count: number | null;
          expires_at: string | null;
          started_at: string;
          completed_at: string | null;
          deadline: string | null;
          chat_unlocked_at: string | null;
          host_reviewed_at: string | null;
          created_at: string;
          review_reason: string | null;
          review_note: string | null;
          current_day: number;
          freezes_used: number;
          frozen_until: string | null;
          chat_unlocked: boolean;
          connected: boolean;
          connected_at: string | null;
          ended_reason: string | null;
          match_percentage: number | null;
          match_reasons: Json | null;
        };
        Insert: {
          id?: string;
          test_id?: string | null;
          initiator_id?: string | null;
          recipient_id?: string | null;
          guest_id: string;
          host_id: string;
          standard_id?: string | null;
          status?: string;
          state?: string | null;
          tasks_completed?: number;
          frozen_count?: number | null;
          day_count?: number | null;
          approved_count?: number | null;
          expires_at?: string | null;
          started_at?: string;
          completed_at?: string | null;
          deadline?: string | null;
          chat_unlocked_at?: string | null;
          host_reviewed_at?: string | null;
          created_at?: string;
          review_reason?: string | null;
          review_note?: string | null;
          current_day?: number;
          freezes_used?: number;
          frozen_until?: string | null;
          chat_unlocked?: boolean;
          connected?: boolean;
          connected_at?: string | null;
          ended_reason?: string | null;
          match_percentage?: number | null;
          match_reasons?: Json | null;
        };
        Update: {
          id?: string;
          test_id?: string | null;
          initiator_id?: string | null;
          recipient_id?: string | null;
          guest_id?: string;
          host_id?: string;
          standard_id?: string | null;
          state?: string | null;
          status?: string;
          tasks_completed?: number;
          frozen_count?: number | null;
          expires_at?: string | null;
          started_at?: string;
          completed_at?: string | null;
          deadline?: string | null;
          chat_unlocked_at?: string | null;
          host_reviewed_at?: string | null;
          created_at?: string;
          review_reason?: string | null;
          review_note?: string | null;
          current_day?: number;
          freezes_used?: number;
          frozen_until?: string | null;
          chat_unlocked?: boolean;
          connected?: boolean;
          connected_at?: string | null;
          ended_reason?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "connections_test_id_fkey";
            columns: ["test_id"];
            isOneToOne: false;
            referencedRelation: "tests";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "connections_guest_id_fkey";
            columns: ["guest_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "connections_host_id_fkey";
            columns: ["host_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      task_submissions: {
        Row: {
          id: number;
          connection_id: string;
          task_number: number;
          content_type: string;
          text_content: string | null;
          media_url: string | null;
          submitted_at: string;
        };
        Insert: {
          id?: number;
          connection_id: string;
          task_number: number;
          content_type: string;
          text_content?: string | null;
          media_url?: string | null;
          submitted_at?: string;
        };
        Update: {
          id?: number;
          connection_id?: string;
          task_number?: number;
          content_type?: string;
          text_content?: string | null;
          media_url?: string | null;
          submitted_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "task_submissions_connection_id_fkey";
            columns: ["connection_id"];
            isOneToOne: false;
            referencedRelation: "connections";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          connection_id: string;
          sender_id: string;
          content: string;
          created_at: string;
          read_at: string | null;
          type: string | null;
        };
        Insert: {
          id?: string;
          connection_id: string;
          sender_id: string | null;
          content: string;
          created_at?: string;
          read_at?: string | null;
          type?: string | null;
        };
        Update: {
          id?: string;
          connection_id?: string;
          sender_id?: string | null;
          content?: string;
          created_at?: string;
          read_at?: string | null;
          type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "messages_connection_id_fkey";
            columns: ["connection_id"];
            isOneToOne: false;
            referencedRelation: "connections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string;
          data: Json | null;
          read_at: string | null;
          created_at: string;
          delivered_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          body: string;
          data?: Json | null;
          read_at?: string | null;
          created_at?: string;
          delivered_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          body?: string;
          data?: Json | null;
          read_at?: string | null;
          created_at?: string;
          delivered_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      tests: {
        Row: {
          id: string;
          host_id: string;
          name: string;
          difficulty: string | null;
          is_active: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          host_id: string;
          name: string;
          difficulty?: string | null;
          is_active?: boolean | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          host_id?: string;
          name?: string;
          difficulty?: string | null;
          is_active?: boolean | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tests_host_id_fkey";
            columns: ["host_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      tasks: {
        Row: {
          id: string;
          test_id: string;
          day: number;
          description: string;
          type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          test_id: string;
          day: number;
          description: string;
          type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          test_id?: string;
          day?: number;
          description?: string;
          type?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_test_id_fkey";
            columns: ["test_id"];
            isOneToOne: false;
            referencedRelation: "tests";
            referencedColumns: ["id"];
          },
        ];
      };
      submissions: {
        Row: {
          id: string;
          connection_id: string;
          task_id: string;
          proof_url: string | null;
          proof_text: string | null;
          status: string;
          rejection_reason: string | null;
          submitted_at: string;
          reviewed_at: string | null;
          day_number: number;
          deadline: string | null;
          auto_approved: boolean;
          media_url: string | null;
          media_type: string | null;
          moderation_status: string;
        };
        Insert: {
          id?: string;
          connection_id: string;
          task_id: string;
          proof_url?: string | null;
          proof_text?: string | null;
          status?: string;
          rejection_reason?: string | null;
          submitted_at?: string;
          reviewed_at?: string | null;
          day_number?: number;
          deadline?: string | null;
          auto_approved?: boolean;
          media_url?: string | null;
          media_type?: string | null;
          moderation_status?: string;
        };
        Update: {
          id?: string;
          connection_id?: string;
          task_id?: string;
          proof_url?: string | null;
          proof_text?: string | null;
          status?: string;
          rejection_reason?: string | null;
          submitted_at?: string;
          reviewed_at?: string | null;
          day_number?: number;
          deadline?: string | null;
          auto_approved?: boolean;
          media_url?: string | null;
          media_type?: string | null;
          moderation_status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "submissions_connection_id_fkey";
            columns: ["connection_id"];
            isOneToOne: false;
            referencedRelation: "connections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "submissions_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
        ];
      };
      mod_queue: {
        Row: {
          id: string;
          submission_id: string;
          status: string;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          submission_id: string;
          status?: string;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          submission_id?: string;
          status?: string;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mod_queue_submission_id_fkey";
            columns: ["submission_id"];
            isOneToOne: false;
            referencedRelation: "submissions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mod_queue_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      coin_transactions: {
        Row: {
          id: number;
          user_id: string;
          amount: number;
          type: string;
          description: string | null;
          connection_id: string | null;
          created_at: string;
          razorpay_payment_id: string | null;
        };
        Insert: {
          id?: number;
          user_id: string;
          amount: number;
          type: string;
          description?: string | null;
          connection_id?: string | null;
          created_at?: string;
          razorpay_payment_id?: string | null;
        };
        Update: {
          id?: number;
          user_id?: string;
          amount?: number;
          type?: string;
          description?: string | null;
          connection_id?: string | null;
          created_at?: string;
          razorpay_payment_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "coin_transactions_connection_id_fkey";
            columns: ["connection_id"];
            isOneToOne: false;
            referencedRelation: "connections";
            referencedColumns: ["id"];
          },
        ];
      };
      blocked_pairs: {
        Row: {
          id: number;
          host_id: string;
          guest_id: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          host_id: string;
          guest_id: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          host_id?: string;
          guest_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      admin_actions: {
        Row: {
          id: number;
          admin_id: string;
          action: string;
          target_id: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          admin_id: string;
          action: string;
          target_id: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          admin_id?: string;
          action?: string;
          target_id?: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admin_actions_admin_id_fkey";
            columns: ["admin_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          reported_id: string;
          reason: string;
          details: string | null;
          status: string;
          admin_notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          reported_id: string;
          reason: string;
          details?: string | null;
          status?: string;
          admin_notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          reported_id?: string;
          reason?: string;
          details?: string | null;
          status?: string;
          admin_notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey";
            columns: ["reporter_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_reported_id_fkey";
            columns: ["reported_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      freeze_transactions: {
        Row: {
          id: string;
          connection_id: string;
          man_id: string;
          coins_paid: number;
          extended_until: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          connection_id: string;
          man_id: string;
          coins_paid?: number;
          extended_until?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          connection_id?: string;
          man_id?: string;
          coins_paid?: number;
          extended_until?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "freeze_transactions_connection_id_fkey";
            columns: ["connection_id"];
            isOneToOne: false;
            referencedRelation: "connections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "freeze_transactions_man_id_fkey";
            columns: ["man_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      daily_discover_views: {
        Row: {
          id: string;
          man_id: string;
          woman_id: string;
          viewed_date: string;
        };
        Insert: {
          id?: string;
          man_id: string;
          woman_id: string;
          viewed_date?: string;
        };
        Update: {
          id?: string;
          man_id?: string;
          woman_id?: string;
          viewed_date?: string;
        };
        Relationships: [
          {
            foreignKeyName: "daily_discover_views_man_id_fkey";
            columns: ["man_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "daily_discover_views_woman_id_fkey";
            columns: ["woman_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      standards: {
        Row: {
          id: string;
          user_id: string;
          woman_id: string;
          is_active: boolean;
          active: boolean;
          created_at: string;
          intentions: Json | null;
          required_interests: string[] | null;
          values: string[] | null;
          deal_breakers: string[] | null;
        };
        Insert: {
          id?: string;
          user_id?: string;
          woman_id: string;
          is_active?: boolean;
          active?: boolean;
          created_at?: string;
          intentions?: Json | null;
          required_interests?: string[] | null;
          values?: string[] | null;
          deal_breakers?: string[] | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          woman_id?: string;
          is_active?: boolean;
          active?: boolean;
          created_at?: string;
          intentions?: Json | null;
          required_interests?: string[] | null;
          values?: string[] | null;
          deal_breakers?: string[] | null;
        };
        Relationships: [
          {
            foreignKeyName: "standards_woman_id_fkey";
            columns: ["woman_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      intentions: {
        Row: {
          id: string;
          standard_id: string;
          day_number: number;
          type: string;
          prompt: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          standard_id: string;
          day_number: number;
          type: string;
          prompt: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          standard_id?: string;
          day_number?: number;
          type?: string;
          prompt?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "intentions_standard_id_fkey";
            columns: ["standard_id"];
            isOneToOne: false;
            referencedRelation: "standards";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          id: string;
          admin_email: string | null;
          action: string;
          target: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_email?: string | null;
          action: string;
          target?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_email?: string | null;
          action?: string;
          target?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          endpoint?: string;
          p256dh?: string;
          auth?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      admin_user_stats: {
        Row: {
          date: string;
          signups: number;
          total_users: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      deduct_coins: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_description: string;
          p_metadata?: Json;
        };
        Returns: Json;
      };
      add_coins: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_description: string;
          p_metadata?: Json;
        };
        Returns: Json;
      };
      start_connection: {
        Args: {
          p_host_id: string;
        };
        Returns: Json;
      };
      submit_task: {
        Args: {
          p_connection_id: string;
          p_task_number: number;
          p_text?: string;
          p_media_url?: string;
        };
        Returns: Json;
      };
      review_connection: {
        Args: {
          p_connection_id: string;
          p_approve: boolean;
        };
        Returns: void;
      };
      expire_connections: {
        Args: Record<string, never>;
        Returns: void;
      };
      mark_notifications_read: {
        Args: {
          p_user_id: string;
        };
        Returns: void;
      };
      get_unread_count: {
        Args: {
          p_user_id: string;
        };
        Returns: number;
      };
      mark_messages_read: {
        Args: {
          p_connection_id: string;
        };
        Returns: void;
      };
      get_unread_messages_count: {
        Args: {
          p_connection_id: string;
        };
        Returns: number;
      };
      get_matching_profiles: {
        Args: {
          p_user_id: string;
          p_viewing_gender: string;
          p_user_interests: string[];
          p_user_standards: string[];
          p_user_lat: number;
          p_user_lng: number;
          p_limit?: number;
          p_offset?: number;
        };
        Returns: {
          id: string;
          name: string;
          age: number;
          photos: string[];
          bio: string;
          job: string;
          height: string;
          city_auto: string;
          interests: string[];
          looking_for_interests: string[];
          match_percent: number;
          distance_km: number;
          last_active: string;
        }[];
      };
      admin_ban_user: {
        Args: {
          p_user_id: string;
          p_reason: string;
        };
        Returns: void;
      };
      admin_unban_user: {
        Args: {
          p_user_id: string;
        };
        Returns: void;
      };
      admin_set_admin: {
        Args: {
          p_user_id: string;
        };
        Returns: void;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
