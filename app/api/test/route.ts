import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const key = process.env.DEEPSEEK_API_KEY || '';
  const baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

  // Test the API key with a simple call
  try {
    const res = await fetch(`${baseUrl}/v1/models`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    const text = await res.text();
    return new Response(JSON.stringify({
      hasKey: key.length > 0,
      keyPrefix: key.slice(0, 8) + '...',
      baseUrl,
      status: res.status,
      response: text.slice(0, 200),
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({
      hasKey: key.length > 0,
      keyPrefix: key.slice(0, 8) + '...',
      baseUrl,
      error: String(e),
    }), { headers: { 'Content-Type': 'application/json' } });
  }
}
