import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import type { SupabaseClient, User } from '@supabase/supabase-js';

type AuthenticatedRequestHandler = (
  request: Request, // Add request here
  supabase: SupabaseClient,
  user: User,
  params?: any
) => Promise<NextResponse>;

// The outer function that takes the Next.js request and any route params
export function authenticateAndHandle(
    handler: AuthenticatedRequestHandler,
    routeParams?: any
) {
    return async (request: Request) => { // This is the actual function Next.js will call
        const supabase = await createClient(); // createClient might need request context (e.g. cookies)
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }
        return handler(request, supabase, user, routeParams);
    };
}
