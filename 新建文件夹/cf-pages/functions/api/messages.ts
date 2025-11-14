import { json, withCORS } from "./_utils";

export const onRequestGet = withCORS(async (ctx: any) => {
  const url = new URL(ctx.request.url);
  const local = url.searchParams.get("local");
  let q = `SELECT id, to_address, from_address, subject, text_body, html_body, created_at FROM messages ORDER BY created_at DESC LIMIT 50`;
  let params: any[] = [];
  if (local) {
    q = `SELECT id, to_address, from_address, subject, text_body, html_body, created_at FROM messages WHERE to_address LIKE ? ORDER BY created_at DESC LIMIT 50`;
    params = [`${local}@%`];
  }
  const res = await ctx.env.DB.prepare(q).bind(...params).all();
  const rows = (res.results || []).map((r: any) => ({
    ...r,
    attachments: [],
  }));
  for (const row of rows) {
    const att = await ctx.env.DB.prepare(
      `SELECT id, filename, content_type, size FROM attachments WHERE message_id = ?`
    ).bind(row.id).all();
    row.attachments = att.results || [];
  }
  return json(rows);
});
