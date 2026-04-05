import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

const GRAPH = 'https://graph.microsoft.com/v1.0';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { action, token, itemId } = req.body || {};

    if (!action) return res.status(400).json({ error: 'missing_action' });
    if (!token) return res.status(400).json({ error: 'missing_token' });

    switch (action) {

      // 🔗 CREATE SHARE LINK
      case 'create': {
        const response = await fetch(`${GRAPH}/me/drive/items/${itemId}/createLink`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ type: 'view', scope: 'anonymous' })
        });
        const json = await response.json();
        return res.json(json);
      }

      // ❌ REVOKE SHARE LINK
      case 'revoke': {
        await fetch(`${GRAPH}/me/drive/items/${itemId}/permissions`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        return res.json({ success: true });
      }

      // 📜 LIST SHARE LINKS
      case 'list': {
        const response = await fetch(`${GRAPH}/me/drive/items/${itemId}/permissions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await response.json();
        return res.json(json);
      }

      default:
        return res.status(400).json({ error: 'unknown_action' });
    }

  } catch (err: any) {
    return res.status(500).json({ error: 'share_failed', details: err.message });
  }
}
