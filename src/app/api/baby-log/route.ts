import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { BabyLogEntry } from '@/types'; // Import the centralized type

// The BabyLogEntry type might need user_id if you're directly using it with fetched data
// that includes user_id. For insertion, it's handled separately.
// type BabyLogEntry = {
//   id?: number;
//   user_id?: string; // Optional here, but will be in the database
//   type: 'urination' | 'defecation';
//   timestamp: string;
// };

export async function GET(request: Request) {
  const supabase = await createClient();

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('baby_log')
      .select('*')
      .eq('user_id', user.id) // Filter by user_id
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching baby log:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Unexpected error in GET /api/baby-log:', error);
    return NextResponse.json({ 
      error: error.message || 'An unexpected error occurred.'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Explicitly type the body to ensure it matches what we expect.
    const body: { type: 'urination' | 'defecation'; timestamp?: string } = await request.json();

    if (!body.type) {
        return NextResponse.json({ error: "Missing 'type' in request body" }, { status: 400 });
    }


    const newEntry: Omit<BabyLogEntry, 'id'> = {
      type: body.type,
      timestamp: body.timestamp || new Date().toISOString(),
      user_id: user.id, // Add user_id to the new entry
    };

    const { data, error } = await supabase
      .from('baby_log')
      .insert([newEntry])
      .select(); // .select() is good to get the inserted row back

    if (error) {
      console.error('Error inserting baby log entry:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Supabase insert with .select() returns an array.
    // If data exists and is not empty, return the first element.
    if (data && data.length > 0) {
        return NextResponse.json(data[0], { status: 201 });
    } else {
        // This case should ideally not be reached if insert was successful and select() was used.
        // However, good to have a fallback.
        return NextResponse.json({ message: "Entry created but no data returned"}, { status: 201 });
    }

  } catch (error: any) {
    console.error('Unexpected error in POST /api/baby-log:', error);
    // Check if the error is from JSON parsing (e.g. empty body)
    if (error instanceof SyntaxError && error.message.includes("Unexpected end of JSON input")) {
        return NextResponse.json({ error: "Empty or invalid JSON body" }, { status: 400 });
    }
    return NextResponse.json({ 
      error: error.message || 'An unexpected error occurred.'
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const supabase = await createClient();

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as { id?: number };
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id in request body" }, { status: 400 });
    }

    // Ensure the deletion is scoped to the user
    const { error } = await supabase
      .from('baby_log')
      .delete()
      .match({ id: id, user_id: user.id }); // Match both id and user_id

    if (error) {
      console.error('Error deleting baby log entry:', error);
      // More specific error might be useful, e.g., if the row wasn't found (which could be normal)
      return NextResponse.json({ error: "Failed to delete log entry or entry not found" }, { status: 500 });
    }

    return NextResponse.json({ message: "Log entry deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error('Unexpected error in DELETE /api/baby-log:', error);
    if (error instanceof SyntaxError && error.message.includes("Unexpected end of JSON input")) {
        return NextResponse.json({ error: "Empty or invalid JSON body" }, { status: 400 });
    }
    return NextResponse.json({ 
      error: error.message || 'An unexpected error occurred.'
    }, { status: 500 });
  }
}
