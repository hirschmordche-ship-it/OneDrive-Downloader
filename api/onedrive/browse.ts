import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

const GRAPH = 'https://graph.microsoft.com/v1.0';

async function graph(token: string, path: string) {
  const res = await fetch(`${GRAPH}${path}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return res.json();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { action, token, itemId, query, accounts } = req.body || {};

    if (!action) return res.status(400).json({ error: 'missing_action' });
    if (!token && action !== 'unifiedList') return res.status(400).json({ error: 'missing_token' });

    switch (action) {

      // 📂 LIST CHILDREN
      case 'list': {
        const id = itemId || 'root';
        const data = await graph(token, `/me/drive/items/${id}/children`);
        return res.json(data);
      }

      // 🧾 METADATA
      case 'metadata': {
        const id = itemId || 'root';
        const data = await graph(token, `/me/drive/items/${id}`);
        return res.json(data);
      }

      // 🔍 SEARCH
      case 'search': {
        const q = encodeURIComponent(query || '');
        const data = await graph(token, `/me/drive/root/search(q='${q}')`);
        return res.json(data);
      }

      // 🧊 UNIFIED LIST (server‑side merge)
      case 'unifiedList': {
        if (!accounts || !Array.isArray(accounts)) {
          return res.status(400).json({ error: 'missing_accounts' });
        }

        const merged: any[] = [];

        for (const acc of accounts) {
          const token = acc.token;
          const id = itemId || 'root';
          try {
            const data = await graph(token, `/me/drive/items/${id}/children`);
            merged.push({
              accountId: acc.accountId,
              items: data.value || []
            });
          } catch (e) {
            merged.push({
              accountId: acc.accountId,
              error: true,
              items: []
            });
          }
        }

        return res.json({ merged });
      }

      default:
        return res.status(400).json({ error: 'unknown_action' });
    }

  } catch (err: any) {
    return res.status(500).json({ error: 'browse_failed', details: err.message });
  }
}
