import * as THREE from 'three';

export type ShadingMode = 'dual' | 'sheer' | 'louver';

export interface CurtainEngineState {
  targetOpenness: number; // 0..1
  daylightIntensity: number; // 0.25..1
  sunColorHex: string;
  mode: ShadingMode;
  reducedMotion: boolean;
}

export interface CurtainTelemetry {
  currentOpenness: number; // 0..1
  leftHandleNormalizedX: number; // 0..1
  rightHandleNormalizedX: number; // 0..1
}

interface CurtainEngineOptions {
  container: HTMLElement;
  dayTextureUrl: string;
  nightTextureUrl: string;
  fabricTextureUrl: string;
  foregroundMaskUrl: string;
  initialState: CurtainEngineState;
  onTelemetry?: (telemetry: CurtainTelemetry) => void;
}

// Architectural coordinates aligned to suite_panoramic_open_daylight (1376x768)
const TRACK_LEFT_WALL = 0.181;
const TRACK_RIGHT_WALL = 0.998;
const TRACK_CENTER = 0.591;
const LEFT_OPEN_EDGE = 0.285;
const RIGHT_OPEN_EDGE = 0.898;
const CURTAIN_TOP_V = 0.828; // Recessed cleanly behind ceiling soffit (y_top = 0.172)
const CURTAIN_BOTTOM_V = 0.338; // Meets floor threshold cleanly behind foreground sill mask

const _colorScratch = new THREE.Color();

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

const ROOM_VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ROOM_FRAGMENT_SHADER = `
  precision highp float;
  varying vec2 vUv;

  uniform sampler2D uDayTex;
  uniform sampler2D uNightTex;
  uniform sampler2D uMaskTex;

  uniform float uOpenness;
  uniform float uDaylight;
  uniform float uMode; // 0.0 = dual blackout, 1.0 = linen sheer, 2.0 = louvers
  uniform float uLeftEdge;
  uniform float uRightEdge;
  uniform vec3 uSunColor;
  uniform float uIsForeground; // 0.0 = background plate, 1.0 = foreground room & furniture

  void main() {
    float fgMask = texture2D(uMaskTex, vUv).r;

    if (uIsForeground > 0.5 && fgMask < 0.02) {
      discard;
    }
    // Background plate pixels completely covered by opaque foreground room/furniture need no shading
    if (uIsForeground < 0.5 && fgMask > 0.99) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }

    vec3 dayCol = texture2D(uDayTex, vUv).rgb;
    vec3 nightCol = texture2D(uNightTex, vUv).rgb;

    // Light entering room depends on mode and physical opening
    float sheerTransmit = uMode > 0.5 && uMode < 1.5 ? 0.52 : (uMode >= 1.5 ? 0.28 : 0.04);
    float effectiveOpen = mix(sheerTransmit, 1.0, pow(uOpenness, 0.85));
    float roomDayFactor = clamp(effectiveOpen * uDaylight, 0.0, 1.0);

    // Smooth daylight -> warm bedside lamp evening blend inside room
    vec3 roomCol = mix(nightCol, dayCol, smoothstep(0.05, 0.92, roomDayFactor));

    // When fully shaded in blackout mode, deepen overall room shadow while keeping bedside lamp warm
    float blackoutDarken = (1.0 - smoothstep(0.0, 0.45, roomDayFactor)) * (uMode < 0.5 ? 0.42 : 0.14);
    vec2 lampPos = vec2(0.155, 0.525);
    float distToLamp = length((vUv - lampPos) * vec2(1.79, 1.0));
    float lampKeep = exp(-distToLamp * 2.8);
    roomCol *= mix(1.0 - blackoutDarken, 1.06, lampKeep * (1.0 - roomDayFactor));

    // Dynamic floor & terrace sunlight shaft projected between the curtain edges
    float gapHalf = max(0.002, (uRightEdge - uLeftEdge) * 0.5);
    float gapCenter = (uLeftEdge + uRightEdge) * 0.5;
    float floorZone = smoothstep(0.02, 0.16, vUv.y) * (1.0 - smoothstep(0.32, 0.42, vUv.y));
    float slantOffset = (0.34 - vUv.y) * 0.14;
    float inBeam = 1.0 - smoothstep(gapHalf * 0.68, gapHalf * 1.24 + 0.045, abs(vUv.x - (gapCenter + slantOffset)));

    // Rhythmic louver sunlight stripes across the floor when louver mode is partially open
    float louverStripe = 1.0;
    if (uMode >= 1.5) {
      float bladeWave = 0.5 + 0.5 * cos((vUv.x - slantOffset * 0.6) * 190.0);
      louverStripe = mix(0.25, 1.0, smoothstep(0.35, 0.75, bladeWave + uOpenness * 0.5));
    }

    float shaftStrength = floorZone * inBeam * uOpenness * uDaylight * 0.32 * louverStripe;
    roomCol += uSunColor * shaftStrength * (0.45 + 0.55 * dot(dayCol, vec3(0.299, 0.587, 0.114)));

    // Subtle soft ambient contact shadow along bottom curtain sill & ceiling soffit under parked pockets
    float sillShadowDist = abs(vUv.y - 0.335);
    float nearFloor = exp(-sillShadowDist * 50.0);
    float leftCover = 1.0 - smoothstep(uLeftEdge - 0.015, uLeftEdge + 0.028, vUv.x);
    float rightCover = smoothstep(uRightEdge - 0.028, uRightEdge + 0.015, vUv.x);
    float coverMask = max(leftCover, rightCover) * step(0.175, vUv.x);
    roomCol *= 1.0 - nearFloor * coverMask * (0.32 + 0.20 * uDaylight);

    // Subtle daylight tint applied across bright exterior glass & room highlights
    vec3 extCol = mix(nightCol * 0.85, dayCol * mix(vec3(0.76, 0.82, 0.90), uSunColor, 0.58), clamp(uDaylight * 1.08, 0.18, 1.05));

    vec3 finalCol = mix(extCol, roomCol, fgMask);
    float alpha = uIsForeground > 0.5 ? fgMask : 1.0;
    gl_FragColor = vec4(finalCol, alpha);
  }
`;

const CURTAIN_VERTEX_SHADER = `
  uniform float uEdgeOuter;
  uniform float uEdgeInner;
  uniform float uTopV;
  uniform float uBottomV;
  uniform float uOpenness;
  uniform float uVelocity;
  uniform float uHemLag;
  uniform float uTime;
  uniform float uIsLeft;
  uniform float uMode; // 0 = dual blackout, 1 = sheer, 2 = louver
  uniform float uIsInnerSheer;

  varying vec2 vPanelUv;
  varying float vFoldHeight;
  varying float vFoldSlope;
  varying float vScreenU;
  varying float vScreenV;

  const float PI = 3.14159265359;

  void main() {
    // uv.x: 0 at outer wall anchor, 1 at inner leading edge
    // uv.y: 0 at floor hem, 1 at ceiling track
    float u = uv.x;
    float v = uv.y;

    float panelSpan = abs(uEdgeInner - uEdgeOuter);
    float pleats = uIsInnerSheer > 0.5 ? 18.5 : (uMode >= 1.5 ? 24.0 : 13.5);

    // Non-linear carrier accordion bunching: outer carriers stack more tightly near the wall pocket as panel opens
    float stackCompress = mix(0.0, 0.24, uOpenness) * (uMode >= 1.5 ? 0.3 : 1.0);
    float uBundled = mix(u, pow(u, 1.0 + stackCompress), 0.72);

    // Wave-fold pleat amplitude deepens organically as carriers gather together
    float stackFactor = mix(0.68, 1.48, uOpenness);
    float phase = uBundled * pleats * 2.0 * PI;

    float foldZ = 0.0;
    float foldSlope = 0.0;
    float catenaryDip = 0.0;

    if (uMode >= 1.5 && uIsInnerSheer < 0.5) {
      // Architectural vertical louvers: crisp flat blades angled smoothly with openness
      float localBlade = fract(u * pleats);
      float bladeCentered = localBlade - 0.5;
      float slatAngle = mix(0.15, 1.38, uOpenness);
      foldZ = bladeCentered * sin(slatAngle) * 0.042;
      foldSlope = cos(localBlade * PI) * 0.68;
    } else {
      // Multi-harmonic S-fold luxury drapery waves with natural floor-hem fullness & carrier catenary pinch
      float hemRelax = mix(1.09, 0.86, pow(v, 0.85));
      float carrierScallop = (1.0 - smoothstep(0.90, 1.0, v) * 0.16);
      float primaryWave = sin(phase);
      float secondaryPleat = 0.18 * sin(phase * 2.0 + 0.35);
      float microDrape = 0.06 * sin(phase * 3.0 - v * 1.35);

      foldZ = (primaryWave + secondaryPleat + microDrape) * 0.035 * stackFactor * hemRelax * carrierScallop;
      foldSlope = (cos(phase) + 0.36 * cos(phase * 2.0 + 0.35) + 0.18 * cos(phase * 3.0 - v * 1.35)) * (pleats / max(0.08, panelSpan)) * 0.046 * stackFactor;

      // Subtle downward catenary arc between top track carriers
      float carrierPinch = smoothstep(0.88, 1.0, v) * (1.0 - 0.5 * (1.0 + cos(phase)));
      catenaryDip = -carrierPinch * 0.0022 * (1.0 - uOpenness * 0.55);
    }

    // Progressive carrier pull tension wave + second-order bottom-hem pendulum inertia
    float dragFactor = pow(1.0 - v, 1.45) * smoothstep(0.04, 0.96, u);
    float sideSign = uIsLeft > 0.5 ? 1.0 : -1.0;
    float tensionWave = sin((1.0 - u) * 3.8) * abs(uVelocity) * 0.0075 * (uMode < 1.5 ? 1.0 : 0.0);
    float velDrag = clamp(uVelocity * sideSign * 0.042, -0.026, 0.026);
    float pendulumDrag = clamp(uHemLag * sideSign * 0.055, -0.032, 0.032);
    float inertiaShift = (velDrag + pendulumDrag) * dragFactor + tensionWave * sideSign * smoothstep(0.08, 0.92, u);

    // Gentle coastal air breeze only on fabric curtains when partially open
    float breezeAmp = (uMode < 1.5 ? 1.0 : 0.0) * smoothstep(0.05, 0.25, uOpenness) * (1.0 - smoothstep(0.84, 1.0, uOpenness));
    float breezeOffset = sin(u * 7.5 - uTime * 1.35 + v * 2.6 + (uIsLeft > 0.5 ? 0.0 : 1.7)) * 0.0048 * breezeAmp * pow(1.0 - v, 1.15) * smoothstep(0.18, 1.0, u);

    float screenU = mix(uEdgeOuter, uEdgeInner, uBundled) + inertiaShift + breezeOffset;
    float screenV = mix(uBottomV, uTopV, v) + catenaryDip;

    vPanelUv = uv;
    vFoldHeight = clamp(sin(phase) + 0.18 * sin(phase * 2.0 + 0.35), -1.1, 1.1);
    vFoldSlope = foldSlope;
    vScreenU = screenU;
    vScreenV = screenV;

    vec3 displaced = vec3(screenU, screenV, foldZ);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const CURTAIN_FRAGMENT_SHADER = `
  precision highp float;

  uniform sampler2D uFabricTex;
  uniform sampler2D uDayTex;
  uniform float uDaylight;
  uniform float uOpenness;
  uniform float uMode; // 0 = dual blackout, 1 = sheer, 2 = louver
  uniform float uIsInnerSheer;
  uniform float uIsLeft;
  uniform vec3 uSunColor;

  varying vec2 vPanelUv;
  varying float vFoldHeight;
  varying float vFoldSlope;
  varying float vScreenU;
  varying float vScreenV;

  void main() {
    // High-resolution woven textile sampling (UV tied to fabric panel so weave gathers naturally)
    vec2 texUv = vec2(vPanelUv.x * 8.5, vPanelUv.y * 5.2);
    vec3 weaveSample = texture2D(uFabricTex, texUv).rgb;
    float weaveLuma = dot(weaveSample, vec3(0.299, 0.587, 0.114));
    float microGrain = (weaveLuma - 0.72) * 1.45;

    // Compute 3D fold normal from analytical pleat slope + textile bump
    vec3 n = normalize(vec3(-vFoldSlope * 0.88 + microGrain * 0.13, 0.04, 1.0));
    vec3 viewDir = vec3(0.0, 0.0, 1.0);

    // Key sun direction streaming from center ocean window toward inner faces of folds
    float centerSide = uIsLeft > 0.5 ? 0.68 : -0.68;
    vec3 sunDir = normalize(vec3(centerSide, 0.28, 0.65));
    float sunWrap = max(0.0, dot(n, sunDir) * 0.72 + 0.28);

    // Micro-fiber woven half-vector sheen & Fresnel crest highlight
    vec3 halfVec = normalize(sunDir + viewDir);
    float specSheen = pow(max(dot(n, halfVec), 0.0), 10.0) * 0.11 * uDaylight;
    float fresnel = pow(clamp(1.0 - max(dot(n, viewDir), 0.0), 0.0, 1.0), 2.8);
    float crestExposure = smoothstep(-0.2, 0.85, vFoldHeight);
    vec3 fabricSheen = uSunColor * (fresnel * crestExposure * (0.14 + 0.22 * uDaylight) + specSheen * crestExposure);

    // Deep ambient occlusion inside pleat troughs & ceiling soffit recess pocket
    float foldAO = mix(0.46, 1.03, 0.5 + 0.5 * vFoldHeight);
    float soffitShadow = smoothstep(0.99, 0.87, vPanelUv.y);
    float floorBounce = mix(0.84, 1.0, smoothstep(0.0, 0.18, vPanelUv.y));

    // Leading edge sub-surface daylight scatter & rim highlight catching coastal light
    float leadingRim = smoothstep(0.82, 1.0, vPanelUv.x) * uDaylight * 0.24;
    float edgeScatter = smoothstep(0.88, 1.0, vPanelUv.x) * (0.08 + 0.12 * uDaylight);

    // Subtle interior warm ambient accent on left drape when shaded
    float lampMask = (uIsLeft > 0.5 ? 1.0 : 0.15) * (1.0 - smoothstep(0.0, 0.65, vPanelUv.x)) * (1.0 - uOpenness * 0.7);
    vec3 lampWarmth = vec3(0.95, 0.82, 0.68) * 0.14 * lampMask * (1.0 - uDaylight * 0.5);

    if (uIsInnerSheer > 0.5 || (uMode > 0.5 && uMode < 1.5)) {
      // Architectural Belgian Linen Sheer: translucent with soft exterior glow diffusion
      vec3 extOcean = texture2D(uDayTex, vec2(vScreenU, vScreenV)).rgb;
      vec3 linenBase = weaveSample * vec3(0.98, 0.96, 0.92);

      // Sun backlit translucency makes bright exterior sky/sea softly glow through thin folds
      float foldThickness = mix(0.40, 0.86, 0.5 - 0.5 * vFoldHeight);
      vec3 transmitted = extOcean * uSunColor * (0.52 + 0.52 * uDaylight) * (1.0 - foldThickness * 0.42);
      vec3 litLinen = linenBase * (0.34 + 0.68 * uDaylight) * sunWrap * foldAO;

      vec3 col = mix(litLinen, transmitted + litLinen * 0.40, 0.54) * mix(0.84, 1.0, soffitShadow) * floorBounce + fabricSheen * 0.6 + uSunColor * edgeScatter + lampWarmth;
      float alpha = uIsInnerSheer > 0.5 ? mix(0.46, 0.72, foldThickness) : mix(0.60, 0.85, foldThickness);
      gl_FragColor = vec4(col, alpha);
      return;
    }

    if (uMode >= 1.5) {
      // Precision Anodized Architectural Vertical Louver Blades
      float bladeCoord = fract(vPanelUv.x * 24.0);
      float openGap = smoothstep(0.18, 0.88, uOpenness) * 0.58;
      if (bladeCoord < openGap) {
        discard;
      }
      float bladeShade = smoothstep(openGap, 1.0, bladeCoord);
      vec3 louverCol = mix(vec3(0.16, 0.17, 0.20), vec3(0.36, 0.37, 0.40), bladeShade * (0.45 + 0.55 * uDaylight));
      louverCol += uSunColor * pow(bladeShade, 2.0) * 0.18 * uDaylight;
      louverCol *= mix(0.80, 1.0, soffitShadow) * floorBounce;
      gl_FragColor = vec4(louverCol, 0.97);
      return;
    }

    // Dual Mode Heavy Acoustic Blackout Drapery (Warm Architectural Stone-Taupe Charcoal)
    vec3 blackoutBase = mix(vec3(0.26, 0.24, 0.22), vec3(0.49, 0.46, 0.42), weaveLuma);
    float ambientBase = mix(0.20, 0.54, uDaylight * (0.35 + 0.65 * uOpenness));
    vec3 litDrape = blackoutBase * (ambientBase + sunWrap * uDaylight * 0.66) * foldAO;
    litDrape += uSunColor * (leadingRim * (0.5 + 0.5 * vFoldHeight) + edgeScatter * 0.45) + fabricSheen;
    litDrape += lampWarmth;
    litDrape *= mix(0.76, 1.0, soffitShadow) * floorBounce;

    gl_FragColor = vec4(litDrape, 1.0);
  }
`;

export function createCurtainSceneEngine(options: CurtainEngineOptions) {
  const {
    container,
    dayTextureUrl,
    nightTextureUrl,
    fabricTextureUrl,
    foregroundMaskUrl,
    initialState,
    onTelemetry,
  } = options;

  const isSoftwareGl = detectSoftwareWebGL();
  const renderer = new THREE.WebGLRenderer({
    antialias: !isSoftwareGl,
    powerPreference: 'high-performance',
    alpha: false,
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.setPixelRatio(isSoftwareGl ? 0.75 : Math.min(window.devicePixelRatio || 1, 2));

  const dom = renderer.domElement;
  dom.style.width = '100%';
  dom.style.height = '100%';
  dom.style.display = 'block';
  container.appendChild(dom);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, 1, 1, 0, -2, 2);

  const updateSize = () => {
    const w = Math.max(2, container.clientWidth);
    const h = Math.max(2, container.clientHeight);
    renderer.setSize(w, h, false);
  };
  updateSize();

  const textureLoader = new THREE.TextureLoader();
  const textures: THREE.Texture[] = [];

  const loadTex = (url: string, isColor: boolean, repeat = false) => {
    const tex = textureLoader.load(url, () => {
      needsRender = true;
    });
    tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    if (repeat) {
      tex.wrapS = THREE.MirroredRepeatWrapping;
      tex.wrapT = THREE.MirroredRepeatWrapping;
      tex.anisotropy = isSoftwareGl ? 1 : Math.min(8, renderer.capabilities.getMaxAnisotropy());
    } else {
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.generateMipmaps = false;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
    }
    textures.push(tex);
    return tex;
  };

  const dayTex = loadTex(dayTextureUrl, true);
  const nightTex = loadTex(nightTextureUrl, true);
  const fabricTex = loadTex(fabricTextureUrl, true, true);
  const maskTex = loadTex(foregroundMaskUrl, false);

  // Shared state & kinematics
  let targetOpenness = THREE.MathUtils.clamp(initialState.targetOpenness, 0, 1);
  let currentOpenness = targetOpenness;
  let velocity = 0;
  let hemLag = 0;
  let hemLagVel = 0;
  let daylight = THREE.MathUtils.clamp(initialState.daylightIntensity, 0.25, 1);
  let currentDaylight = daylight;
  let mode: ShadingMode = initialState.mode;
  let reducedMotion = initialState.reducedMotion;
  let targetSunColor = _colorScratch.set(initialState.sunColorHex).clone();
  let currentSunColor = targetSunColor.clone();

  const modeToFloat = (m: ShadingMode) => (m === 'dual' ? 0.0 : m === 'sheer' ? 1.0 : 2.0);

  // Layer 1: Background Room + Exterior Plate
  const roomGeo = new THREE.PlaneGeometry(1, 1);
  roomGeo.translate(0.5, 0.5, 0);

  const bgMat = new THREE.ShaderMaterial({
    vertexShader: ROOM_VERTEX_SHADER,
    fragmentShader: ROOM_FRAGMENT_SHADER,
    depthWrite: false,
    uniforms: {
      uDayTex: { value: dayTex },
      uNightTex: { value: nightTex },
      uMaskTex: { value: maskTex },
      uOpenness: { value: currentOpenness },
      uDaylight: { value: currentDaylight },
      uMode: { value: modeToFloat(mode) },
      uLeftEdge: { value: LEFT_OPEN_EDGE },
      uRightEdge: { value: RIGHT_OPEN_EDGE },
      uSunColor: { value: currentSunColor },
      uIsForeground: { value: 0.0 },
    },
  });
  const bgMesh = new THREE.Mesh(roomGeo, bgMat);
  bgMesh.position.z = -1.0;
  bgMesh.renderOrder = 0;
  scene.add(bgMesh);

  // Recessed Ceiling Track Hardware Bar
  const trackGeo = new THREE.PlaneGeometry(TRACK_RIGHT_WALL - TRACK_LEFT_WALL, 0.005);
  trackGeo.translate((TRACK_LEFT_WALL + TRACK_RIGHT_WALL) * 0.5, CURTAIN_TOP_V - 0.011, 0);
  const trackMat = new THREE.MeshBasicMaterial({
    color: 0x222834,
    transparent: true,
    opacity: 0.88,
  });
  const trackMesh = new THREE.Mesh(trackGeo, trackMat);
  trackMesh.position.z = 0.02;
  trackMesh.renderOrder = 1;
  scene.add(trackMesh);

  // Curtain Geometry (Normalized [0..1] X and [0..1] Y, transformed in vertex shader)
  const curtainGeo = new THREE.PlaneGeometry(1, 1, 72, 8);
  curtainGeo.translate(0.5, 0.5, 0);

  const makeCurtainMat = (isLeft: boolean, isInnerSheer: boolean) =>
    new THREE.ShaderMaterial({
      vertexShader: CURTAIN_VERTEX_SHADER,
      fragmentShader: CURTAIN_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: {
        uFabricTex: { value: fabricTex },
        uDayTex: { value: dayTex },
        uEdgeOuter: { value: isLeft ? TRACK_LEFT_WALL : TRACK_RIGHT_WALL },
        uEdgeInner: { value: isLeft ? LEFT_OPEN_EDGE : RIGHT_OPEN_EDGE },
        uTopV: { value: CURTAIN_TOP_V },
        uBottomV: { value: CURTAIN_BOTTOM_V },
        uOpenness: { value: currentOpenness },
        uVelocity: { value: 0 },
        uHemLag: { value: 0 },
        uTime: { value: 0 },
        uDaylight: { value: currentDaylight },
        uMode: { value: modeToFloat(mode) },
        uIsLeft: { value: isLeft ? 1.0 : 0.0 },
        uIsInnerSheer: { value: isInnerSheer ? 1.0 : 0.0 },
        uSunColor: { value: currentSunColor },
      },
    });

  // Inner Belgian Linen Sheer Layer (behind main blackout panels in 'dual' mode)
  const sheerGeo = new THREE.PlaneGeometry(1, 1, 56, 6);
  sheerGeo.translate(0.5, 0.5, 0);
  const leftSheerMat = makeCurtainMat(true, true);
  const rightSheerMat = makeCurtainMat(false, true);
  leftSheerMat.uniforms.uEdgeInner.value = TRACK_CENTER + 0.002;
  rightSheerMat.uniforms.uEdgeInner.value = TRACK_CENTER - 0.002;

  const leftSheerMesh = new THREE.Mesh(sheerGeo, leftSheerMat);
  leftSheerMesh.position.z = 0.04;
  leftSheerMesh.renderOrder = 2;
  const rightSheerMesh = new THREE.Mesh(sheerGeo, rightSheerMat);
  rightSheerMesh.position.z = 0.04;
  rightSheerMesh.renderOrder = 2;
  scene.add(leftSheerMesh, rightSheerMesh);

  // Main Draggable Blackout / Sheer / Louver Panels
  const leftPanelMat = makeCurtainMat(true, false);
  const rightPanelMat = makeCurtainMat(false, false);

  const leftPanelMesh = new THREE.Mesh(curtainGeo, leftPanelMat);
  leftPanelMesh.position.z = 0.14;
  leftPanelMesh.renderOrder = 3;
  const rightPanelMesh = new THREE.Mesh(curtainGeo, rightPanelMat);
  rightPanelMesh.position.z = 0.14;
  rightPanelMesh.renderOrder = 3;
  scene.add(leftPanelMesh, rightPanelMesh);

  // Layer 5: Foreground Room & Furniture Occlusion (Ceiling Soffit, Bed, Armchair, Floor)
  const fgMat = new THREE.ShaderMaterial({
    vertexShader: ROOM_VERTEX_SHADER,
    fragmentShader: ROOM_FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uDayTex: { value: dayTex },
      uNightTex: { value: nightTex },
      uMaskTex: { value: maskTex },
      uOpenness: { value: currentOpenness },
      uDaylight: { value: currentDaylight },
      uMode: { value: modeToFloat(mode) },
      uLeftEdge: { value: LEFT_OPEN_EDGE },
      uRightEdge: { value: RIGHT_OPEN_EDGE },
      uSunColor: { value: currentSunColor },
      uIsForeground: { value: 1.0 },
    },
  });
  const fgMesh = new THREE.Mesh(roomGeo, fgMat);
  fgMesh.position.z = 0.4;
  fgMesh.renderOrder = 5;
  scene.add(fgMesh);

  // Resize & visibility observers
  const initialRect = container.getBoundingClientRect();
  let inViewport =
    typeof window !== 'undefined'
      ? initialRect.top < window.innerHeight && initialRect.bottom > 0
      : true;
  const resizeObserver = new ResizeObserver(() => {
    updateSize();
    needsRender = true;
  });
  resizeObserver.observe(container);

  const intersectionObserver =
    typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(
          (entries) => {
            if (entries[0]) {
              const visible = entries[0].isIntersecting;
              if (visible && !inViewport) {
                needsRender = true;
                lastTime = performance.now();
              }
              inViewport = visible;
            }
          },
          { threshold: 0.05 }
        )
      : null;
  intersectionObserver?.observe(container);

  let disposed = false;
  let frameId = 0;
  let lastTime = performance.now();
  let elapsed = 0;
  let needsRender = true;
  let renderBusy = false;
  let lastSentOpenness = -1;
  let lastSentLeft = -1;
  let lastSentRight = -1;

  const updateUniforms = () => {
    const leftEdge = THREE.MathUtils.lerp(TRACK_CENTER + 0.002, LEFT_OPEN_EDGE, currentOpenness);
    const rightEdge = THREE.MathUtils.lerp(TRACK_CENTER - 0.002, RIGHT_OPEN_EDGE, currentOpenness);
    const mFloat = modeToFloat(mode);

    const showInnerSheer = mode === 'dual';
    leftSheerMesh.visible = showInnerSheer;
    rightSheerMesh.visible = showInnerSheer;
    if (showInnerSheer) {
      // Sheer stays softly drawn at low openness (filtered daylight) and parts cleanly to reveal full oceanfront view by 90%
      const sheerOpen = THREE.MathUtils.smoothstep(currentOpenness, 0.40, 0.90);
      leftSheerMat.uniforms.uEdgeInner.value = THREE.MathUtils.lerp(TRACK_CENTER + 0.002, LEFT_OPEN_EDGE - 0.012, sheerOpen);
      rightSheerMat.uniforms.uEdgeInner.value = THREE.MathUtils.lerp(TRACK_CENTER - 0.002, RIGHT_OPEN_EDGE + 0.012, sheerOpen);
      leftSheerMat.uniforms.uOpenness.value = sheerOpen;
      rightSheerMat.uniforms.uOpenness.value = sheerOpen;
      leftSheerMat.uniforms.uHemLag.value = hemLag * 0.65;
      rightSheerMat.uniforms.uHemLag.value = hemLag * 0.65;
      leftSheerMat.uniforms.uDaylight.value = currentDaylight;
      rightSheerMat.uniforms.uDaylight.value = currentDaylight;
      leftSheerMat.uniforms.uTime.value = elapsed;
      rightSheerMat.uniforms.uTime.value = elapsed;
      leftSheerMat.uniforms.uSunColor.value.copy(currentSunColor);
      rightSheerMat.uniforms.uSunColor.value.copy(currentSunColor);
    }

    for (const mat of [leftPanelMat, rightPanelMat]) {
      mat.uniforms.uOpenness.value = currentOpenness;
      mat.uniforms.uVelocity.value = velocity;
      mat.uniforms.uHemLag.value = hemLag;
      mat.uniforms.uTime.value = elapsed;
      mat.uniforms.uDaylight.value = currentDaylight;
      mat.uniforms.uMode.value = mFloat;
      mat.uniforms.uSunColor.value.copy(currentSunColor);
    }
    leftPanelMat.uniforms.uEdgeInner.value = leftEdge;
    rightPanelMat.uniforms.uEdgeInner.value = rightEdge;

    for (const mat of [bgMat, fgMat]) {
      mat.uniforms.uOpenness.value = currentOpenness;
      mat.uniforms.uDaylight.value = currentDaylight;
      mat.uniforms.uMode.value = mFloat;
      mat.uniforms.uLeftEdge.value = leftEdge;
      mat.uniforms.uRightEdge.value = rightEdge;
      mat.uniforms.uSunColor.value.copy(currentSunColor);
    }

    if (
      Math.abs(currentOpenness - lastSentOpenness) > 0.001 ||
      Math.abs(leftEdge - lastSentLeft) > 0.0008 ||
      Math.abs(rightEdge - lastSentRight) > 0.0008
    ) {
      lastSentOpenness = currentOpenness;
      lastSentLeft = leftEdge;
      lastSentRight = rightEdge;
      onTelemetry?.({
        currentOpenness,
        leftHandleNormalizedX: leftEdge,
        rightHandleNormalizedX: rightEdge,
      });
    }
  };

  function afterSoftwareDraw(cb: () => void) {
    const gl = renderer.getContext() as WebGL2RenderingContext;
    if (gl && typeof gl.fenceSync === 'function') {
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      let attempts = 0;
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        attempts += 1;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED && attempts < 24) {
          frameId = window.setTimeout(poll, 12);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 12);
    } else {
      frameId = window.setTimeout(cb, 80);
    }
  }

  const tick = (now: number) => {
    if (disposed) return;
    const rawDt = Math.max(0.001, (now - lastTime) / 1000);
    const dampDt = Math.min(0.28, rawDt);
    lastTime = now;
    elapsed += dampDt;

    // Smooth exponential spring-damped curtain kinematics
    const prevOpenness = currentOpenness;
    if (reducedMotion) {
      currentOpenness = targetOpenness;
      currentDaylight = daylight;
      currentSunColor.copy(targetSunColor);
    } else {
      currentOpenness = THREE.MathUtils.damp(currentOpenness, targetOpenness, 12.5, dampDt);
      if (Math.abs(targetOpenness - currentOpenness) < 0.0025) {
        currentOpenness = targetOpenness;
      }
      currentDaylight = THREE.MathUtils.damp(currentDaylight, daylight, 12.5, dampDt);
      currentSunColor.lerp(targetSunColor, 1 - Math.exp(-12.5 * dampDt));
    }

    const rawVel = (currentOpenness - prevOpenness) / dampDt;
    velocity = THREE.MathUtils.damp(velocity, rawVel, 12.5, dampDt);

    if (reducedMotion) {
      hemLag = 0;
      hemLagVel = 0;
    } else {
      // Sub-stepped second-order under-damped pendulum lag for bottom hem inertia
      const subSteps = Math.max(1, Math.ceil(dampDt / 0.02));
      const subDt = dampDt / subSteps;
      const targetLag = THREE.MathUtils.clamp(velocity * 0.42, -0.75, 0.75);
      for (let s = 0; s < subSteps; s += 1) {
        const springForce = (targetLag - hemLag) * 34.0 - hemLagVel * 7.2;
        hemLagVel += springForce * subDt;
        hemLag += hemLagVel * subDt;
      }
    }

    const sunColorDist =
      Math.abs(targetSunColor.r - currentSunColor.r) +
      Math.abs(targetSunColor.g - currentSunColor.g) +
      Math.abs(targetSunColor.b - currentSunColor.b);

    const hasBreeze =
      inViewport &&
      !reducedMotion &&
      mode !== 'louver' &&
      currentOpenness > 0.06 &&
      currentOpenness < 0.96;
    const isSettling =
      Math.abs(targetOpenness - currentOpenness) > 0.0008 ||
      Math.abs(velocity) > 0.003 ||
      Math.abs(hemLag) > 0.002 ||
      Math.abs(daylight - currentDaylight) > 0.002 ||
      sunColorDist > 0.004;

    if (inViewport && (isSettling || hasBreeze || needsRender)) {
      needsRender = false;
      updateUniforms();
      if (!renderBusy) {
        renderBusy = true;
        renderer.render(scene, camera);
        if (isSoftwareGl) {
          afterSoftwareDraw(() => {
            renderBusy = false;
            if (!disposed) frameId = requestAnimationFrame(tick);
          });
          return;
        }
        renderBusy = false;
      }
    }

    frameId = requestAnimationFrame(tick);
  };

  updateUniforms();
  frameId = requestAnimationFrame(tick);

  return {
    setState(next: Partial<CurtainEngineState>) {
      if (typeof next.targetOpenness === 'number') {
        targetOpenness = THREE.MathUtils.clamp(next.targetOpenness, 0, 1);
      }
      if (typeof next.daylightIntensity === 'number') {
        daylight = THREE.MathUtils.clamp(next.daylightIntensity, 0.25, 1);
      }
      if (typeof next.sunColorHex === 'string') {
        targetSunColor.set(next.sunColorHex);
      }
      if (next.mode) {
        mode = next.mode;
      }
      if (typeof next.reducedMotion === 'boolean') {
        reducedMotion = next.reducedMotion;
      }
      needsRender = true;
    },
    snapOpenness(openFrac: number) {
      const clamped = THREE.MathUtils.clamp(openFrac, 0, 1);
      const dt = 0.016;
      const instVel = (clamped - currentOpenness) / dt;
      targetOpenness = clamped;
      currentOpenness = clamped;
      velocity = THREE.MathUtils.lerp(velocity, THREE.MathUtils.clamp(instVel, -1.8, 1.8), 0.35);
      needsRender = true;
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      intersectionObserver?.disconnect();
      roomGeo.dispose();
      trackGeo.dispose();
      curtainGeo.dispose();
      sheerGeo.dispose();
      bgMat.dispose();
      fgMat.dispose();
      trackMat.dispose();
      leftSheerMat.dispose();
      rightSheerMat.dispose();
      leftPanelMat.dispose();
      rightPanelMat.dispose();
      textures.forEach((t) => t.dispose());
      renderer.dispose();
      if (dom.parentNode === container) {
        container.removeChild(dom);
      }
    },
  };
}
