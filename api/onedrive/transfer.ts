import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

const GRAPH = 'https://graph.microsoft.com/v1.0';

async function downloadFile(token: string, id: string) {
  const res = await fetch(`${GRAPH}/me/drive/items/${id}/content`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(await res.text());
  return Buffer.from(await res.arrayBuffer());
}

async function uploadFile(token: string, parentId: string, name: string, data: Buffer) {
  const res = await fetch(`${GRAPH}/me/drive/items/${parentId}:/${name}:/content`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: data
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { action, source, target, itemId, parentId } = req.body || {};

    if (!action) return res.status(400).json({ error: 'missing_action' });

    switch (action) {

      // 📄 COPY FILE A → B
      case 'copyFile': {
        const fileData = await downloadFile(source.token, itemId);
        const uploaded = await uploadFile(target.token, parentId, source.name, fileData);
        return res.json(uploaded);
      }

      // 📁 COPY FOLDER A → B (recursive)
      case 'copyFolder': {
        async function copyFolderRecursive(srcToken: string, tgtToken: string, srcId: string, tgtParent: string) {
          const metaRes = await fetch(`${GRAPH}/me/drive/items/${srcId}`, {
            headers: { Authorization: `Bearer ${srcToken}` }
          });
          const meta = await metaRes.json();

          // create folder in target
          const newFolderRes = await fetch(`${GRAPH}/me/drive/items/${tgtParent}/children`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${tgtToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: meta.name,
              folder: {},
              '@microsoft.graph.conflictBehavior': 'rename'
            })
          });
          const newFolder = await newFolderRes.json();

          // list children
          const childrenRes = await fetch(`${GRAPH}/me/drive/items/${srcId}/children`, {
            headers: { Authorization: `Bearer ${srcToken}` }
          });
          const children = await childrenRes.json();

          for (const item of children.value || []) {
            if (item.folder) {
              await copyFolderRecursive(srcToken, tgtToken, item.id, newFolder.id);
            } else {
              const fileData = await downloadFile(srcToken, item.id);
              await uploadFile(tgtToken, newFolder.id, item.name, fileData);
            }
          }

          return newFolder;
        }

        const result = await copyFolderRecursive(source.token, target.token, itemId, parentId);
        return res.json(result);
      }

      // 📦 BATCH COPY
      case 'batchCopy': {
        const results = [];
        for (const entry of source.items) {
          if (entry.folder) {
            results.push(await handler({
              body: {
                action: 'copyFolder',
                source,
                target,
                itemId: entry.id,
                parentId
              }
            } as any, { json: (x: any) => x } as any));
          } else {
            const fileData = await downloadFile(source.token, entry.id);
            results.push(await uploadFile(target.token, parentId, entry.name, fileData));
          }
        }
        return res.json({ results });
      }

      default:
        return res.status(400).json({ error: 'unknown_action' });
    }

  } catch (err: any) {
    return res.status(500).json({ error: 'transfer_failed', details: err.message });
  }
}
