import { NextResponse } from 'next/server';
import { BabyLogEntry } from '@/types'; // Import the centralized type
import { authenticateAndHandle } from '@/utils/apiUtils';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { TABLE_NAMES } from '@/constants/db';

async function getLogic(request: Request, supabase: SupabaseClient, user: User) {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAMES.BABY_LOG)
      .select('*')
      .eq('user_id', user.id) // Filter by user_id
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching baby log:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data });
  } catch (error: any) {
    console.error('Unexpected error in GET /api/baby-log:', error);
    return NextResponse.json({ 
      success: false, error: error.message || 'An unexpected error occurred.'
    }, { status: 500 });
  }
}

async function postLogic(request: Request, supabase: SupabaseClient, user: User) {
  const ALLOWED_LOG_TYPES = ['urination', 'defecation'];
  try {
    // Explicitly type the body to ensure it matches what we expect.
    const body: { type: 'urination' | 'defecation'; timestamp?: string } = await request.json();

    if (!body.type) {
        return NextResponse.json({ success: false, error: "Missing 'type' in request body" }, { status: 400 });
    }
    if (!ALLOWED_LOG_TYPES.includes(body.type)) {
        return NextResponse.json({
            success: false,
            error: `Invalid 'type' in request body. Must be one of: ${ALLOWED_LOG_TYPES.join(', ')}`
        }, { status: 400 });
    }

    const newEntry: Omit<BabyLogEntry, 'id'> = {
      type: body.type,
      timestamp: body.timestamp || new Date().toISOString(),
      user_id: user.id, // Add user_id to the new entry
    };

    const { data, error } = await supabase
      .from(TABLE_NAMES.BABY_LOG)
      .insert([newEntry])
      .select(); // .select() is good to get the inserted row back

    if (error) {
      console.error('Error inserting baby log entry:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Supabase insert with .select() returns an array.
    // If data exists and is not empty, return the first element.
    if (data && data.length > 0) {
        return NextResponse.json({ success: true, data: data[0] }, { status: 201 });
    } else {
        // This case should ideally not be reached if insert was successful and select() was used.
        // However, good to have a fallback.
        return NextResponse.json({ success: true, message: "Entry created but no data returned", data: null }, { status: 201 });
    }

  } catch (error: any) {
    console.error('Unexpected error in POST /api/baby-log:', error);
    // Check if the error is from JSON parsing (e.g. empty body)
    if (error instanceof SyntaxError && error.message.includes("Unexpected end of JSON input")) {
        return NextResponse.json({ success: false, error: "Empty or invalid JSON body" }, { status: 400 });
    }
    return NextResponse.json({ 
      success: false, error: error.message || 'An unexpected error occurred.'
    }, { status: 500 });
  }
}

async function deleteLogic(request: Request, supabase: SupabaseClient, user: User) {
  try {
    const body = await request.json() as { id?: number };
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing id in request body" }, { status: 400 });
    }

    // Ensure the deletion is scoped to the user
    const { error } = await supabase
      .from(TABLE_NAMES.BABY_LOG)
      .delete()
      .match({ id: id, user_id: user.id }); // Match both id and user_id

    if (error) {
      console.error('Error deleting baby log entry:', error);
      // More specific error might be useful, e.g., if the row wasn't found (which could be normal)
      return NextResponse.json({ success: false, error: "Failed to delete log entry or entry not found" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Log entry deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error('Unexpected error in DELETE /api/baby-log:', error);
    if (error instanceof SyntaxError && error.message.includes("Unexpected end of JSON input")) {
        return NextResponse.json({ success: false, error: "Empty or invalid JSON body" }, { status: 400 });
    }
    return NextResponse.json({ 
      success: false, error: error.message || 'An unexpected error occurred.'
    }, { status: 500 });
  }
}

export const GET = authenticateAndHandle(getLogic);
export const POST = authenticateAndHandle(postLogic);
export const DELETE = authenticateAndHandle(deleteLogic);
