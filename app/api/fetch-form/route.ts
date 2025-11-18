import { NextResponse } from 'next/server';
import { ensureValidFormUrl, parseGoogleForm } from '@/lib/googleForm';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'Missing URL.' }, { status: 400 });
    }

    const parsedUrl = ensureValidFormUrl(url);
    const response = await fetch(parsedUrl.toString(), {
      headers: {
        'user-agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Unable to load the provided form.' }, { status: 400 });
    }

    const html = await response.text();
    const resolvedUrl = new URL(response.url || parsedUrl.toString());
    const result = parseGoogleForm(html, resolvedUrl.origin);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
