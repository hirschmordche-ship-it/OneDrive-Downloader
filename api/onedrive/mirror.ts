import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

const GRAPH = 'https://graph.microsoft.com/v1.0';

async function listChildren(token: string, id: string) {
  const res = await fetch(`${GRAPH}/me/drive/items/${id}/children`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { action, source, target, folderId } = req.body || {};

    if (!action) return res.status(400).json({ error: 'missing_action' });

    switch (action) {

      // 📋 PLAN MIRROR
      case 'plan': {
        const src = await listChildren(source.token, folderId);
        const tgt = await listChildren(target.token, folderId);

        const plan = {
          toUpload: [],
          toUpdate: [],
          toDelete: []
        };

        const tgtMap = new Map(tgt.value.map((i: any) => [i.name, i]));

        for (const item of src.value) {
          const match = tgtMap.get(item.name);
          if (!match) {
            plan.toUpload.push(item);
          } else if (item.size !== match.size || item.lastModifiedDateTime !== match.lastModifiedDateTime) {
            plan.toUpdate.push(item);
          }
        }

        const srcNames = new Set(src.value.map((i: any) => i.name));
        for (const item of tgt.value) {
          if (!srcNames.has(item.name)) {
            plan.toDelete.push(item);
          }
        }

        return res.json(plan);
      }

      // 🔄 SYNC MIRROR
      case 'sync': {
        return res.json({ started: true });
      }

      // 📊 STATUS (placeholder)
      case 'status': {
        return res.json({ status: 'complete' });
      }

      default:
        return res.status(400).json({ error: 'unknown_action' });
    }

  } catch (err: any) {
    return res.status(500).json({ error: 'mirror_failed', details: err.message });
  }
}
