import { json, withCORS, hmacSha256Hex } from "../_utils";

export const onRequestPost = withCORS(async (ctx: any) => {
  const env = ctx.env as any;
  const form = await ctx.request.formData();
  const ts = form.get("timestamp") as string | null;
  const token = form.get("token") as string | null;
  const signature = form.get("signature") as string | null;

  // Signature verification (allow missing key only for testing)
  if (env.MAILGUN_SIGNING_KEY) {
    const calc = await hmacSha256Hex(env.MAILGUN_SIGNING_KEY, `${ts || ""}${token || ""}`);
    if (calc !== (signature || "")) {
      return json({ error: "invalid signature" }, 403);
    }
  }

  const recipient = (form.get("recipient") as string) || "";
  const fromAddress = (form.get("from") as string) || (form.get("sender") as string) || "";
  const subject = ((form.get("subject") as string) || "").toString();
  const text = ((form.get("stripped-text") as string) || (form.get("body-plain") as string) || "").toString();
  const html = ((form.get("stripped-html") as string) || (form.get("body-html") as string) || "").toString();
  if (!recipient || !fromAddress) {
    return json({ error: "missing recipient/from" }, 400);
  }

  // Insert message
  const now = Date.now();
  const ins = await env.DB.prepare(
    `INSERT INTO messages (to_address, from_address, subject, text_body, html_body, created_at) VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(recipient.toLowerCase(), fromAddress, subject, text, html, now).run();
  const msgId = ins.meta?.last_row_id;

  // Save attachments to R2
  for (const [name, value] of (form as any).entries()) {
    if (!(value instanceof File)) continue;
    if (!name.startsWith("attachment-") && !name.startsWith("inline-")) continue;
    const filename = value.name || "file";
    const contentType = value.type || "application/octet-stream";
    const key = `att/${msgId}/${crypto.randomUUID()}_${filename}`;
    await env.ATTACH.put(key, value.stream(), { httpMetadata: { contentType } });
    const size = (await value.arrayBuffer()).byteLength;
    await env.DB.prepare(
      `INSERT INTO attachments (message_id, filename, content_type, size, r2_key) VALUES (?, ?, ?, ?, ?)`
    ).bind(msgId, filename, contentType, size, key).run();
  }

  return json({ status: "ok", id: msgId });
});
