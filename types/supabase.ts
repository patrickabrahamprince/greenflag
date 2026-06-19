export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          age: number;
          city: string;
          bio: string;
          photos: string[];
          role: 'guest' | 'host';
          gender: 'guest' | 'host' | 'man' | 'woman' | null;
          city_auto: string | null;
          lat: number | null;
          lng: number | null;
          interests: string[] | null;
          looking_for_interests: string[] | null;
          about_me_tags: string[] | null;
          looking_for_tags: string[] | null;
          instagram_url: string | null;
          job: string | null;
          height: string | null;
          is_active: boolean | null;
          is_admin: boolean | null;
          is_banned: boolean | null;
          banned_reason: string | null;
          banned_at: string | null;
          last_active: string | null;
          onboarding_completed: boolean | null;
          coins: number | null;
          email: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']>;
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      connections: {
        Row: {
          id: string;
          test_id: string;
          standard_id: string;
          guest_id: string;
          host_id: string;
          status: 'pending' | 'active' | 'chat_unlocked' | 'completed' | 'expired' | 'rejected';
          tasks_completed: number;
          expires_at: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['connections']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['connections']['Insert']>;
      };
      submissions: {
        Row: {
          id: string;
          connection_id: string;
          intention_id: number;
          proof_url: string;
          proof_text?: string;
          status: 'submitted' | 'approved' | 'rejected';
          review_note?: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['submissions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['submissions']['Insert']>;
      };
      messages: {
        Row: {
          id: string;
          connection_id: string;
          sender_id: string;
          content: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
      };
      wallets: {
        Row: {
          user_id: string;
          balance: number;
        };
        Insert: Database['public']['Tables']['wallets']['Row'];
        Update: Partial<Database['public']['Tables']['wallets']['Insert']>;
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: 'credit' | 'debit';
          description: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>;
      };
      reports: {
        Row: {
          id: number;
          reporter_id: string;
          reported_id: string;
          reason: string;
          details: string | null;
          status: 'pending' | 'reviewed' | 'actioned' | 'dismissed';
          admin_notes: string | null;
          created_at: string;
          resolved_at: string | null;
          resolved_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['reports']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['reports']['Row']>;
      };
      admin_actions: {
        Row: {
          id: number;
          admin_id: string;
          action: string;
          target_id: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['admin_actions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['admin_actions']['Row']>;
      };
      blocked_pairs: {
        Row: {
          id: number;
          host_id: string;
          guest_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['blocked_pairs']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['blocked_pairs']['Row']>;
      };
      mod_queue: {
        Row: {
          id: string;
          submission_id: string;
          reported_by: string;
          reason: string;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['mod_queue']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['mod_queue']['Insert']>;
      };
      invite_codes: {
        Row: {
          code: string;
          used: boolean;
          used_by?: string;
        };
        Insert: Database['public']['Tables']['invite_codes']['Row'];
        Update: Partial<Database['public']['Tables']['invite_codes']['Insert']>;
      };
    };
    Functions: {
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
        Returns: Record<string, unknown>[];
      };
      deduct_coins: {
        Args: { user_id: string; amount: number };
        Returns: { success: boolean; balance: number };
      };
      add_coins: {
        Args: { user_id: string; amount: number; description?: string };
        Returns: { success: boolean; balance: number };
      };
      admin_ban_user: {
        Args: { p_user_id: string; p_reason: string };
        Returns: void;
      };
      admin_unban_user: {
        Args: { p_user_id: string };
        Returns: void;
      };
      admin_set_admin: {
        Args: { p_user_id: string };
        Returns: void;
      };
    };
  };
}
