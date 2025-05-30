export type BabyLogEntry = {
  id: number; // Changed from id?: number
  user_id?: string; // Foreign key to auth.users(id), usually present when fetching
  type: 'urination' | 'defecation';
  timestamp: string; // ISO string format for dates
};

export type ApiError = {
  error: string;
};
