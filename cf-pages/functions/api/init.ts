import { json, withCORS } from "./_utils";

async function initDB(env: any) {
  const sql1 = `CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  to_address TEXT NOT NULL,
  from_address TEXT NOT NULL,
  subject TEXT DEFAULT '',
  text_body TEXT DEFAULT '',
  html_body TEXT DEFAULT '',
  created_at INTEGER NOT NULL
);`;
  const sql2 = `CREATE INDEX IF NOT EXISTS ix_messages_to_created ON messages (to_address, created_at DESC);`;
  const sql3 = `CREATE TABLE IF NOT EXISTS attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id INTEGER NOT NULL,
  filename TEXT NOT NULL,
  content_type TEXT DEFAULT 'application/octet-stream',
  size INTEGER DEFAULT 0,
  r2_key TEXT NOT NULL,
  FOREIGN KEY(message_id) REFERENCES messages(id) ON DELETE CASCADE
);`;
  await env.DB.prepare(sql1).run();
  await env.DB.prepare(sql2).run();
  await env.DB.prepare(sql3).run();
}

export const onRequestGet = withCORS(async (ctx: any) => {
  await initDB(ctx.env);
  return json({ status: "ok" });
});

export const onRequestPost = withCORS(async (ctx: any) => {
  await initDB(ctx.env);
  return json({ status: "ok" });
});
