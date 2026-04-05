import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

const GRAPH = 'https://graph.microsoft.com/v1.0';

async function graph(token: string, path: string, method = 'GET', body?: any) {
  const res = await fetch(`${GRAPH}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return res;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { action, token, itemId, newName, parentId, content } = req.body || {};

    if (!action) return res.status(400).json({ error: 'missing_action' });
    if (!token) return res.status(400).json({ error: 'missing_token' });

    switch (action) {

      // 📥 DOWNLOAD (stream)
      case 'download': {
        const id = itemId;
        const fileRes = await fetch(`${GRAPH}/me/drive/items/${id}/content`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!fileRes.ok) {
          const text = await fileRes.text();
          return res.status(500).json({ error: 'download_failed', details: text });
        }

        res.setHeader('Content-Type', fileRes.headers.get('Content-Type') || 'application/octet-stream');
        res.setHeader('Content-Disposition', 'inline');

        fileRes.body.pipe(res);
        return;
      }

      // 📤 UPLOAD (small files)
      case 'upload': {
        const id = parentId || 'root';
        const uploadUrl = `${GRAPH}/me/drive/items/${id}:/${newName}:/content`;

        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: Buffer.from(content, 'base64')
        });

        const json = await uploadRes.json();
        return res.json(json);
      }

      // 🗑 DELETE
      case 'delete': {
        const id = itemId;
        await graph(token, `/me/drive/items/${id}`, 'DELETE');
        return res.json({ success: true });
      }

      // ✏️ RENAME
      case 'rename': {
        const id = itemId;
        const json = await graph(token, `/me/drive/items/${id}`, 'PATCH', {
          name: newName
        }).then(r => r.json());
        return res.json(json);
      }

      // 📁 MOVE
      case 'move': {
        const id = itemId;
        const json = await graph(token, `/me/drive/items/${id}`, 'PATCH', {
          parentReference: { id: parentId }
        }).then(r => r.json());
        return res.json(json);
      }

      // 📝 EDIT TEXT FILE
      case 'edit': {
        const id = itemId;
        const uploadUrl = `${GRAPH}/me/drive/items/${id}/content`;

        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: content
        });

        const json = await uploadRes.json();
        return res.json(json);
      }

      default:
        return res.status(400).json({ error: 'unknown_action' });
    }

  } catch (err: any) {
    return res.status(500).json({ error: 'fileOps_failed', details: err.message });
  }
}
