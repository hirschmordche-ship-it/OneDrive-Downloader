export default function handler(req, res) {
  const clientId = process.env.MS_CLIENT_ID;
  const redirect = process.env.MS_REDIRECT_URI;

  const url =
    "https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize" +
    "?client_id=" + clientId +
    "&response_type=code" +
    "&redirect_uri=" + encodeURIComponent(redirect) +
    "&response_mode=query" +
    "&scope=" + encodeURIComponent("offline_access Files.ReadWrite.All");

  res.redirect(url);
}
