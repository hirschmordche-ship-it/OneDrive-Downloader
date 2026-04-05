export default async function handler(req, res) {
  try {
    const { token, itemId } = req.body;

    const url = itemId
      ? `https://graph.microsoft.com/v1.0/me/drive/items/${itemId}/children`
      : `https://graph.microsoft.com/v1.0/me/drive/root/children`;

    const graphRes = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const json = await graphRes.json();
    res.status(200).json(json);
  } catch (e) {
    res.status(500).json({ error: "Browse failed" });
  }
}
