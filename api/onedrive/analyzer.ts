import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

const GRAPH = 'https://graph.microsoft.com/v1.0';

async function listAll(token: string, id = 'root') {
  const res = await fetch(`${GRAPH}/me/drive/items/${id}/children`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const json = await res.json();
  return json.value || [];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { action, token } = req.body || {};

    if (!action) return res.status(400).json({ error: 'missing_action' });
    if (!token) return res.status(400).json({ error: 'missing_token' });

    const items = await listAll(token);

    switch (action) {

      case 'usage': {
        const total = items.reduce((sum, i) => sum + (i.size || 0), 0);
        return res.json({ total });
      }

      case 'largest': {
        const sorted = [...items].sort((a, b) => (b.size || 0) - (a.size || 0));
        return res.json(sorted.slice(0, 20));
      }

      case 'types': {
        const map: any = {};
        for (const i of items) {
          const ext = i.name.split('.').pop().toLowerCase();
          map[ext] = (map[ext] || 0) + 1;
        }
        return res.json(map);
      }

      case 'duplicates': {
        const map: any = {};
        for (const i of items) {
          map[i.name] = map[i.name] || [];
          map[i.name].push(i);
        }
        const dups = Object.values(map).filter((arr: any) => arr.length > 1);
        return res.json(dups);
      }

      default:
        return res.status(400).json({ error: 'unknown_action' });
    }

  } catch (err: any) {
    return res.status(500).json({ error: 'analyzer_failed', details: err.message });
  }
}
