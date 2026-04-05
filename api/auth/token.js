export default async function handler(req, res) {
  try {
    const { code } = req.body;

    const params = new URLSearchParams();
    params.append("client_id", process.env.MS_CLIENT_ID);
    params.append("client_secret", process.env.MS_CLIENT_SECRET);
    params.append("redirect_uri", process.env.MS_REDIRECT_URI);
    params.append("grant_type", "authorization_code");
    params.append("code", code);

    const tokenRes = await fetch(
      "https://login.microsoftonline.com/consumers/oauth2/v2.0/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
      }
    );

    const json = await tokenRes.json();
    res.status(200).json(json);
  } catch (e) {
    res.status(500).json({ error: "Token exchange failed" });
  }
}
