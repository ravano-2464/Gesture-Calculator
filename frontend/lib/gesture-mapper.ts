import type { GestureRecognizerResult } from "@mediapipe/tasks-vision";
import type { Handedness, RecognizedGesture } from "@/lib/types";

type Landmark = {
  x: number;
  y: number;
  z?: number;
};

type GestureResolutionInput = {
  label?: string;
  confidence?: number;
  handedness?: Handedness;
  landmarks?: Landmark[];
};

const CUSTOM_LABEL_MAP: Record<string, string> = {
  NUMBER_ZERO: "0",
  NUMBER_ONE: "1",
  NUMBER_TWO: "2",
  NUMBER_THREE: "3",
  NUMBER_FOUR: "4",
  NUMBER_FIVE: "5",
  NUMBER_SIX: "6",
  NUMBER_SEVEN: "7",
  NUMBER_EIGHT: "8",
  NUMBER_NINE: "9",
  OP_PLUS: "+",
  OP_MINUS: "-",
  OP_MULTIPLY: "*",
  OP_DIVIDE: "/",
  OP_EQUALS: "=",
};

const RIGHT_HAND_OPERATOR_MAP: Record<string, string> = {
  Thumb_Up: "+",
  Thumb_Down: "-",
  ILoveYou: "*",
  Victory: "/",
  Open_Palm: "=",
};

export const GESTURE_MAPPING_GUIDE = [
  "Angka 0-5 dibaca dari jumlah jari tangan kiri yang terangkat.",
  "Operator dibaca dari gesture tangan kanan: Thumb_Up (+), Thumb_Down (-), ILoveYou (*), Victory (/), dan Open_Palm (=).",
  "Angka 6-9 belum aktif di demo default dan butuh custom gesture model.",
];

export type GestureLegendItem = {
  id: string;
  token: string;
  title: string;
  hand: "Left" | "Right" | "Custom";
  detection: string;
  systemLabel: string;
  source: string;
  note: string;
  readiness: "ready" | "custom-model";
  labels: string[];
};

export const GESTURE_LEGEND: GestureLegendItem[] = [
  {
    id: "digit-0",
    token: "0",
    title: "Angka 0",
    hand: "Left",
    detection: "Tangan kiri tanpa jari yang terangkat.",
    systemLabel: "LEFT_HAND_0 / NUMBER_ZERO",
    source: "Heuristic finger count",
    note: "Gunakan kepalan ringan atau telapak tertutup untuk memasukkan angka 0.",
    readiness: "ready",
    labels: ["LEFT_HAND_0", "NUMBER_ZERO"],
  },
  {
    id: "digit-1",
    token: "1",
    title: "Angka 1",
    hand: "Left",
    detection: "Tangan kiri dengan 1 jari terangkat.",
    systemLabel: "LEFT_HAND_1 / NUMBER_ONE",
    source: "Heuristic finger count",
    note: "Pakai satu jari kiri yang jelas menghadap kamera agar angka 1 lebih stabil.",
    readiness: "ready",
    labels: ["LEFT_HAND_1", "NUMBER_ONE"],
  },
  {
    id: "digit-2",
    token: "2",
    title: "Angka 2",
    hand: "Left",
    detection: "Tangan kiri dengan 2 jari terangkat.",
    systemLabel: "LEFT_HAND_2 / NUMBER_TWO",
    source: "Heuristic finger count",
    note: "Arahkan telapak kiri ke kamera supaya sistem mudah menghitung dua jari aktif.",
    readiness: "ready",
    labels: ["LEFT_HAND_2", "NUMBER_TWO"],
  },
  {
    id: "digit-3",
    token: "3",
    title: "Angka 3",
    hand: "Left",
    detection: "Tangan kiri dengan 3 jari terangkat.",
    systemLabel: "LEFT_HAND_3 / NUMBER_THREE",
    source: "Heuristic finger count",
    note: "Deteksi dilakukan dari hitungan jari kiri yang terlihat terangkat.",
    readiness: "ready",
    labels: ["LEFT_HAND_3", "NUMBER_THREE"],
  },
  {
    id: "digit-4",
    token: "4",
    title: "Angka 4",
    hand: "Left",
    detection: "Tangan kiri dengan 4 jari terangkat.",
    systemLabel: "LEFT_HAND_4 / NUMBER_FOUR",
    source: "Heuristic finger count",
    note: "Cocok untuk input angka 4 tanpa perlu model tambahan.",
    readiness: "ready",
    labels: ["LEFT_HAND_4", "NUMBER_FOUR"],
  },
  {
    id: "digit-5",
    token: "5",
    title: "Angka 5",
    hand: "Left",
    detection: "Telapak kiri terbuka penuh dengan 5 jari aktif.",
    systemLabel: "LEFT_HAND_5 / NUMBER_FIVE",
    source: "Heuristic finger count",
    note: "Buka seluruh jari tangan kiri untuk memasukkan angka 5.",
    readiness: "ready",
    labels: ["LEFT_HAND_5", "NUMBER_FIVE"],
  },
  {
    id: "operator-plus",
    token: "+",
    title: "Operator Plus",
    hand: "Right",
    detection: "Tangan kanan dalam pose thumb up.",
    systemLabel: "Thumb_Up / OP_PLUS",
    source: "MediaPipe built-in gesture",
    note: "Saat gesture ini terbaca, token yang dimasukkan adalah operator tambah.",
    readiness: "ready",
    labels: ["Thumb_Up", "OP_PLUS"],
  },
  {
    id: "operator-minus",
    token: "-",
    title: "Operator Minus",
    hand: "Right",
    detection: "Tangan kanan dalam pose thumb down.",
    systemLabel: "Thumb_Down / OP_MINUS",
    source: "MediaPipe built-in gesture",
    note: "Gunakan gesture ini untuk memasukkan operator kurang.",
    readiness: "ready",
    labels: ["Thumb_Down", "OP_MINUS"],
  },
  {
    id: "operator-multiply",
    token: "*",
    title: "Operator Kali",
    hand: "Right",
    detection: "Tangan kanan dalam pose I Love You.",
    systemLabel: "ILoveYou / OP_MULTIPLY",
    source: "MediaPipe built-in gesture",
    note: "Di demo ini, gesture I Love You dipakai sebagai operator perkalian.",
    readiness: "ready",
    labels: ["ILoveYou", "OP_MULTIPLY"],
  },
  {
    id: "operator-divide",
    token: "/",
    title: "Operator Bagi",
    hand: "Right",
    detection: "Tangan kanan dalam pose victory.",
    systemLabel: "Victory / OP_DIVIDE",
    source: "MediaPipe built-in gesture",
    note: "Gesture victory dimapping sebagai operator pembagian di MVP ini.",
    readiness: "ready",
    labels: ["Victory", "OP_DIVIDE"],
  },
  {
    id: "operator-equals",
    token: "=",
    title: "Operator Sama Dengan",
    hand: "Right",
    detection: "Tangan kanan dalam pose open palm.",
    systemLabel: "Open_Palm / OP_EQUALS",
    source: "MediaPipe built-in gesture",
    note: "Gunakan gesture ini untuk submit ekspresi dan menjalankan perhitungan.",
    readiness: "ready",
    labels: ["Open_Palm", "OP_EQUALS"],
  },
  {
    id: "digit-6",
    token: "6",
    title: "Angka 6",
    hand: "Custom",
    detection: "Belum tersedia di demo default.",
    systemLabel: "NUMBER_SIX",
    source: "Custom gesture model",
    note: "Aktif setelah kamu memasang model custom yang mengenali gesture angka 6.",
    readiness: "custom-model",
    labels: ["NUMBER_SIX"],
  },
  {
    id: "digit-7",
    token: "7",
    title: "Angka 7",
    hand: "Custom",
    detection: "Belum tersedia di demo default.",
    systemLabel: "NUMBER_SEVEN",
    source: "Custom gesture model",
    note: "Perlu model custom karena MediaPipe demo bawaan belum menyediakan angka 7.",
    readiness: "custom-model",
    labels: ["NUMBER_SEVEN"],
  },
  {
    id: "digit-8",
    token: "8",
    title: "Angka 8",
    hand: "Custom",
    detection: "Belum tersedia di demo default.",
    systemLabel: "NUMBER_EIGHT",
    source: "Custom gesture model",
    note: "Butuh dataset dan model tambahan agar angka 8 bisa dikenali dengan stabil.",
    readiness: "custom-model",
    labels: ["NUMBER_EIGHT"],
  },
  {
    id: "digit-9",
    token: "9",
    title: "Angka 9",
    hand: "Custom",
    detection: "Belum tersedia di demo default.",
    systemLabel: "NUMBER_NINE",
    source: "Custom gesture model",
    note: "Akan aktif setelah model custom untuk angka 9 dipasang ke aplikasi.",
    readiness: "custom-model",
    labels: ["NUMBER_NINE"],
  },
];

function isFingerRaised(
  landmarks: Landmark[],
  tipIndex: number,
  pipIndex: number,
) {
  return landmarks[tipIndex].y < landmarks[pipIndex].y;
}

function isThumbRaised(landmarks: Landmark[], handedness: Handedness) {
  if (handedness === "Unknown") {
    return false;
  }

  const thumbTipX = landmarks[4].x;
  const thumbIpX = landmarks[3].x;

  return handedness === "Right" ? thumbTipX > thumbIpX : thumbTipX < thumbIpX;
}

function inferFingerCount(
  landmarks: Landmark[] | undefined,
  handedness: Handedness,
) {
  if (!landmarks || landmarks.length < 21) {
    return null;
  }

  let count = 0;

  if (isThumbRaised(landmarks, handedness)) {
    count += 1;
  }

  if (isFingerRaised(landmarks, 8, 6)) {
    count += 1;
  }

  if (isFingerRaised(landmarks, 12, 10)) {
    count += 1;
  }

  if (isFingerRaised(landmarks, 16, 14)) {
    count += 1;
  }

  if (isFingerRaised(landmarks, 20, 18)) {
    count += 1;
  }

  return count;
}

function resolveGestureToken({
  label,
  confidence = 0,
  handedness = "Unknown",
  landmarks,
}: GestureResolutionInput): RecognizedGesture | null {
  if (label && CUSTOM_LABEL_MAP[label]) {
    return {
      label,
      token: CUSTOM_LABEL_MAP[label],
      confidence,
      source: "custom",
      handedness,
    };
  }

  const fingerCount = inferFingerCount(landmarks, handedness);

  if (
    handedness === "Left" &&
    fingerCount !== null &&
    fingerCount >= 0 &&
    fingerCount <= 5
  ) {
    return {
      label: `LEFT_HAND_${fingerCount}`,
      token: String(fingerCount),
      confidence: confidence || 0.82,
      source: "heuristic",
      handedness,
    };
  }

  if (handedness === "Right" && label && RIGHT_HAND_OPERATOR_MAP[label]) {
    return {
      label,
      token: RIGHT_HAND_OPERATOR_MAP[label],
      confidence,
      source: "builtin",
      handedness,
    };
  }

  return null;
}

export function mapGestureResult(
  result: GestureRecognizerResult,
): RecognizedGesture | null {
  const primaryGesture = result.gestures?.[0]?.[0];
  const primaryLandmarks = result.landmarks?.[0];
  const primaryHandedness =
    (result.handednesses?.[0]?.[0]?.categoryName as Handedness | undefined) ??
    "Unknown";

  return resolveGestureToken({
    label: primaryGesture?.categoryName,
    confidence: primaryGesture?.score,
    landmarks: primaryLandmarks,
    handedness: primaryHandedness,
  });
}
