export type BabyLogEntry = {
  id?: number; // Supabase will handle ID generation in the database table
  user_id?: string; // Foreign key to auth.users(id), usually present when fetching
  type: 'urination' | 'defecation';
  timestamp: string; // ISO string format for dates
};
