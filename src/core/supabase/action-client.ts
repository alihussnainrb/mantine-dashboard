import { cache } from 'react';
import { cookies } from 'next/headers';

import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/database.types';

import getSupabaseClientKeys from './get-supabase-client-keys';
import getSupabaseCookieAdapter from './supabase-cookie-adapter';

const createServerSupabaseClient = cache(() => {
  const keys = getSupabaseClientKeys();
  const { get } = getCookiesStrategy();

  return createServerClient<Database>(keys.url!, keys.anonKey!, {
    cookies: {
      get,
    },
  });
});

const getSupabaseServerActionClient = cache(
  (
    params = {
      admin: false,
    },
  ) => {
    const keys = getSupabaseClientKeys();

    if (params.admin) {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!serviceRoleKey) {
        throw new Error('Supabase Service Role Key not provided');
      }

      return createServerClient<Database>(keys.url, serviceRoleKey, {
        auth: {
          persistSession: false,
        },
        cookies: {},
      });
    }

    return createServerSupabaseClient();
  },
);

function getCookiesStrategy() {
  const cookieStore = cookies();

  return getSupabaseCookieAdapter({
    set: (name: string, value: string, options) => {
      cookieStore.set({ name, value, ...options });
    },
    get: (name: string) => {
      return cookieStore.get(name)?.value;
    },
    remove: (name: string) => {
      cookieStore.delete(name);
    },
  });
}

export default getSupabaseServerActionClient;
