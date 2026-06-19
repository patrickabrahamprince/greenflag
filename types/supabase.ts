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
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      standards: {
        Row: {
          id: string;
          host_id: string;
          name: string;
          difficulty: 'easy' | 'medium' | 'hard';
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['standards']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['standards']['Insert']>;
      };
      intentions: {
        Row: {
          id: string;
          standard_id: string;
          day: number;
          description: string;
          type: 'photo' | 'voice' | 'text' | 'location';
        };
        Insert: Omit<Database['public']['Tables']['intentions']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['intentions']['Insert']>;
      };
      connections: {
        Row: {
          id: string;
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
      deduct_coins: {
        Args: { user_id: string; amount: number };
        Returns: { success: boolean; balance: number };
      };
      add_coins: {
        Args: { user_id: string; amount: number; description?: string };
        Returns: { success: boolean; balance: number };
      };
    };
  };
}
