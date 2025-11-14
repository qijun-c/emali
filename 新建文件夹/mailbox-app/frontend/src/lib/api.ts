export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api";

export type GenerateOut = { address: string; local: string };
export type AttachmentOut = { id: number; filename: string; content_type: string; size: number };
export type MessageOut = {
  id: number;
  to_address: string;
  from_address: string;
  subject: string;
  text_body: string;
  html_body: string;
  created_at: string;
  attachments: AttachmentOut[];
};

async function apiGet<T>(path: string): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function apiPost<T>(path: string, body: any): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export const generateAddress = () => apiGet<GenerateOut>(`/generate`);
export const listMessages = (local?: string) =>
  apiGet<MessageOut[]>(local ? `/messages?local=${encodeURIComponent(local)}` : `/messages`);
export const getMessage = (id: number) => apiGet<MessageOut>(`/messages/${id}`);
export const getInfo = () => apiGet<{ public_domain: string; base_url: string }>(`/info`);
export const sendEmail = (payload: {
  from_address: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) => apiPost<{ status: string }>(`/send`, payload);

export const attachmentDownloadUrl = (id: number) => `${API_BASE}/attachments/${id}/download`;
