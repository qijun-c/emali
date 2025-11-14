import { withCORS } from "../_utils";

export const onRequestGet = withCORS(async (ctx: any) => {
  const idStr = ctx.params.id as string;
  const id = Number(idStr);
  if (!id) return new Response("invalid id", { status: 400 });

  const att = await ctx.env.DB.prepare(
    `SELECT a.id, a.filename, a.content_type, a.size, a.r2_key FROM attachments a WHERE a.id = ?`
  ).bind(id).first();
  if (!att) return new Response("not found", { status: 404 });

  const obj = await ctx.env.ATTACH.get(att.r2_key);
  if (!obj) return new Response("not found", { status: 404 });

  const headers: Record<string, string> = {
    "content-type": att.content_type || "application/octet-stream",
    "content-disposition": `attachment; filename="${att.filename}"`,
    "access-control-allow-origin": "*",
  };
  return new Response(obj.body, { headers });
});
