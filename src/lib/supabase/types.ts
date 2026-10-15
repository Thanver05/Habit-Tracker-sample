export type Database = {
  public: {
    Tables: {
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          name?: string;
        };
        Relationships: [];
      };
      habit_completions: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          completed_on: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          user_id?: string;
          completed_on?: string;
          created_at?: string;
        };
        Update: {
          completed_on?: string;
        };
        Relationships: [
          {
            foreignKeyName: "habit_completions_habit_id_user_id_fkey";
            columns: ["habit_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "habits";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};