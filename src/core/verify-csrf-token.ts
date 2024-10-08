import csrf from 'edge-csrf';
import configuration from '@/configuration';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

const CSRF_SECRET_COOKIE = 'csrfSecret';

/**
 * @name verifyCsrfToken
 * @description Standalone function to verify the CSRF token without the need for a request
 * @param token
 */
async function verifyCsrfToken(token: string) {
  const csrfMiddleware = csrf({
    excludePathPrefixes: ['/api'],
    cookie: {
      secure: configuration.production,
      name: CSRF_SECRET_COOKIE,
    },
  });

  const origin = headers().get('referer') as string;
  const request = new NextRequest(origin);

  request.headers.set(CSRF_SECRET_COOKIE, token);

  const csrfError = await csrfMiddleware(request, new NextResponse());

  if (csrfError) {
    throw new Error('Invalid CSRF token');
  }
}

export default verifyCsrfToken;
