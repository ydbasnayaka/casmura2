import { useEffect, useRef, useState } from 'react';
import { SafeImage } from './SafeImage.tsx';

interface SeamlessHeroVideoProps {
  src: string;
  posterSrc: string;
  posterAlt: string;
  reducedMotion: boolean;
  inView: boolean;
}

const CROSSFADE_SECONDS = 1.25;

/**
 * Dual-video crossfading hero background with zero visible restart seams,
 * constant full-opacity compositing (incoming fades 0->1 above holding layer),
 * viewport/visibility pausing, single-video loop fallback, and reduced-motion poster mode.
 */
export function SeamlessHeroVideo({
  src,
  posterSrc,
  posterAlt,
  reducedMotion,
  inView,
}: SeamlessHeroVideoProps) {
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);

  const [activeSlot, setActiveSlot] = useState<0 | 1>(0);
  const [fadingToSlot, setFadingToSlot] = useState<0 | 1 | null>(null);
  const [slotReady, setSlotReady] = useState<[boolean, boolean]>([false, false]);
  const [singleLoopFallback, setSingleLoopFallback] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [tabVisible, setTabVisible] = useState(
    () => typeof document === 'undefined' || !document.hidden
  );

  const activeSlotRef = useRef<0 | 1>(0);
  const fadingRef = useRef(false);
  const swapTimerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    activeSlotRef.current = activeSlot;
  }, [activeSlot]);

  useEffect(() => {
    const onVisChange = () => setTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisChange);
    return () => document.removeEventListener('visibilitychange', onVisChange);
  }, []);

  // Reset engine cleanly whenever responsive src changes
  useEffect(() => {
    if (swapTimerRef.current) {
      window.clearTimeout(swapTimerRef.current);
      swapTimerRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    activeSlotRef.current = 0;
    fadingRef.current = false;
    setActiveSlot(0);
    setFadingToSlot(null);
    setSlotReady([false, false]);
    setVideoFailed(false);
    setSingleLoopFallback(false);
  }, [src]);

  // Ensure muted state & play/pause lifecycle synchronized with visibility & viewport
  useEffect(() => {
    const vA = videoARef.current;
    const vB = videoBRef.current;
    if (vA) vA.muted = true;
    if (vB) vB.muted = true;

    if (reducedMotion || videoFailed) {
      vA?.pause();
      vB?.pause();
      return;
    }

    const shouldPlay = inView && tabVisible;
    const activeEl = activeSlotRef.current === 0 ? vA : vB;
    const standbyEl = activeSlotRef.current === 0 ? vB : vA;

    if (!shouldPlay) {
      vA?.pause();
      vB?.pause();
      return;
    }

    if (!fadingRef.current && standbyEl) {
      standbyEl.pause();
    }

    if (activeEl) {
      let effectDisposed = false;
      activeEl.muted = true;
      const p = activeEl.play();
      if (p && typeof p.catch === 'function') {
        p.catch((err: unknown) => {
          if (effectDisposed) return;
          const errName =
            err && typeof err === 'object' && 'name' in err
              ? String((err as { name?: string }).name)
              : '';
          if (errName === 'AbortError') return;
          // Autoplay blocked or unsupported -> keep high-res poster layer visible
          setVideoFailed(true);
        });
      }
      return () => {
        effectDisposed = true;
      };
    }
  }, [src, inView, tabVisible, reducedMotion, videoFailed, singleLoopFallback]);

  // Monitor playback head cleanly to trigger seamless 1.25s dual-video crossfade
  useEffect(() => {
    if (reducedMotion || videoFailed || singleLoopFallback || !inView || !tabVisible) {
      return;
    }

    let cancelled = false;

    const triggerCrossfade = () => {
      if (cancelled || fadingRef.current) return;
      const fromSlot = activeSlotRef.current;
      const toSlot: 0 | 1 = fromSlot === 0 ? 1 : 0;
      const fromEl = fromSlot === 0 ? videoARef.current : videoBRef.current;
      const toEl = toSlot === 0 ? videoARef.current : videoBRef.current;

      if (!fromEl || !toEl) return;

      fadingRef.current = true;

      try {
        toEl.currentTime = 0;
      } catch {
        // Ignore seek errors on unbuffered streams
      }
      toEl.muted = true;

      const playPromise = toEl.play();
      const finishTransition = () => {
        if (cancelled) return;
        setFadingToSlot(toSlot);

        swapTimerRef.current = window.setTimeout(() => {
          if (cancelled) return;
          activeSlotRef.current = toSlot;
          setActiveSlot(toSlot);
          setFadingToSlot(null);
          fadingRef.current = false;

          fromEl.pause();
          try {
            fromEl.currentTime = 0;
          } catch {
            // Safe ignore
          }
        }, Math.round(CROSSFADE_SECONDS * 1000) + 40);
      };

      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(finishTransition)
          .catch(() => {
            // Dual playback disallowed on device -> fall back cleanly to native single-video loop
            fadingRef.current = false;
            setFadingToSlot(null);
            setSingleLoopFallback(true);
          });
      } else {
        finishTransition();
      }
    };

    const tick = () => {
      if (cancelled) return;
      const activeEl = activeSlotRef.current === 0 ? videoARef.current : videoBRef.current;

      if (
        activeEl &&
        !fadingRef.current &&
        Number.isFinite(activeEl.duration) &&
        activeEl.duration > CROSSFADE_SECONDS + 0.5
      ) {
        const remaining = activeEl.duration - activeEl.currentTime;
        if (remaining <= CROSSFADE_SECONDS) {
          triggerCrossfade();
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (swapTimerRef.current) {
        window.clearTimeout(swapTimerRef.current);
        swapTimerRef.current = null;
      }
    };
  }, [src, reducedMotion, videoFailed, singleLoopFallback, inView, tabVisible]);

  const markSlotReady = (slot: 0 | 1) => {
    setSlotReady((prev) => {
      if (prev[slot]) return prev;
      const next: [boolean, boolean] = [...prev] as [boolean, boolean];
      next[slot] = true;
      return next;
    });
  };

  // Determine exact layer z-index and opacity so visible sum is strictly 1.0 throughout crossfade
  const getLayerClass = (slot: 0 | 1) => {
    const isIncoming = fadingToSlot === slot;
    const isActive = activeSlot === slot;
    const isReady = slotReady[slot];

    if (isIncoming) {
      return 'z-20 opacity-100 transition-opacity duration-[1250ms] ease-in-out';
    }
    if (isActive) {
      return `z-10 transition-opacity duration-500 ${isReady ? 'opacity-100' : 'opacity-0'}`;
    }
    return 'z-0 opacity-0 pointer-events-none';
  };

  return (
    <div className="relative w-full h-full bg-[#00214A]">
      {/* Instant Poster Layer Behind Video for Zero First-Paint Flash & Reduced-Motion Fallback */}
      <SafeImage
        src={posterSrc}
        alt={posterAlt}
        className="w-full h-full object-cover object-center"
      />

      {!reducedMotion && !videoFailed && (
        <>
          <video
            key={`hero-a-${src}`}
            ref={videoARef}
            src={src}
            poster={posterSrc}
            autoPlay
            loop={singleLoopFallback}
            muted
            playsInline
            preload="auto"
            onCanPlay={() => markSlotReady(0)}
            onError={() => setVideoFailed(true)}
            aria-hidden="true"
            className={`absolute inset-0 w-full h-full object-cover object-center ${getLayerClass(
              0
            )}`}
          />

          {!singleLoopFallback && (
            <video
              key={`hero-b-${src}`}
              ref={videoBRef}
              src={src}
              poster={posterSrc}
              muted
              playsInline
              preload="auto"
              onCanPlay={() => markSlotReady(1)}
              onError={() => setSingleLoopFallback(true)}
              aria-hidden="true"
              className={`absolute inset-0 w-full h-full object-cover object-center ${getLayerClass(
                1
              )}`}
            />
          )}
        </>
      )}
    </div>
  );
}
