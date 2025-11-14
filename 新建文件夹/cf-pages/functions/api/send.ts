import { json, withCORS } from "./_utils";

export const onRequestPost = withCORS(async (ctx: any) => {
  const env = ctx.env as any;
  const body = await ctx.request.json().catch(() => ({}));
  const { from_address, to, subject, text, html } = body || {};
  if (!env.MAILGUN_DOMAIN || !env.MAILGUN_API_KEY) {
    return json({ error: "Mailgun not configured" }, 500);
  }
  if (!from_address || !to || !subject) {
    return json({ error: "missing fields" }, 400);
  }
  const apiBase = env.MAILGUN_API_BASE || "https://api.mailgun.net";
  const url = `${apiBase}/v3/${env.MAILGUN_DOMAIN}/messages`;
  const form = new URLSearchParams();
  form.set("from", from_address);
  form.set("to", to);
  form.set("subject", subject);
  if (text) form.set("text", text);
  if (html) form.set("html", html);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Basic " + btoa(`api:${env.MAILGUN_API_KEY}`),
      "content-type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });
  if (!res.ok) {
    const t = await res.text();
    return json({ error: `Mailgun error: ${t}` }, 502);
  }
  return json({ status: "sent" });
});
