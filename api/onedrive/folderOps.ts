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
    const { action, token, parentId, itemId, newName } = req.body || {};

    if (!action) return res.status(400).json({ error: 'missing_action' });
    if (!token) return res.status(400).json({ error: 'missing_token' });

    switch (action) {

      // 📁 CREATE FOLDER
      case 'create': {
        const id = parentId || 'root';
        const json = await graph(token, `/me/drive/items/${id}/children`, 'POST', {
          name: newName,
          folder: {},
          '@microsoft.graph.conflictBehavior': 'rename'
        }).then(r => r.json());
        return res.json(json);
      }

      // ✏️ RENAME FOLDER
      case 'rename': {
        const id = itemId;
        const json = await graph(token, `/me/drive/items/${id}`, 'PATCH', {
          name: newName
        }).then(r => r.json());
        return res.json(json);
      }

      // 📦 MOVE FOLDER
      case 'move': {
        const id = itemId;
        const json = await graph(token, `/me/drive/items/${id}`, 'PATCH', {
          parentReference: { id: parentId }
        }).then(r => r.json());
        return res.json(json);
      }

      // 🗑 DELETE FOLDER
      case 'delete': {
        const id = itemId;
        await graph(token, `/me/drive/items/${id}`, 'DELETE');
        return res.json({ success: true });
      }

      // 🌲 GET FOLDER TREE (recursive)
      case 'tree': {
        async function getTree(folderId: string): Promise<any> {
          const children = await graph(token, `/me/drive/items/${folderId}/children`).then(r => r.json());
          const result: any = { id: folderId, children: [] };

          for (const item of children.value || []) {
            if (item.folder) {
              result.children.push(await getTree(item.id));
            } else {
              result.children.push({ id: item.id, name: item.name, file: true });
            }
          }

          return result;
        }

        const id = itemId || 'root';
        const tree = await getTree(id);
        return res.json(tree);
      }

      default:
        return res.status(400).json({ error: 'unknown_action' });
    }

  } catch (err: any) {
    return res.status(500).json({ error: 'folderOps_failed', details: err.message });
  }
}
