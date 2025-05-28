import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

type BabyLogEntry = {
  id?: number; // Supabase will handle ID generation
  type: 'urination' | 'defecation';
  timestamp: string;
};

export async function GET(request: Request) {
  const { data, error } = await supabase
    .from('baby_log')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Error fetching baby log:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { type }: { type: 'urination' | 'defecation' } = await request.json();
  const newEntry: Omit<BabyLogEntry, 'id'> = {
    type,
    timestamp: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('baby_log')
    .insert([newEntry])
    .select();

  if (error) {
    console.error('Error inserting baby log entry:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data[0], { status: 201 });
}