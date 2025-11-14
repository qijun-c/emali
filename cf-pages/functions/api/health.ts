export const onRequestGet = async () => new Response(JSON.stringify({ status: "ok" }), { headers: { "content-type": "application/json", "access-control-allow-origin": "*" } });
