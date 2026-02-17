import { NextResponse } from 'next/server';

const BASE_URL = 'https://app.dms.salasah.sa';

function getBackendUrl(endpoint) {
    if (endpoint.startsWith('api/')) {
        return `${BASE_URL}/${endpoint}`;
    }
    return `${BASE_URL}/api/method/${endpoint}`;
}

export async function GET(request, { params }) {
    const { path } = await params;
    const endpoint = path.join('/');
    const url = new URL(request.url);
    const queryString = url.search;

    const backendUrl = `${getBackendUrl(endpoint)}${queryString}`;

    try {
        const backendResponse = await fetch(backendUrl, {
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

    const backendUrl = getBackendUrl(endpoint);

    // Forward headers
    const headers = new Headers();
    if (request.headers.get('cookie')) headers.set('cookie', request.headers.get('cookie'));
    if (request.headers.get('content-type')) headers.set('content-type', request.headers.get('content-type'));
    headers.set('Accept', 'application/json');

    try {
        const backendResponse = await fetch(backendUrl, {
            method: 'POST',
            headers: headers,
            body: request.body,
            duplex: 'half',
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
export async function PUT(request, { params }) {
    const { path } = await params;
    const endpoint = path.join('/');

    const backendUrl = getBackendUrl(endpoint);

    // Forward headers
    const headers = new Headers();
    if (request.headers.get('cookie')) headers.set('cookie', request.headers.get('cookie'));
    if (request.headers.get('content-type')) headers.set('content-type', request.headers.get('content-type'));
    headers.set('Accept', 'application/json');

    try {
        const backendResponse = await fetch(backendUrl, {
            method: 'PUT',
            headers: headers,
            body: request.body,
            duplex: 'half',
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

export async function DELETE(request, { params }) {
    const { path } = await params;
    const endpoint = path.join('/');

    const backendUrl = getBackendUrl(endpoint);

    // Forward headers
    const headers = new Headers();
    if (request.headers.get('cookie')) headers.set('cookie', request.headers.get('cookie'));
    headers.set('Accept', 'application/json');

    try {
        const backendResponse = await fetch(backendUrl, {
            method: 'DELETE',
            headers: headers,
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
