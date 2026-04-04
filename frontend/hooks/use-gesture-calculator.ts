"use client";

import {
  FilesetResolver,
  GestureRecognizer,
  type GestureRecognizerResult,
} from "@mediapipe/tasks-vision";
import { useCallback, useEffect, useRef, useState } from "react";
import { createHistory, fetchHistory } from "@/lib/api";
import {
  appendToken,
  canEvaluate,
  evaluateExpression,
  isDigitToken,
  isOperator,
  removeLastToken,
  serializeExpression,
} from "@/lib/calculator";
import { mapGestureResult } from "@/lib/gesture-mapper";
import type {
  CreateHistoryPayload,
  HistoryEntry,
  RecognizedGesture,
  StorageMode,
} from "@/lib/types";

const STABLE_FOR_MS = 850;
const MIN_HITS = 6;
const HISTORY_BOOT_RETRY_DELAY_MS = 1500;
const HISTORY_BOOT_MAX_ATTEMPTS = 6;

type CandidateGesture = {
  gesture: RecognizedGesture;
  firstSeenAt: number;
  hits: number;
};

const DEFAULT_STATUS =
  "Model akan memproses kamera secara real-time. Tahan gesture stabil sekitar 0.8 detik.";

export function useGestureCalculator() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const recognizerRef = useRef<GestureRecognizer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const lastInferenceTimestampRef = useRef(0);
  const candidateGestureRef = useRef<CandidateGesture | null>(null);
  const acceptedTokenLockRef = useRef<string | null>(null);
  const recognitionErrorRef = useRef<string | null>(null);
  const expressionTokensRef = useRef<string[]>([]);
  const resultRef = useRef<string | null>(null);

  const [expressionTokens, setExpressionTokens] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [activeGesture, setActiveGesture] = useState<RecognizedGesture | null>(
    null,
  );
  const [isRecognizerReady, setIsRecognizerReady] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isSavingHistory, setIsSavingHistory] = useState(false);
  const [statusMessage, setStatusMessage] = useState(DEFAULT_STATUS);
  const [error, setError] = useState<string | null>(null);
  const [storageMode, setStorageMode] = useState<StorageMode>("offline");
  const [lastCommittedToken, setLastCommittedToken] = useState<string | null>(
    null,
  );

  useEffect(() => {
    expressionTokensRef.current = expressionTokens;
  }, [expressionTokens]);

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  const persistHistory = useCallback(async (payload: CreateHistoryPayload) => {
    setIsSavingHistory(true);

    try {
      const created = await createHistory(payload);
      setHistory((currentHistory) => [created, ...currentHistory].slice(0, 8));
      setStorageMode((currentMode) =>
        currentMode === "offline" ? "memory" : currentMode,
      );
    } catch {
      setStorageMode("offline");
    } finally {
      setIsSavingHistory(false);
    }
  }, []);

  const acceptToken = useCallback(
    async (token: string, gesture?: RecognizedGesture) => {
      setError(null);
      setLastCommittedToken(token);

      if (token === "=") {
        const currentTokens = expressionTokensRef.current;

        if (!canEvaluate(currentTokens)) {
          setError("Ekspresi belum lengkap, jadi hasil belum bisa dihitung.");
          return;
        }

        try {
          const computedResult = evaluateExpression(currentTokens);
          setResult(computedResult);

          const payload: CreateHistoryPayload = {
            expression: serializeExpression(currentTokens),
            result: computedResult,
            tokens: currentTokens,
            sourceLabel: gesture?.label,
            sourceType: gesture?.source,
          };

          void persistHistory(payload);
        } catch (calculationError) {
          const message =
            calculationError instanceof Error
              ? calculationError.message
              : "Gagal menghitung ekspresi.";
          setError(message);
        }

        return;
      }

      const currentResult = resultRef.current;
      const currentTokens = expressionTokensRef.current;

      const nextTokens =
        currentResult !== null
          ? isOperator(token)
            ? appendToken([currentResult], token)
            : appendToken([], token)
          : appendToken(currentTokens, token);

      if (currentResult !== null) {
        setResult(null);
      }

      expressionTokensRef.current = nextTokens;
      setExpressionTokens(nextTokens);
    },
    [persistHistory],
  );

  const handleRecognition = useCallback(
    (recognitionResult: GestureRecognizerResult) => {
      const mappedGesture = mapGestureResult(recognitionResult);

      if (!mappedGesture) {
        setActiveGesture(null);
        candidateGestureRef.current = null;
        acceptedTokenLockRef.current = null;
        return;
      }

      setActiveGesture(mappedGesture);

      if (acceptedTokenLockRef.current === mappedGesture.token) {
        return;
      }

      const now = performance.now();
      const currentCandidate = candidateGestureRef.current;

      if (
        !currentCandidate ||
        currentCandidate.gesture.token !== mappedGesture.token
      ) {
        candidateGestureRef.current = {
          gesture: mappedGesture,
          firstSeenAt: now,
          hits: 1,
        };
        return;
      }

      currentCandidate.gesture = mappedGesture;
      currentCandidate.hits += 1;

      if (
        now - currentCandidate.firstSeenAt >= STABLE_FOR_MS &&
        currentCandidate.hits >= MIN_HITS
      ) {
        acceptedTokenLockRef.current = mappedGesture.token;
        candidateGestureRef.current = null;
        void acceptToken(mappedGesture.token, mappedGesture);
      }
    },
    [acceptToken],
  );

  const processFrame = useCallback(() => {
    const videoElement = videoRef.current;
    const recognizer = recognizerRef.current;
    const stream = streamRef.current;

    if (!videoElement || !recognizer || !stream) {
      return;
    }

    const hasLiveVideoTrack = stream
      .getVideoTracks()
      .some((track) => track.readyState === "live" && track.enabled);
    const hasRenderableFrame =
      videoElement.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA &&
      videoElement.videoWidth > 0 &&
      videoElement.videoHeight > 0 &&
      !videoElement.paused &&
      !videoElement.ended;

    if (hasLiveVideoTrack && hasRenderableFrame) {
      if (videoElement.currentTime !== lastVideoTimeRef.current) {
        try {
          const timestampInMs = Math.max(
            performance.now(),
            lastInferenceTimestampRef.current + 1,
          );
          const recognitionResult = recognizer.recognizeForVideo(
            videoElement,
            timestampInMs,
          );

          handleRecognition(recognitionResult);
          lastVideoTimeRef.current = videoElement.currentTime;
          lastInferenceTimestampRef.current = timestampInMs;
          recognitionErrorRef.current = null;
          setError((currentError) =>
            currentError?.startsWith("Gesture recognizer gagal membaca frame:")
              ? null
              : currentError,
          );
        } catch (recognitionError) {
          const message =
            recognitionError instanceof Error
              ? recognitionError.message
              : "unknown MediaPipe error";

          if (recognitionErrorRef.current !== message) {
            recognitionErrorRef.current = message;
            setError(`Gesture recognizer gagal membaca frame: ${message}`);
          }
        }
      }
    }

    animationFrameRef.current = window.requestAnimationFrame(processFrame);
  }, [handleRecognition]);

  const stopCamera = useCallback(() => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    candidateGestureRef.current = null;
    acceptedTokenLockRef.current = null;
    recognitionErrorRef.current = null;
    lastVideoTimeRef.current = -1;
    lastInferenceTimestampRef.current = 0;
    setActiveGesture(null);
    setIsCameraActive(false);
    setStatusMessage(
      "Kamera berhenti. Aktifkan lagi untuk lanjut membaca gesture.",
    );
  }, []);

  const startCamera = useCallback(async () => {
    if (!recognizerRef.current) {
      setError("Model gesture belum siap. Tunggu loading selesai.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      const videoElement = videoRef.current;

      if (!videoElement) {
        setError("Elemen video belum siap.");
        return;
      }

      videoElement.srcObject = stream;
      await videoElement.play();
      await new Promise<void>((resolve) => {
        if (
          videoElement.readyState >= HTMLMediaElement.HAVE_METADATA &&
          videoElement.videoWidth > 0 &&
          videoElement.videoHeight > 0
        ) {
          resolve();
          return;
        }

        const handleLoadedMetadata = () => {
          videoElement.removeEventListener(
            "loadedmetadata",
            handleLoadedMetadata,
          );
          resolve();
        };

        videoElement.addEventListener("loadedmetadata", handleLoadedMetadata, {
          once: true,
        });
      });

      setIsCameraActive(true);
      setError(null);
      recognitionErrorRef.current = null;
      lastVideoTimeRef.current = -1;
      lastInferenceTimestampRef.current = 0;
      setStatusMessage(
        "Kamera aktif. Tahan gesture stabil sampai token otomatis masuk ke expression builder.",
      );
      animationFrameRef.current = window.requestAnimationFrame(processFrame);
    } catch (cameraError) {
      const message =
        cameraError instanceof Error
          ? cameraError.message
          : "Akses kamera ditolak.";
      setError(`Gagal membuka kamera: ${message}`);
    }
  }, [processFrame]);

  const clearExpression = useCallback(() => {
    expressionTokensRef.current = [];
    setExpressionTokens([]);
    setResult(null);
    setError(null);
    setLastCommittedToken(null);
  }, []);

  const backspaceExpression = useCallback(() => {
    const nextTokens = removeLastToken(expressionTokensRef.current);
    expressionTokensRef.current = nextTokens;
    setExpressionTokens(nextTokens);
    setResult(null);
    setError(null);
  }, []);

  const pushManualToken = useCallback(
    (token: string) => {
      if (token !== "=" && !isDigitToken(token) && !isOperator(token)) {
        return;
      }

      void acceptToken(token);
    },
    [acceptToken],
  );

  useEffect(() => {
    let isMounted = true;

    async function setupRecognizer() {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          process.env.NEXT_PUBLIC_MEDIAPIPE_WASM_URL ??
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
        );

        const recognizer = await GestureRecognizer.createFromOptions(
          filesetResolver,
          {
            baseOptions: {
              modelAssetPath:
                process.env.NEXT_PUBLIC_GESTURE_MODEL_URL ??
                "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
            },
            runningMode: "VIDEO",
            numHands: 1,
            minHandDetectionConfidence: 0.6,
            minHandPresenceConfidence: 0.6,
            minTrackingConfidence: 0.5,
          },
        );

        if (!isMounted) {
          recognizer.close();
          return;
        }

        recognizerRef.current = recognizer;
        setIsRecognizerReady(true);
        setStatusMessage(
          "Gesture model siap. Aktifkan kamera lalu tahan gesture stabil untuk memasukkan token.",
        );
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Gagal memuat MediaPipe.";
        setError(`Model gagal dimuat: ${message}`);
      }
    }

    async function loadHistoryWithRetry() {
      for (
        let attempt = 0;
        attempt < HISTORY_BOOT_MAX_ATTEMPTS;
        attempt += 1
      ) {
        try {
          const response = await fetchHistory();

          if (!isMounted) {
            return;
          }

          setHistory(response.items);
          setStorageMode(response.storageMode);
          return;
        } catch {
          if (!isMounted) {
            return;
          }

          setStorageMode("offline");

          if (attempt === HISTORY_BOOT_MAX_ATTEMPTS - 1) {
            return;
          }

          await new Promise<void>((resolve) => {
            window.setTimeout(resolve, HISTORY_BOOT_RETRY_DELAY_MS);
          });
        }
      }
    }

    void setupRecognizer();
    void loadHistoryWithRetry();

    return () => {
      isMounted = false;
      stopCamera();
      recognizerRef.current?.close();
      recognizerRef.current = null;
    };
  }, [stopCamera]);

  return {
    videoRef,
    expression: serializeExpression(expressionTokens),
    result,
    history,
    activeGesture,
    isRecognizerReady,
    isCameraActive,
    isSavingHistory,
    statusMessage,
    error,
    storageMode,
    lastCommittedToken,
    startCamera,
    stopCamera,
    clearExpression,
    backspaceExpression,
    pushManualToken,
  };
}
