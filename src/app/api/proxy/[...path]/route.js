import { NextResponse } from 'next/server';

const BACKEND_URL = 'https://dms.salasah.sa/api/method';

export async function GET(request, { params }) {
    const { path } = await params;
    const endpoint = path.join('/');
    const url = new URL(request.url);
    const queryString = url.search;

    try {
        const backendResponse = await fetch(`${BACKEND_URL}/${endpoint}${queryString}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Cookie': request.headers.get('cookie') || '',
            },
        });

        const data = await backendResponse.json();
        const response = NextResponse.json(data, { status: backendResponse.status });

        const setCookies = backendResponse.headers.getSetCookie?.() || [];
        setCookies.forEach(cookie => {
            response.headers.append('Set-Cookie', cookie);
        });

        return response;
    } catch (error) {
        return NextResponse.json({ message: 'Proxy error', error: error.message }, { status: 500 });
    }
}

export async function POST(request, { params }) {
    const { path } = await params;
    const endpoint = path.join('/');

    let body;
    try {
        body = await request.json();
    } catch {
        body = undefined;
    }

    try {
        const backendResponse = await fetch(`${BACKEND_URL}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cookie': request.headers.get('cookie') || '',
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        const data = await backendResponse.json();
        const response = NextResponse.json(data, { status: backendResponse.status });

        const setCookies = backendResponse.headers.getSetCookie?.() || [];
        setCookies.forEach(cookie => {
            response.headers.append('Set-Cookie', cookie);
        });

        return response;
    } catch (error) {
        return NextResponse.json({ message: 'Proxy error', error: error.message }, { status: 500 });
    }
}
