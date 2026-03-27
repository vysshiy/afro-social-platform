import { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from '@vladmandic/face-api';

// ─── Types ─────────────────────────────────────────────────────
export type Expression =
  | 'neutral' | 'happy' | 'sad'
  | 'angry'   | 'fearful' | 'disgusted' | 'surprised';

export interface FaceState {
  detected:          boolean;
  expressions:       Partial<Record<Expression, number>>;
  dominantExpression: Expression | null;
  eyesOpen:          boolean;
  smiling:           boolean;
  capturedImage:     string | null;
}

// ─── Constants ─────────────────────────────────────────────────
const MODEL_URL     = '/models';
const DETECT_INTERVAL_MS = 200;

// ─── Hook ──────────────────────────────────────────────────────
export function useFaceDetection(
  videoRef:  React.RefObject<HTMLVideoElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  active:    boolean,
) {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceState,    setFaceState]    = useState<FaceState>({
    detected:          false,
    expressions:       {},
    dominantExpression: null,
    eyesOpen:          false,
    smiling:           false,
    capturedImage:     null,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef  = useRef(true);

  // Track mounted state to avoid setState after unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // ── Load models once on mount ──────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        ]);
        if (mountedRef.current) setModelsLoaded(true);
      } catch (err) {
        console.error('[FaceAPI] Model load error:', err);
        // Mark loaded anyway so the UI doesn't stay in loading state
        if (mountedRef.current) setModelsLoaded(true);
      }
    }
    load();
  }, []);

  // ── Detection loop ─────────────────────────────────────────
  useEffect(() => {
    if (!modelsLoaded || !active) return;

    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    intervalRef.current = setInterval(async () => {
      if (!mountedRef.current) return;
      if (video.readyState < 2 || video.videoWidth === 0) return;

      try {
        const detection = await faceapi
          .detectSingleFace(
            video,
            new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.4 }),
          )
          .withFaceLandmarks(true)
          .withFaceExpressions();

        if (!mountedRef.current) return;

        if (!detection) {
          setFaceState(prev => ({ ...prev, detected: false }));
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
          return;
        }

        // Match canvas size to video, resize detection results
        const dims   = faceapi.matchDimensions(canvas, video, true);
        const resized = faceapi.resizeResults(detection, dims);

        // Draw face box + landmarks
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          faceapi.draw.drawDetections(canvas,    [resized]);
          faceapi.draw.drawFaceLandmarks(canvas, [resized]);
        }

        // ── Parse expression scores ──────────────────────────
        // FaceExpressions is a class with named number properties.
        // We cast to a plain record for easy iteration.
        const raw  = detection.expressions;
        const expMap: Partial<Record<Expression, number>> = {
          neutral:   raw.neutral   ?? 0,
          happy:     raw.happy     ?? 0,
          sad:       raw.sad       ?? 0,
          angry:     raw.angry     ?? 0,
          fearful:   raw.fearful   ?? 0,
          disgusted: raw.disgusted ?? 0,
          surprised: raw.surprised ?? 0,
        };

        const entries  = Object.entries(expMap) as [Expression, number][];
        const dominant = entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];

        // ── Eye-openness via landmark EAR heuristic ──────────
        let eyesOpen = true;
        try {
          const lm       = detection.landmarks.positions;
          const leftEAR  = eyeAspectRatio(lm, 36);
          const rightEAR = eyeAspectRatio(lm, 42);
          eyesOpen = (leftEAR + rightEAR) / 2 > 0.18;
        } catch { /* ignore — fallback to true */ }

        if (mountedRef.current) {
          setFaceState({
            detected:          true,
            expressions:       expMap,
            dominantExpression: dominant,
            eyesOpen,
            smiling:           (expMap.happy ?? 0) > 0.45,
            capturedImage:     null,
          });
        }
      } catch {
        // Individual frame failures are normal — ignore silently
      }
    }, DETECT_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [modelsLoaded, active, videoRef, canvasRef]);

  // ── Capture snapshot ──────────────────────────────────────
  const capture = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !video.videoWidth) return null;

    const snap = document.createElement('canvas');
    snap.width  = video.videoWidth;
    snap.height = video.videoHeight;

    const ctx = snap.getContext('2d');
    if (!ctx) {
      console.warn('[FaceAPI] Could not get 2d context for snapshot');
      return null;
    }

    // Draw the current video frame (un-mirrored for storage)
    ctx.drawImage(video, 0, 0, snap.width, snap.height);

    const dataUrl = snap.toDataURL('image/jpeg', 0.85);
    if (mountedRef.current) {
      setFaceState(prev => ({ ...prev, capturedImage: dataUrl }));
    }
    return dataUrl;
  }, [videoRef]);

  return { modelsLoaded, faceState, capture };
}

// ─── Eye Aspect Ratio ────────────────────────────────────────
// Points for left eye:  indices 36–41
// Points for right eye: indices 42–47
// EAR < 0.18 ≈ eyes closed
function eyeAspectRatio(pts: faceapi.Point[], start: number): number {
  try {
    const p0 = pts[start],     p1 = pts[start + 1];
    const p2 = pts[start + 2], p3 = pts[start + 3];
    const p4 = pts[start + 4], p5 = pts[start + 5];
    if (!p0 || !p1 || !p2 || !p3 || !p4 || !p5) return 0.25;
    const A = Math.hypot(p1.x - p5.x, p1.y - p5.y);
    const B = Math.hypot(p2.x - p4.x, p2.y - p4.y);
    const C = Math.hypot(p0.x - p3.x, p0.y - p3.y);
    return C > 0 ? (A + B) / (2.0 * C) : 0.25;
  } catch {
    return 0.25;
  }
}
