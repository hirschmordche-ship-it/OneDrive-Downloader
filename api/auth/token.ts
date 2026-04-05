import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

const CLIENT_ID = process.env.MS_CLIENT_ID!;
const CLIENT_SECRET = process.env.MS_CLIENT_SECRET!;
const REDIRECT_URI = process.env.MS_REDIRECT_URI!;
const TOKEN_ENDPOINT = 'https://login.microsoftonline.com/consumers/oauth2/v2.0/token';

function getCookie(req: VercelRequest, name: string): string | null {
  const cookie = req.headers.cookie;
  if (!cookie) return null;
  const parts = cookie.split(';').map(c => c.trim());
  for (const part of parts) {
    if (part.startsWith(name + '=')) {
      return decodeURIComponent(part.substring(name.length + 1));
    }
  }
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const { code } = req.body as { code?: string };
  if (!code) {
    return res.status(400).json({ error: 'missing_code' });
  }

  const verifier = getCookie(req, 'pkce_verifier');
  if (!verifier) {
    return res.status(400).json({ error: 'missing_verifier' });
  }

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    scope: 'offline_access openid profile Files.ReadWrite Files.ReadWrite.All',
    code,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code',
    code_verifier: verifier,
    client_secret: CLIENT_SECRET
  });

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    body
  });

  if (!response.ok) {
    const text = await response.text();
    return res.status(500).json({ error: 'token_exchange_failed', details: text });
  }

  const json = await response.json();

  // Return tokens + basic info to frontend (frontend will store per-account)
  res.status(200).json(json);
}
