export type Operator = "+" | "-" | "*" | "/";

export type GestureSource = "custom" | "builtin" | "heuristic";

export type StorageMode = "offline" | "memory" | "database";

export type Handedness = "Left" | "Right" | "Unknown";

export interface CameraOverlayBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface RecognizedGesture {
  label: string;
  token: string;
  confidence: number;
  source: GestureSource;
  handedness: Handedness;
}

export interface HistoryEntry {
  id: string;
  expression: string;
  result: string;
  tokens: string[];
  sourceLabel?: string | null;
  sourceType?: string | null;
  createdAt: string;
}

export interface HistoryListResponse {
  items: HistoryEntry[];
  storageMode: Exclude<StorageMode, "offline">;
}

export interface CreateHistoryPayload {
  expression: string;
  result: string;
  tokens: string[];
  sourceLabel?: string;
  sourceType?: GestureSource;
}
