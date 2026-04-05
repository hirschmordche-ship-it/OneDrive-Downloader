import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code, error, error_description } = req.query;

  if (error) {
    return res.status(400).json({ error, error_description });
  }

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'missing_code' });
  }

  // Frontend will call /api/auth/token via fetch with this code
  // For mobile, we can redirect back to index with code in URL
  const params = new URLSearchParams({ code });
  res.redirect(`/index.html#auth_code=${encodeURIComponent(code)}`);
}
