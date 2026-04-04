import type {
  CreateHistoryPayload,
  HistoryEntry,
  HistoryListResponse,
} from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Backend error (${response.status})`);
  }

  return (await response.json()) as T;
}

function normalizeHistoryEntry(item: {
  id: string;
  expression: string;
  result: string;
  tokens: string[];
  source_label?: string | null;
  source_type?: string | null;
  created_at: string;
}): HistoryEntry {
  return {
    id: item.id,
    expression: item.expression,
    result: item.result,
    tokens: item.tokens,
    sourceLabel: item.source_label,
    sourceType: item.source_type,
    createdAt: item.created_at,
  };
}

export async function fetchHistory(limit = 8): Promise<HistoryListResponse> {
  const response = await fetch(`${API_BASE_URL}/history?limit=${limit}`, {
    cache: "no-store",
  });

  const payload = await parseJson<{
    items: Array<{
      id: string;
      expression: string;
      result: string;
      tokens: string[];
      source_label?: string | null;
      source_type?: string | null;
      created_at: string;
    }>;
    storage_mode: "memory" | "database";
  }>(response);

  return {
    items: payload.items.map(normalizeHistoryEntry),
    storageMode: payload.storage_mode,
  };
}

export async function createHistory(payload: CreateHistoryPayload) {
  const response = await fetch(`${API_BASE_URL}/history`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      expression: payload.expression,
      result: payload.result,
      tokens: payload.tokens,
      source_label: payload.sourceLabel,
      source_type: payload.sourceType,
    }),
  });

  const created = await parseJson<{
    id: string;
    expression: string;
    result: string;
    tokens: string[];
    source_label?: string | null;
    source_type?: string | null;
    created_at: string;
  }>(response);

  return normalizeHistoryEntry(created);
}
