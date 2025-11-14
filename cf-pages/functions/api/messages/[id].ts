import { json, withCORS } from "../_utils";

export const onRequestGet = withCORS(async (ctx: any) => {
  const idStr = ctx.params.id as string;
  const id = Number(idStr);
  if (!id) return json({ error: "invalid id" }, 400);

  const msg = await ctx.env.DB.prepare(
    `SELECT id, to_address, from_address, subject, text_body, html_body, created_at FROM messages WHERE id = ?`
  ).bind(id).first();
  if (!msg) return json({ error: "not found" }, 404);
  const att = await ctx.env.DB.prepare(
    `SELECT id, filename, content_type, size FROM attachments WHERE message_id = ?`
  ).bind(id).all();
  msg.attachments = att.results || [];
  return json(msg);
});
