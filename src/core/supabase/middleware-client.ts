import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { Database } from '@/database.types';
import getSupabaseCookieAdapter from './supabase-cookie-adapter';
import getSupabaseClientKeys from './get-supabase-client-keys';

export default function createMiddlewareClient(
  request: NextRequest,
  response: NextResponse,
) {
  const keys = getSupabaseClientKeys();

  return createServerClient<Database>(keys.url, keys.anonKey, {
    cookies: getCookieStrategy(request, response),
  });
}

function getCookieStrategy(request: NextRequest, response: NextResponse) {
  return getSupabaseCookieAdapter({
    set: (name, value, options) => {
      request.cookies.set({ name, value, ...options });

      response = NextResponse.next({
        request: {
          headers: request.headers,
        },
      });

      response.cookies.set({
        name,
        value,
        ...options,
      });
    },
    get: (name: string) => {
      return request.cookies.get(name)?.value;
    },
    remove: (name, options) => {
      request.cookies.set({
        name,
        value: '',
        ...options,
      });

      response = NextResponse.next({
        request: {
          headers: request.headers,
        },
      });

      response.cookies.set({
        name,
        value: '',
        ...options,
      });
    },
  });
}
