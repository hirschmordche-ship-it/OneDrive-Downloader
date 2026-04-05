import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

const CLIENT_ID = process.env.MS_CLIENT_ID!;
const REDIRECT_URI = process.env.MS_REDIRECT_URI!; // e.g. https://your-app.vercel.app/api/auth/callback
const AUTHORITY = 'https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize';
const SCOPES = [
  'offline_access',
  'openid',
  'profile',
  'Files.ReadWrite',
  'Files.ReadWrite.All'
].join(' ');

function base64UrlEncode(buffer: Buffer) {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const verifier = base64UrlEncode(crypto.randomBytes(32));
  const challenge = base64UrlEncode(
    crypto.createHash('sha256').update(verifier).digest()
  );

  // store verifier in a secure cookie (short-lived)
  res.setHeader('Set-Cookie', [
    `pkce_verifier=${verifier}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
  ]);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    response_mode: 'query',
    scope: SCOPES,
    code_challenge: challenge,
    code_challenge_method: 'S256'
  });

  res.redirect(`${AUTHORITY}?${params.toString()}`);
}
