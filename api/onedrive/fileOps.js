export default async function handler(req, res) {
  try {
    const { token, itemId, action } = req.body;

    if (action === "download") {
      const meta = await fetch(
        `https://graph.microsoft.com/v1.0/me/drive/items/${itemId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const metaJson = await meta.json();

      const downloadUrl = metaJson["@microsoft.graph.downloadUrl"];
      const fileRes = await fetch(downloadUrl);

      const buffer = await fileRes.arrayBuffer();

      res.setHeader("Content-Type", "application/octet-stream");
      res.send(Buffer.from(buffer));
      return;
    }

    res.status(400).json({ error: "Unknown action" });
  } catch (e) {
    res.status(500).json({ error: "File operation failed" });
  }
}
