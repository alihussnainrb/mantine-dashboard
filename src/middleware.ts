import { NextRequest, NextResponse } from 'next/server';
import csrf from 'edge-csrf';
import createMiddlewareClient from '@/core/supabase/middleware-client';
import configuration from './configuration';
import HttpStatusCode from './core/generic/http-status-code.enum';

const CSRF_TOKEN_HEADER = 'X-CSRF-Token';
const CSRF_SECRET_COOKIE = 'csrfSecret';
const CSRF_TOKEN_BODY_FIELD = 'csrfToken';
const NEXT_ACTION_HEADER = 'next-action';
const NEXT_ACTION_REDIRECT_HEADER = 'x-action-redirect';

// Regex Path
const publicPaths: RegExp[] = [

]

const authRoutes = ['/authentication/signin', '/authentication/signup']


export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|locales|assets|api/stripe/webhook).*)',
    ],
};

const csrfMiddleware = csrf({
    cookie: {
        secure: configuration.production,
        name: CSRF_SECRET_COOKIE,
    },
});


export async function middleware(request: NextRequest) {
    const response = await withCsrfMiddleware(request);
    return sessionMiddleware(request, response);
}

async function sessionMiddleware(req: NextRequest, res: NextResponse) {
    const supabase = createMiddlewareClient(req, res);
    await supabase.auth.getSession();
    const { data: { session } } = await supabase.auth.getSession()

    if (!session && !authRoutes.includes(req.nextUrl.pathname)) {
        return NextResponse.redirect(new URL('/authentication/signin', req.url))
    }
    if (session && authRoutes.includes(req.nextUrl.pathname)) {
        return NextResponse.redirect(new URL('/', req.url))
    }

    return res;
}

async function withCsrfMiddleware(request: NextRequest) {
    const csrfResponse = NextResponse.next();

    if (publicPaths.some((path) => path.test(request.nextUrl.pathname))) {
        return csrfResponse;
    }

    if (isNextAction(request)) {
        const decorated = await decorateHeadersWithCsrfToken(request);
        if (!decorated) {
            return csrfResponse;
        }
    }

    const csrfError = await csrfMiddleware(request, csrfResponse);

    if (csrfError) {
        return NextResponse.json('Invalid CSRF token', {
            status: HttpStatusCode.Forbidden,
        });
    }

    const token = csrfResponse.headers.get(CSRF_TOKEN_HEADER);

    if (token) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set(CSRF_TOKEN_HEADER, token as any);

        const response = NextResponse.next({
            request: { headers: requestHeaders },
        });

        const nextCsrfSecret =
            csrfResponse.cookies.get(CSRF_SECRET_COOKIE)?.value ?? '';

        if (nextCsrfSecret) {
            response.cookies.set(CSRF_SECRET_COOKIE, nextCsrfSecret, {
                secure: configuration.production,
                path: '/',
                sameSite: 'lax',
                httpOnly: true,
            });
        }

        return response;
    }

    return csrfResponse;
}


function isNextAction(request: NextRequest) {
    const headers = new Headers(request.headers);

    return (
        headers.has(NEXT_ACTION_HEADER) && !headers.has(NEXT_ACTION_REDIRECT_HEADER)
    );
}


async function decorateHeadersWithCsrfToken(request: NextRequest) {
    const { data, type } = await parsePayload(request);

    if (type === 'json') {
        if (!Array.isArray(data) || data.length === 0) {
            return false;
        }

        const csrfToken = data[0][CSRF_TOKEN_BODY_FIELD];

        if (csrfToken) {
            request.headers.set(CSRF_TOKEN_HEADER, csrfToken);
        }

        return true;
    }

    return false;
}


async function parsePayload(request: NextRequest) {
    const clone = request.clone();

    try {
        const type = 'json';
        const data = await clone.json();

        return {
            type,
            data,
        };
    } catch (e) {
        return {
            type: undefined,
            data: null,
        };
    }
}
