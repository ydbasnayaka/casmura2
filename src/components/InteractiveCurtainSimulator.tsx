import {
  ArrowLeftToLine,
  ArrowRightFromLine,
  GripVertical,
  Pause,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Sun,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import fabricWeaveImg from '../assets/images/curtain_fabric_linen_weave_1795081989218.jpg';
import suiteDayImg from '../assets/images/suite_panoramic_open_daylight_1795075811593.jpg';
import suiteNightImg from '../assets/images/suite_shaded_warm_lamp_1795081989663.jpg';
import {
  createCurtainSceneEngine,
  type ShadingMode,
} from './curtainSceneEngine.ts';

interface InteractiveCurtainSimulatorProps {
  onInquireSystem: (summary: string) => void;
}

const TRACK_CENTER = 0.591;
const LEFT_OPEN_EDGE = 0.285;
const RIGHT_OPEN_EDGE = 0.898;

const PRESETS = [
  { label: 'Full Shade', openness: 0 },
  { label: '35% Filtered', openness: 35 },
  { label: '75% Filtered', openness: 75 },
  { label: 'Full Opened', openness: 100 },
];

const DAYLIGHT_MOODS = [
  { label: 'Dawn', value: 50, colorHex: '#F3E7D8' },
  { label: 'Morning', value: 82, colorHex: '#FFF8EE' },
  { label: 'Midday', value: 100, colorHex: '#FFFFFF' },
  { label: 'Dusk', value: 68, colorHex: '#E6D5BC' },
];

export function InteractiveCurtainSimulator({
  onInquireSystem,
}: InteractiveCurtainSimulatorProps) {
  const [openness, setOpenness] = useState<number>(35);
  const [daylightIntensity, setDaylightIntensity] = useState<number>(82);
  const [sunColorHex, setSunColorHex] = useState<string>(DAYLIGHT_MOODS[1].colorHex);
  const [shadingMode, setShadingMode] = useState<ShadingMode>('dual');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [demoPlaying, setDemoPlaying] = useState<boolean>(false);
  const [webglFailed, setWebglFailed] = useState<boolean>(false);

  const initialLeftHandleX = TRACK_CENTER - 0.35 * (TRACK_CENTER - LEFT_OPEN_EDGE);
  const initialRightHandleX = TRACK_CENTER + 0.35 * (RIGHT_OPEN_EDGE - TRACK_CENTER);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const leftHandleRef = useRef<HTMLButtonElement | null>(null);
  const rightHandleRef = useRef<HTMLButtonElement | null>(null);
  const engineRef = useRef<ReturnType<typeof createCurtainSceneEngine> | null>(null);
  const activeSideRef = useRef<'left' | 'right'>('left');
  const opennessRef = useRef<number>(35);
  opennessRef.current = openness;

  const [reducedMotion, setReducedMotion] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Mount Three.js WebGL2 photorealistic simulation once
  useEffect(() => {
    const mountEl = canvasMountRef.current;
    if (!mountEl) return;

    try {
      const engine = createCurtainSceneEngine({
        container: mountEl,
        dayTextureUrl: suiteDayImg,
        nightTextureUrl: suiteNightImg,
        fabricTextureUrl: fabricWeaveImg,
        foregroundMaskUrl: '/assets/simulator-foreground-mask.png',
        initialState: {
          targetOpenness: 0.35,
          daylightIntensity: 0.82,
          sunColorHex: DAYLIGHT_MOODS[1].colorHex,
          mode: 'dual',
          reducedMotion,
        },
        onTelemetry: ({ leftHandleNormalizedX, rightHandleNormalizedX }) => {
          if (leftHandleRef.current) {
            leftHandleRef.current.style.left = `${leftHandleNormalizedX * 100}%`;
          }
          if (rightHandleRef.current) {
            rightHandleRef.current.style.left = `${rightHandleNormalizedX * 100}%`;
          }
        },
      });
      engineRef.current = engine;
      return () => {
        engine.dispose();
        engineRef.current = null;
      };
    } catch {
      setWebglFailed(true);
      return undefined;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push reactive state updates to WebGL engine without tearing down canvas
  useEffect(() => {
    engineRef.current?.setState({
      targetOpenness: openness / 100,
      daylightIntensity: daylightIntensity / 100,
      sunColorHex,
      mode: shadingMode,
      reducedMotion,
    });
  }, [openness, daylightIntensity, sunColorHex, shadingMode, reducedMotion]);

  // Smooth continuous motorized demonstration cycle (Open -> dwell -> Close -> dwell)
  useEffect(() => {
    if (!demoPlaying) return undefined;

    let rafId = 0;
    let phase: 'opening' | 'hold_open' | 'closing' | 'hold_closed' =
      opennessRef.current >= 85 ? 'closing' : 'opening';
    let current = opennessRef.current;
    let lastTs = performance.now();
    let lastUiSync = 0;
    let holdElapsed = 0;

    const travelSpeed = reducedMotion ? 120 : 38; // % per second

    const stepDemo = (now: number) => {
      const dt = Math.min(0.1, Math.max(0.001, (now - lastTs) / 1000));
      lastTs = now;

      if (phase === 'opening') {
        current = Math.min(100, current + travelSpeed * dt);
        if (current >= 100) {
          current = 100;
          phase = 'hold_open';
          holdElapsed = 0;
        }
      } else if (phase === 'hold_open') {
        holdElapsed += dt;
        if (holdElapsed >= 1.1) {
          phase = 'closing';
        }
      } else if (phase === 'closing') {
        current = Math.max(0, current - travelSpeed * dt);
        if (current <= 0) {
          current = 0;
          phase = 'hold_closed';
          holdElapsed = 0;
        }
      } else {
        holdElapsed += dt;
        if (holdElapsed >= 1.1) {
          phase = 'opening';
        }
      }

      if (now - lastUiSync >= 40 || current === 0 || current === 100) {
        lastUiSync = now;
        const rounded = Math.round(current);
        setOpenness((prev) => (prev === rounded ? prev : rounded));
      }

      rafId = requestAnimationFrame(stepDemo);
    };

    rafId = requestAnimationFrame(stepDemo);
    return () => cancelAnimationFrame(rafId);
  }, [demoPlaying, reducedMotion]);

  const stopDemo = useCallback(() => {
    setDemoPlaying(false);
  }, []);

  const computeOpennessFromPointer = (clientX: number, side: 'left' | 'right') => {
    const el = stageRef.current;
    if (!el) return openness;
    const rect = el.getBoundingClientRect();
    const relX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));

    const frac =
      side === 'left'
        ? (TRACK_CENTER - relX) / (TRACK_CENTER - LEFT_OPEN_EDGE)
        : (relX - TRACK_CENTER) / (RIGHT_OPEN_EDGE - TRACK_CENTER);

    return Math.round(Math.max(0, Math.min(100, frac * 100)));
  };

  const handleStagePointerDown = (
    e: PointerEvent<HTMLElement>,
    explicitSide?: 'left' | 'right'
  ) => {
    const el = stageRef.current;
    if (!el) return;
    e.preventDefault();
    stopDemo();

    let side = explicitSide;
    if (!side) {
      const rect = el.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width;
      side = relX <= TRACK_CENTER ? 'left' : 'right';
    }
    activeSideRef.current = side;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);

    const next = computeOpennessFromPointer(e.clientX, side);
    setOpenness(next);
    engineRef.current?.snapOpenness(next / 100);
  };

  const handleStagePointerMove = (e: PointerEvent<HTMLElement>) => {
    if (!isDragging) return;
    const next = computeOpennessFromPointer(e.clientX, activeSideRef.current);
    setOpenness(next);
    engineRef.current?.snapOpenness(next / 100);
  };

  const handleStagePointerUp = (e: PointerEvent<HTMLElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      stopDemo();
      setOpenness((prev) => Math.min(100, prev + 5));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      stopDemo();
      setOpenness((prev) => Math.max(0, prev - 5));
    } else if (e.key === 'Home') {
      e.preventDefault();
      stopDemo();
      setOpenness(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      stopDemo();
      setOpenness(100);
    }
  };

  const handleOpen = () => {
    stopDemo();
    setOpenness(100);
  };

  const handleClose = () => {
    stopDemo();
    setOpenness(0);
  };

  const handleReset = () => {
    stopDemo();
    setOpenness(35);
    setDaylightIntensity(82);
    setSunColorHex(DAYLIGHT_MOODS[1].colorHex);
    setShadingMode('dual');
  };

  const getStageLabel = () => {
    if (openness <= 8) return 'FULL SHADE · PRIVACY MODE';
    if (openness <= 55) return `${openness}% OPEN · FILTERED DAYLIGHT`;
    if (openness < 92) return `${openness}% OPEN · NATURAL DAYLIGHT`;
    return 'FULL OPENED · OCEANFRONT VIEW';
  };

  const modeSummary =
    shadingMode === 'dual'
      ? 'Dual Sheer + Acoustic Blackout Drapery'
      : shadingMode === 'sheer'
      ? 'Architectural Belgian Linen Sheer'
      : 'Motorized Vertical Shading Louvers';

  return (
    <div className="space-y-4">
      {/* System Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="glass-tabs-dark inline-flex flex-wrap items-center gap-1 p-1 rounded-lg"
          role="tablist"
          aria-label="Window Shading System"
        >
          {[
            { id: 'dual', label: 'Dual Sheer + Blackout' },
            { id: 'sheer', label: 'Linen Sheer' },
            { id: 'louver', label: 'Vertical Louvers' },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={shadingMode === m.id}
              onClick={() => setShadingMode(m.id as ShadingMode)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                shadingMode === m.id
                  ? 'bg-white text-[#00214A] shadow-sm'
                  : 'text-slate-200 hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDemoPlaying((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
              demoPlaying
                ? 'bg-[#00214A] text-white border border-[#C5A15B]'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
            }`}
            aria-label={demoPlaying ? 'Pause motorized demonstration' : 'Play motorized demonstration'}
          >
            {demoPlaying ? (
              <>
                <Pause className="w-3 h-3 fill-[#C5A15B] text-[#C5A15B]" />
                <span>Pause Demo</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-[#C5A15B] text-[#C5A15B]" />
                <span>Play Motor Demo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Photorealistic WebGL Luxury Suite Viewport */}
      <div
        ref={stageRef}
        className={`relative aspect-[1376/768] rounded-xl overflow-hidden border border-[#C5A15B]/35 bg-neutral-950 shadow-2xl select-none touch-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-ew-resize'
        }`}
        onPointerDown={(e) => handleStagePointerDown(e)}
        onPointerMove={handleStagePointerMove}
        onPointerUp={handleStagePointerUp}
        onPointerCancel={handleStagePointerUp}
      >
        {/* Dedicated Isolated Three.js WebGL Mount */}
        <div ref={canvasMountRef} className="absolute inset-0 w-full h-full" />

        {/* Graceful Fallback Image if WebGL fails */}
        {webglFailed && (
          <img
            src={openness < 25 ? suiteNightImg : suiteDayImg}
            alt="Luxury oceanfront hospitality suite with automated drapery"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
        )}

        {/* Precision Interactive Drag Handles Tracked to Left & Right Curtain Edges (No backdrop-blur over WebGL) */}
        {!webglFailed && (
          <>
            <button
              ref={leftHandleRef}
              type="button"
              role="slider"
              aria-label="Drag left curtain horizontally"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={openness}
              onKeyDown={handleKeyDown}
              onPointerDown={(e) => {
                e.stopPropagation();
                handleStagePointerDown(e, 'left');
              }}
              style={{ left: `${initialLeftHandleX * 100}%`, top: '42%' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 w-7 h-10 sm:w-8 sm:h-12 rounded-full bg-black/78 border border-[#C5A15B] text-white flex items-center justify-center shadow-lg hover:scale-110 focus-visible:outline-2 focus-visible:outline-[#C5A15B] transition-transform cursor-ew-resize"
            >
              <GripVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C5A15B]" />
            </button>

            <button
              ref={rightHandleRef}
              type="button"
              role="slider"
              aria-label="Drag right curtain horizontally"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={openness}
              onKeyDown={handleKeyDown}
              onPointerDown={(e) => {
                e.stopPropagation();
                handleStagePointerDown(e, 'right');
              }}
              style={{ left: `${initialRightHandleX * 100}%`, top: '42%' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 w-7 h-10 sm:w-8 sm:h-12 rounded-full bg-black/78 border border-[#C5A15B] text-white flex items-center justify-center shadow-lg hover:scale-110 focus-visible:outline-2 focus-visible:outline-[#C5A15B] transition-transform cursor-ew-resize"
            >
              <GripVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C5A15B]" />
            </button>
          </>
        )}

        {/* Top Instruction Overlay (Solid RGBA — zero backdrop-blur over WebGL) */}
        <div className="absolute top-2 left-2.5 sm:top-3 sm:left-3.5 z-20 pointer-events-none">
          <div className="bg-black/75 border border-white/15 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-[10px] sm:text-[11px] font-medium text-white flex items-center gap-1.5 sm:gap-2">
            <SlidersHorizontal className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C5A15B] shrink-0" />
            <span className="sm:hidden">Drag curtains</span>
            <span className="hidden sm:inline">Drag curtains horizontally or run motorized control</span>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="absolute bottom-2 left-2.5 right-2.5 sm:bottom-3 sm:left-3.5 sm:right-3.5 z-20 flex items-center justify-between gap-2 pointer-events-none">
          <div className="bg-black/75 border border-white/15 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-white tabular-nums">
            {getStageLabel()}
          </div>
          <div className="hidden sm:block bg-black/75 border border-[#C5A15B]/35 px-3 py-1.5 rounded-md text-[11px] font-medium text-[#C5A15B]">
            {modeSummary}
          </div>
        </div>
      </div>

      {/* Controls: Motorized Transport + Opening/Daylight Sliders + Presets + Enquiry CTA */}
      <div className="glass-panel-dark rounded-xl p-4 space-y-4">
        {/* Motorized Curtain Transport Bar: Play, Pause, Open, Close, Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
            Motorized Track Controls
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setDemoPlaying(true)}
              disabled={demoPlaying}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                demoPlaying
                  ? 'bg-white text-[#00214A]'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Play</span>
            </button>

            <button
              type="button"
              onClick={stopDemo}
              disabled={!demoPlaying}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                !demoPlaying
                  ? 'bg-white/5 text-slate-400 cursor-not-allowed'
                  : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
            >
              <Pause className="w-3 h-3" />
              <span>Pause</span>
            </button>

            <button
              type="button"
              onClick={handleOpen}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                openness >= 96 && !demoPlaying
                  ? 'bg-white text-[#00214A]'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <ArrowRightFromLine className="w-3 h-3" />
              <span>Open</span>
            </button>

            <button
              type="button"
              onClick={handleClose}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                openness <= 4 && !demoPlaying
                  ? 'bg-white text-[#00214A]'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <ArrowLeftToLine className="w-3 h-3" />
              <span>Close</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-semibold bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1.5">
              <span className="font-semibold uppercase tracking-wider">Curtain Opening</span>
              <span className="font-mono text-[#C5A15B] tabular-nums">{openness}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={openness}
              onChange={(e) => {
                stopDemo();
                setOpenness(Number(e.target.value));
              }}
              aria-label="Adjust curtain opening percentage"
              className="w-full casmura-slider"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1.5">
              <span className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider">
                <Sun className="w-3.5 h-3.5 text-[#C5A15B]" />
                <span>Daylight Intensity</span>
              </span>
              <span className="font-mono text-[#C5A15B] tabular-nums">
                {daylightIntensity}%
              </span>
            </div>
            <input
              type="range"
              min={25}
              max={100}
              step={5}
              value={daylightIntensity}
              onChange={(e) => setDaylightIntensity(Number(e.target.value))}
              aria-label="Adjust exterior daylight intensity"
              className="w-full casmura-slider"
            />
          </div>
        </div>

        {/* Presets & Daylight Moods */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
          <div className="flex flex-wrap items-center gap-1.5">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  stopDemo();
                  setOpenness(preset.openness);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  Math.abs(openness - preset.openness) <= 5
                    ? 'bg-white text-[#00214A]'
                    : 'bg-white/10 text-slate-200 hover:bg-white/20'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {DAYLIGHT_MOODS.map((mood) => (
              <button
                key={mood.label}
                type="button"
                onClick={() => {
                  setDaylightIntensity(mood.value);
                  setSunColorHex(mood.colorHex);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  sunColorHex === mood.colorHex
                    ? 'bg-[#00214A] text-white border border-[#C5A15B]/80'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {mood.label}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Disclaimer & Direct Enquiry CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/10">
          <p className="text-[11px] text-white/75 leading-snug">
            Interactive demonstration of drapery shading & daylight control. Actual optical
            transmission varies by specified fabric openness and glazing.
          </p>
          <button
            type="button"
            onClick={() =>
              onInquireSystem(`${modeSummary} (Tested at ${openness}% opening)`)
            }
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#F3F1EC] text-[#00214A] text-xs font-extrabold uppercase tracking-wider px-4 py-2 rounded-md transition-colors shrink-0 cursor-pointer"
          >
            <span>Inquire About This System</span>
            <Play className="w-2.5 h-2.5 fill-[#8C6B2D] text-[#8C6B2D]" />
          </button>
        </div>
      </div>
    </div>
  );
}
