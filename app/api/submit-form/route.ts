import { NextResponse } from 'next/server';
import { ensureValidFormUrl } from '@/lib/googleForm';

interface SubmitPayload {
  action: string;
  values: Record<string, string | string[]>;
  hiddenFields?: Record<string, string>;
}

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { action, values, hiddenFields }: SubmitPayload = await request.json();

    if (!action || !values) {
      return NextResponse.json({ error: 'Missing submission payload.' }, { status: 400 });
    }

    const target = ensureValidFormUrl(action).toString();
    const params = new URLSearchParams();

    if (hiddenFields) {
      for (const [key, value] of Object.entries(hiddenFields)) {
        if (typeof value === 'string') {
          params.append(key, value);
        }
      }
    }

    for (const [key, rawValue] of Object.entries(values)) {
      if (Array.isArray(rawValue)) {
        for (const value of rawValue) {
          params.append(key, value);
        }
      } else if (rawValue !== undefined && rawValue !== null) {
        params.append(key, rawValue);
      }
    }

    const response = await fetch(target, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
      redirect: 'manual',
    });

    if (response.status >= 200 && response.status < 400) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Submission rejected by Google Forms.' }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
