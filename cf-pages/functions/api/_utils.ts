export type Env = any;

export const json = (data: any, init: number | ResponseInit = 200) =>
  new Response(JSON.stringify(data), {
    status: typeof init === "number" ? init : init.status ?? 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "*",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      ...(typeof init === "object" ? init.headers : {}),
    },
  });

export const text = (body: string, init: number | ResponseInit = 200) =>
  new Response(body, {
    status: typeof init === "number" ? init : init.status ?? 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "access-control-allow-origin": "*",
      ...(typeof init === "object" ? init.headers : {}),
    },
  });

export function hex(buffer: ArrayBuffer): string {
  const arr = new Uint8Array(buffer);
  let s = "";
  for (const b of arr) s += b.toString(16).padStart(2, "0");
  return s;
}

export async function hmacSha256Hex(key: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(data));
  return hex(sig);
}

export function randLocal(len = 8) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "nebula-";
  for (let i = 0; i < len; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

export function ok() {
  return json({ status: "ok" });
}

export function withCORS(handler: any): any {
  return async (ctx: any) => {
    if (ctx.request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-headers": "*",
          "access-control-allow-methods": "GET,POST,OPTIONS",
        },
      });
    }
    return handler(ctx);
  };
}
