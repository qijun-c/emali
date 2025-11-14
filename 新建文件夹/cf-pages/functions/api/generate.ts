import { json, randLocal, withCORS } from "./_utils";

export const onRequestGet = withCORS(async (ctx: any) => {
  const env = ctx.env as any;
  const local = randLocal();
  const host = new URL(ctx.request.url).host;
  const domain = env.PUBLIC_DOMAIN || host;
  const address = `${local}@${domain}`;
  return json({ address, local });
});
