import { NextResponse } from 'next/server';

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Allow public routes
    if (
        pathname.startsWith('/login') ||
        pathname.startsWith('/api/') ||
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/favicon') ||
        pathname.startsWith('/manifest') ||
        pathname === '/'
    ) {
        return NextResponse.next();
    }

    // Check for session cookie
    const sid = request.cookies.get('sid');

    if (!sid || sid.value === 'Guest') {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
