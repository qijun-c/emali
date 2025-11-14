import { json, withCORS } from "./_utils";

export const onRequestGet = withCORS(async (ctx: any) => {
  const env = ctx.env as any;
  const origin = new URL(ctx.request.url).origin;
  const host = new URL(ctx.request.url).host;
  return json({ public_domain: env.PUBLIC_DOMAIN || host, base_url: origin });
});
