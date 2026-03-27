import { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from '@vladmandic/face-api';

export type Expression =
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'angry'
  | 'fearful'
  | 'disgusted'
  | 'surprised';

export interface FaceState {
  detected: boolean;
  expressions: Partial<Record<Expression, number>>;
  dominantExpression: Expression | null;
  eyesOpen: boolean;
  smiling: boolean;
  capturedImage: string | null;
}

const MODEL_URL = '/models';

export function useFaceDetection(
  videoRef: React.RefObject<HTMLVideoElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  active: boolean
) {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceState, setFaceState] = useState<FaceState>({
    detected: false,
    expressions: {},
    dominantExpression: null,
    eyesOpen: false,
    smiling: false,
    capturedImage: null,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load models once
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        ]);
        if (!cancelled) setModelsLoaded(true);
      } catch (e) {
        console.error('Face API models failed to load:', e);
        // Still mark as loaded so UI doesn't hang on loading state
        if (!cancelled) setModelsLoaded(true);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Detect loop
  useEffect(() => {
    if (!modelsLoaded || !active) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    intervalRef.current = setInterval(async () => {
      if (video.readyState < 2) return;

      try {
        const detection = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.4 }))
          .withFaceLandmarks(true)   // true = use tiny landmark net
          .withFaceExpressions();

        if (!detection) {
          setFaceState(prev => ({ ...prev, detected: false }));
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
          return;
        }

        // Resize canvas to video dims
        const dims = faceapi.matchDimensions(canvas, video, true);
        const resized = faceapi.resizeResults(detection, dims);

        // Draw overlay
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          faceapi.draw.drawDetections(canvas, [resized]);
          faceapi.draw.drawFaceLandmarks(canvas, [resized]);
        }

        // Parse expressions
        const expMap = detection.expressions as unknown as Record<Expression, number>;
        const entries = Object.entries(expMap) as [Expression, number][];
        const dominant = entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];

        // Eye-openness heuristic via landmarks
        let eyesOpen = true;
        try {
          const lm = detection.landmarks.positions;
          const leftEAR  = eyeAspectRatio(lm, 36);
          const rightEAR = eyeAspectRatio(lm, 42);
          eyesOpen = (leftEAR + rightEAR) / 2 > 0.18;
        } catch {}

        setFaceState({
          detected: true,
          expressions: expMap,
          dominantExpression: dominant,
          eyesOpen,
          smiling: (expMap.happy ?? 0) > 0.45,
          capturedImage: null,
        });
      } catch (e) {
        // Detection can fail on individual frames — ignore
      }
    }, 200);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [modelsLoaded, active, videoRef, canvasRef]);

  const capture = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video) return null;
    const snap = document.createElement('canvas');
    snap.width  = video.videoWidth;
    snap.height = video.videoHeight;
    snap.getContext('2d')?.drawImage(video, 0, 0);
    const dataUrl = snap.toDataURL('image/jpeg', 0.85);
    setFaceState(prev => ({ ...prev, capturedImage: dataUrl }));
    return dataUrl;
  }, [videoRef]);

  return { modelsLoaded, faceState, capture };
}

// Eye Aspect Ratio — smaller = more closed
// Landmark indices for left eye: 36–41, right eye: 42–47
function eyeAspectRatio(pts: faceapi.Point[], start: number): number {
  try {
    const p1 = pts[start + 1], p5 = pts[start + 5];
    const p2 = pts[start + 2], p4 = pts[start + 4];
    const p0 = pts[start],     p3 = pts[start + 3];
    if (!p1 || !p2 || !p4 || !p5 || !p0 || !p3) return 0.25;
    const A = Math.hypot(p1.x - p5.x, p1.y - p5.y);
    const B = Math.hypot(p2.x - p4.x, p2.y - p4.y);
    const C = Math.hypot(p0.x - p3.x, p0.y - p3.y);
    return (A + B) / (2.0 * C);
  } catch {
    return 0.25;
  }
}
